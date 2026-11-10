import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Procedural render of the PULSE-Q receiver chip:
 * a column of grating antennas, a binary MZI mesh (N-1 nodes), a basis split
 * into four rails, edge couplers and a 127 µm PM fiber array.
 * Turbulent incoming light lands on the antennas and travels through the mesh.
 */

export type Callout = { id: string; position: THREE.Vector3 }
export type ChipLayout = 'hero' | 'panel'

const LASER = new THREE.Color('#ff3d1f')
const WARM = new THREE.Color('#ffd2b8')

function glowTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.18, 'rgba(255,255,255,0.75)')
  grd.addColorStop(0.45, 'rgba(255,255,255,0.18)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function gratingTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#1a1a1f'
  g.fillRect(0, 0, 128, 128)
  // focusing grating: concentric arcs
  g.strokeStyle = '#8a8a94'
  g.lineWidth = 3
  for (let r = 20; r < 170; r += 9) {
    g.beginPath()
    g.arc(-30, 64, r, -0.7, 0.7)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function dieTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = 1400
  c.height = 880
  const g = c.getContext('2d')!
  g.fillStyle = '#0f0f12'
  g.fillRect(0, 0, c.width, c.height)
  // faint fill pattern (dummy metal tiling)
  g.fillStyle = 'rgba(255,255,255,0.018)'
  for (let x = 0; x < c.width; x += 14) for (let y = 0; y < c.height; y += 14) if ((x + y) % 28 === 0) g.fillRect(x, y, 6, 6)
  // seal ring
  g.strokeStyle = 'rgba(201,164,92,0.35)'
  g.lineWidth = 6
  g.strokeRect(14, 14, c.width - 28, c.height - 28)
  g.strokeStyle = 'rgba(255,255,255,0.06)'
  g.lineWidth = 2
  g.strokeRect(30, 30, c.width - 60, c.height - 60)
  // die marking
  g.fillStyle = 'rgba(244,242,238,0.22)'
  g.font = '500 22px JetBrains Mono, monospace'
  g.fillText('PQ-RX-08   MZI-8   780 nm', 60, c.height - 52)
  g.fillText('PULSE-Q', c.width - 170, c.height - 52)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function sBend(a: THREE.Vector3, b: THREE.Vector3): THREE.CubicBezierCurve3 {
  const mx = (a.x + b.x) / 2
  return new THREE.CubicBezierCurve3(a, new THREE.Vector3(mx, a.y, a.z), new THREE.Vector3(mx, b.y, b.z), b)
}

type Pulse = { sprite: THREE.Sprite; path: THREE.CurvePath<THREE.Vector3> | null; t: number; speed: number }
type Photon = { target: number; phase: number; speed: number }

export class ChipScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.PerspectiveCamera
  group = new THREE.Group()
  callouts: Callout[] = []
  private disposed = false
  private clock = new THREE.Clock()
  private pulses: Pulse[] = []
  private photons: Photon[] = []
  private photonGeo!: THREE.BufferGeometry
  private antennaMats: THREE.MeshStandardMaterial[] = []
  private antennaHeat: number[] = []
  private antennaPos: THREE.Vector3[] = []
  private paths: THREE.CurvePath<THREE.Vector3>[][] = [] // [antenna][output]
  private nodeMats: THREE.MeshBasicMaterial[] = []
  private exitGlows: THREE.Sprite[] = []
  private pointer = new THREE.Vector2(0, 0)
  private pointerSmooth = new THREE.Vector2(0, 0)
  private glow = glowTexture()
  private spawnAcc = 0
  private composer!: EffectComposer
  private bloom!: UnrealBloomPass

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    this.scene.add(this.group)
    this.scene.background = new THREE.Color('#0a0a0b')
    this.scene.fog = new THREE.Fog('#0a0a0b', 14, 30)
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.22
    pmrem.dispose()
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.9, 0.55, 0.7)
    this.composer.addPass(this.bloom)
    this.composer.addPass(new OutputPass())
    this.build()
  }

  private build() {
    const g = this.group

    // lights
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.35))
    const key = new THREE.DirectionalLight('#fff4ea', 2.0)
    key.position.set(-4, 8, 5)
    this.scene.add(key)
    const rim = new THREE.PointLight(LASER, 1.6, 5, 2)
    rim.position.set(5.6, 1.4, -1.2)
    this.scene.add(rim)

    // substrate carrier (larger dark plate)
    const carrier = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.18, 6.2),
      new THREE.MeshStandardMaterial({ color: '#0c0c0e', roughness: 0.7, metalness: 0.4 }),
    )
    carrier.position.y = -0.2
    g.add(carrier)

    // die
    const W = 7, D = 4.4, T = 0.16
    const top = new THREE.MeshStandardMaterial({ map: dieTexture(), roughness: 0.55, metalness: 0.5 })
    const side = new THREE.MeshStandardMaterial({ color: '#1b1b20', roughness: 0.5, metalness: 0.5 })
    const die = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), [side, side, top, side, side, side])
    die.position.y = -T / 2 + 0.001
    g.add(die)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(W, T, D)),
      new THREE.LineBasicMaterial({ color: '#3a3a40', transparent: true, opacity: 0.8 }),
    )
    edges.position.copy(die.position)
    g.add(edges)

    const y = 0.006
    // geometry of the mesh
    const N = 8
    const ant = Array.from({ length: N }, (_, i) => new THREE.Vector3(-2.6, y, -1.4 + 0.4 * i))
    const L1 = [0, 1, 2, 3].map((k) => new THREE.Vector3(-1.45, y, (ant[2 * k].z + ant[2 * k + 1].z) / 2))
    const L2 = [0, 1].map((k) => new THREE.Vector3(-0.35, y, (L1[2 * k].z + L1[2 * k + 1].z) / 2))
    const L3 = new THREE.Vector3(0.7, y, 0)
    const S = [new THREE.Vector3(1.55, y, -0.45), new THREE.Vector3(1.55, y, 0.45)]
    const O = [-0.675, -0.225, 0.225, 0.675].map((z) => new THREE.Vector3(2.45, y, z))
    const E = O.map((o) => new THREE.Vector3(3.5, y, o.z * 0.6))
    const F = E.map((_e, j) => new THREE.Vector3(9.5, y - 0.35, (j - 1.5) * 0.55))
    this.antennaPos = ant

    const guideMat = new THREE.MeshStandardMaterial({ color: '#4c4c55', emissive: '#2a1612', roughness: 0.3, metalness: 0.2 })
    const segCache = new Map<string, THREE.Curve<THREE.Vector3>>()
    const seg = (a: THREE.Vector3, b: THREE.Vector3, key: string, straight = false) => {
      if (segCache.has(key)) return segCache.get(key)!
      const c: THREE.Curve<THREE.Vector3> = straight ? new THREE.LineCurve3(a, b) : sBend(a, b)
      segCache.set(key, c)
      g.add(new THREE.Mesh(new THREE.TubeGeometry(c as THREE.Curve<THREE.Vector3>, 40, 0.014, 6, false), guideMat))
      return c
    }

    // build paths antenna -> output
    for (let i = 0; i < N; i++) {
      const k1 = Math.floor(i / 2), k2 = Math.floor(i / 4)
      const row: THREE.CurvePath<THREE.Vector3>[] = []
      for (let j = 0; j < 4; j++) {
        const s = Math.floor(j / 2)
        const p = new THREE.CurvePath<THREE.Vector3>()
        p.add(seg(ant[i], L1[k1], `a${i}`))
        p.add(seg(L1[k1], L2[k2], `l1${k1}`))
        p.add(seg(L2[k2], L3, `l2${k2}`))
        p.add(seg(L3, S[s], `s${s}`))
        p.add(seg(S[s], O[j], `o${j}`))
        p.add(seg(O[j], E[j], `e${j}`))
        p.add(seg(E[j], F[j], `f${j}`, false))
        row.push(p)
      }
      this.paths.push(row)
    }

    // antennas
    const gTex = gratingTexture()
    for (let i = 0; i < N; i++) {
      const m = new THREE.MeshStandardMaterial({ map: gTex, emissive: LASER.clone(), emissiveIntensity: 0, roughness: 0.25, metalness: 0.7 })
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.3), m)
      a.position.set(ant[i].x - 0.15, 0.01, ant[i].z)
      g.add(a)
      this.antennaMats.push(m)
      this.antennaHeat.push(0)
    }
    // micro-lens array hint above the antennas
    const lensMat = new THREE.MeshStandardMaterial({ color: '#dfe6ee', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18 })
    for (let i = 0; i < N; i++) {
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), lensMat)
      lens.scale.y = 0.45
      lens.position.set(ant[i].x - 0.15, 0.55, ant[i].z)
      g.add(lens)
    }
    const lensFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.46, 0.04, 3.3)),
      new THREE.LineBasicMaterial({ color: '#55555c', transparent: true, opacity: 0.6 }),
    )
    lensFrame.position.set(ant[0].x - 0.15, 0.54, 0)
    g.add(lensFrame)

    // MZI nodes: two arms + gold heater pad, with traces to bond pads
    const gold = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.35, metalness: 1 })
    const traceMat = new THREE.LineBasicMaterial({ color: '#c9a45c', transparent: true, opacity: 0.28 })
    const tracePts: THREE.Vector3[] = []
    const nodes = [...L1, ...L2, L3]
    nodes.forEach((n, idx) => {
      const heater = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, 0.07), gold)
      heater.position.set(n.x + 0.32, 0.012, n.z)
      g.add(heater)
      const nm = new THREE.MeshBasicMaterial({ color: LASER, transparent: true, opacity: 0.0 })
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.085, 24), nm)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(n.x, 0.014, n.z)
      g.add(ring)
      this.nodeMats.push(nm)
      // trace to nearest long edge
      const edgeZ = n.z <= 0 ? -1.95 : 1.95
      const px = -2.9 + idx * 0.62
      tracePts.push(new THREE.Vector3(n.x + 0.32, 0.008, n.z), new THREE.Vector3(n.x + 0.32, 0.008, (n.z + edgeZ) / 2))
      tracePts.push(new THREE.Vector3(n.x + 0.32, 0.008, (n.z + edgeZ) / 2), new THREE.Vector3(px, 0.008, (n.z + edgeZ) / 2 + (edgeZ > 0 ? 0.25 : -0.25)))
      tracePts.push(new THREE.Vector3(px, 0.008, (n.z + edgeZ) / 2 + (edgeZ > 0 ? 0.25 : -0.25)), new THREE.Vector3(px, 0.008, edgeZ))
    })
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tracePts), traceMat))
    // bond pads
    const padGeo = new THREE.BoxGeometry(0.16, 0.014, 0.16)
    for (let x = -3.1; x <= 3.11; x += 0.31) {
      for (const z of [-2.02, 2.02]) {
        const p = new THREE.Mesh(padGeo, gold)
        p.position.set(x, 0.007, z)
        g.add(p)
      }
    }

    // fiber array block (glass V-groove) and fibers
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.32, 1.6),
      new THREE.MeshStandardMaterial({ color: '#cfd6dc', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.35 }),
    )
    block.position.set(3.85, 0.0, 0)
    g.add(block)
    const fiberMat = new THREE.MeshStandardMaterial({ color: '#d9d4c7', roughness: 0.45, metalness: 0.05 })
    E.forEach((e, j) => {
      const c = new THREE.CubicBezierCurve3(
        new THREE.Vector3(4.2, 0.0, e.z),
        new THREE.Vector3(6.0, 0.0, e.z),
        new THREE.Vector3(7.0, -0.35, F[j].z),
        new THREE.Vector3(11, -0.35, F[j].z),
      )
      g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.035, 10, false), fiberMat))
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: LASER, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
      s.position.set(3.5, 0.02, e.z)
      s.scale.setScalar(0.5)
      g.add(s)
      this.exitGlows.push(s)
    })

    // pulses
    for (let i = 0; i < 90; i++) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glow, color: LASER.clone().multiplyScalar(3.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      )
      s.visible = false
      s.scale.setScalar(0.22)
      g.add(s)
      this.pulses.push({ sprite: s, path: null, t: 0, speed: 0 })
    }

    // incoming photons
    const P = 900
    this.photonGeo = new THREE.BufferGeometry()
    const pos = new Float32Array(P * 3)
    const col = new Float32Array(P * 3)
    for (let i = 0; i < P; i++) {
      this.photons.push({ target: i % N, phase: Math.random(), speed: 0.12 + Math.random() * 0.12 })
    }
    this.photonGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.photonGeo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pm = new THREE.PointsMaterial({
      size: 0.09,
      map: this.glow,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    g.add(new THREE.Points(this.photonGeo, pm))

    // floor glow
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ map: this.glow, color: '#3a1208', transparent: true, opacity: 0.55, depthWrite: false }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(0.5, -0.32, 0)
    g.add(floor)

    this.callouts = [
      { id: 'antenna', position: new THREE.Vector3(-2.75, 0.6, -1.7) },
      { id: 'mesh', position: new THREE.Vector3(-0.35, 0.05, -0.8) },
      { id: 'basis', position: new THREE.Vector3(1.55, 0.05, 0.45) },
      { id: 'fiber', position: new THREE.Vector3(4.6, 0.1, 0.9) },
    ]
  }

  setPointer(x: number, y: number) {
    this.pointer.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1))
  }

  resize(w: number, h: number, layout: ChipLayout = 'hero') {
    this.renderer.setSize(w, h, false)
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.composer.setSize(w, h)
    this.bloom.resolution.set(w / 2, h / 2)
    this.camera.aspect = w / h
    const wide = w / h > 1.15
    // identical framing to the hero; the panel slides camera and target together
    // so the chip is centered without changing the viewing angle
    this.group.scale.setScalar(wide ? 0.7 : 0.62)
    this.group.position.set(wide ? 2.5 : 0.6, wide ? 0 : 1.6, wide ? 0.4 : -1.2)
    this.camera.fov = wide ? 32 : 44
    const shift = layout === 'panel' ? (wide ? new THREE.Vector3(2.0, 0, 0) : new THREE.Vector3(0.2, 0.9, 0)) : new THREE.Vector3()
    this.camera.position.set(-1.5, 5.6, 10.5).add(shift)
    this.camera.lookAt(new THREE.Vector3(wide ? 0.6 : 0.4, wide ? 0.6 : 0.2, 0).add(shift))
    this.camera.updateProjectionMatrix()
  }

  private spawnPulse(antenna: number) {
    const p = this.pulses.find((q) => !q.path)
    if (!p) return
    p.path = this.paths[antenna][Math.floor(Math.random() * 4)]
    p.t = 0
    p.speed = 0.09 + Math.random() * 0.04
    p.sprite.visible = true
  }

  update(dt: number, time: number) {
    // pointer parallax
    this.pointerSmooth.lerp(this.pointer, 1 - Math.pow(0.001, dt))
    this.group.rotation.y = -0.42 + this.pointerSmooth.x * 0.1 + Math.sin(time * 0.15) * 0.03
    this.group.rotation.x = this.pointerSmooth.y * 0.05

    // photons: scattered column converging on each antenna
    const pos = this.photonGeo.attributes.position as THREE.BufferAttribute
    const col = this.photonGeo.attributes.color as THREE.BufferAttribute
    const c = new THREE.Color()
    this.photons.forEach((ph, i) => {
      ph.phase += ph.speed * dt
      if (ph.phase >= 1) {
        ph.phase -= 1
        ph.target = Math.floor(Math.random() * this.antennaPos.length)
        this.antennaHeat[ph.target] = Math.min(1, this.antennaHeat[ph.target] + 0.25)
        this.spawnAcc += 1
        if (this.spawnAcc > 2.5) {
          this.spawnAcc = 0
          this.spawnPulse(ph.target)
        }
      }
      const a = this.antennaPos[ph.target]
      const u = ph.phase
      const h = (1 - u) * 5.2 + 0.02
      // turbulence: spread shrinks as light approaches the lenslets
      const spread = Math.pow(1 - u, 1.6) * 2.4
      const seed = i * 12.9898
      const wx = Math.sin(seed + time * 0.6) * spread + Math.sin(seed * 0.37 + u * 6) * spread * 0.4
      const wz = Math.cos(seed * 1.3 + time * 0.5) * spread + Math.cos(seed * 0.71 + u * 5) * spread * 0.4
      pos.setXYZ(i, a.x - 0.15 + wx - (1 - u) * 0.6, h, a.z + wz)
      const fade = Math.min(1, u * 3) * (u > 0.97 ? (1 - u) / 0.03 : 1)
      c.copy(WARM).lerp(LASER, u).multiplyScalar(fade * 0.9)
      col.setXYZ(i, c.r, c.g, c.b)
    })
    pos.needsUpdate = true
    col.needsUpdate = true

    this.antennaMats.forEach((m, i) => {
      this.antennaHeat[i] *= Math.pow(0.04, dt)
      m.emissiveIntensity = 0.2 + this.antennaHeat[i] * 2.2
    })

    // pulses through the mesh
    const exitHeat = [0, 0, 0, 0]
    for (const p of this.pulses) {
      if (!p.path) continue
      p.t += p.speed * dt
      if (p.t >= 1) {
        p.path = null
        p.sprite.visible = false
        continue
      }
      const pt = p.path.getPointAt(p.t)
      p.sprite.position.copy(pt)
      const onChip = pt.x < 3.5
      const sm = p.sprite.material as THREE.SpriteMaterial
      sm.opacity = onChip ? 1 : Math.max(0, 1 - (pt.x - 3.5) / 5)
      p.sprite.scale.setScalar(onChip ? 0.22 : 0.3)
      if (pt.x > 3.2 && pt.x < 3.8) {
        const j = Math.round((pt.z / 0.6 + 0.675) / 0.45)
        if (j >= 0 && j < 4) exitHeat[j] += 1
      }
    }
    this.exitGlows.forEach((s, j) => {
      const m = s.material as THREE.SpriteMaterial
      m.opacity += (Math.min(1, exitHeat[j] * 0.7) - m.opacity) * Math.min(1, dt * 8)
    })
    this.nodeMats.forEach((m, i) => {
      m.opacity = 0.35 + 0.35 * Math.sin(time * 2 + i * 0.9)
    })
  }

  frame() {
    if (this.disposed) return
    const dt = Math.min(this.clock.getDelta(), 0.05)
    this.update(dt, this.clock.elapsedTime)
    this.composer.render(dt)
  }

  /** Advance the simulation without animation, for reduced motion. */
  settle() {
    for (let i = 0; i < 240; i++) this.update(1 / 60, i / 60)
    this.composer.render()
  }

  project(v: THREE.Vector3, w: number, h: number) {
    const p = v.clone()
    this.group.localToWorld(p)
    p.project(this.camera)
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, visible: p.z < 1 }
  }

  dispose() {
    this.disposed = true
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose?.()
    })
    this.composer.dispose()
    this.renderer.dispose()
  }
}
