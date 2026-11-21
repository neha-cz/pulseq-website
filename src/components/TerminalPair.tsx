import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { MaskLines, Reveal, SectionLabel, ease } from './motion'

/*
 * PULSE-Q terminal pair, after the Master Design Compendium:
 * Figure 6 (Source box) and Figure 7 (Receiver box), with block descriptions
 * from sections 5.1 and 6. Particles follow the real signal chain.
 */

const C = {
  ink2: '#0b0912',
  line: '#231c34',
  line2: '#3a2e58',
  bone: '#f4f1fb',
  fog: '#aba5bd',
  ash: '#726b86',
  accent: '#8b3ff0',
  accent2: '#b9a3e8',
  lilac: '#d9d2f0',
  sky: '#a9c4f5',
}
const NS = 'http://www.w3.org/2000/svg'

type Pt = [number, number]
type BlockDef = { id: string; x: number; y: number; w?: number; h?: number; title: string; sub: string; dashed?: boolean }
type Detail = { name: string; detail: string; test: string }

/* ---------- geometry helpers ---------- */

function measure(pts: Pt[]) {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return cum
}
function at(pts: Pt[], cum: number[], d: number): Pt {
  const total = cum[cum.length - 1]
  const s = Math.max(0, Math.min(total, d))
  let i = 1
  while (i < cum.length - 1 && cum[i] < s) i++
  const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]
}
/** distance along a route at which it first reaches x on row y */
function distTo(pts: Pt[], cum: number[], x: number, y: number) {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    if (y0 === y && y1 === y && (x - x0) * (x - x1) <= 0) return cum[i - 1] + Math.abs(x - x0)
  }
  return Infinity
}
const poly = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const e = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v))
  return e
}

/* ---------- shared drawing ---------- */

function Block({ b, selected, onSelect }: { b: BlockDef; selected: boolean; onSelect: (id: string) => void }) {
  const w = b.w ?? 140
  const h = b.h ?? 60
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${b.title}: show details`}
      aria-pressed={selected}
      className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[#b9a3e8]"
      onClick={() => onSelect(b.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(b.id)
        }
      }}
    >
      <rect
        x={b.x - w / 2}
        y={b.y - h / 2}
        width={w}
        height={h}
        rx="9"
        fill={selected ? '#1a1230' : C.ink2}
        fillOpacity={0.88}
        stroke={selected ? C.accent : C.line2}
        strokeWidth={selected ? 1.6 : 1}
        strokeDasharray={b.dashed ? '4 4' : undefined}
        className="transition-colors"
      />
      <text x={b.x} y={b.y - 4} textAnchor="middle" fontSize="13" fontWeight="500" fill={C.bone}>
        {b.title}
      </text>
      <text x={b.x} y={b.y + 14} textAnchor="middle" fontSize="9.5" letterSpacing="0.6" fill={C.fog} className="font-mono">
        {b.sub}
      </text>
    </g>
  )
}

function Wire({ d, kind = 'fiber', label, lx, ly }: { d: string; kind?: 'pm' | 'fiber' | 'beam' | 'control' | 'monitor' | 'beacon'; label?: string; lx?: number; ly?: number }) {
  const style: Record<string, { stroke: string; width: number; dash?: string; op: number }> = {
    pm: { stroke: C.accent2, width: 2.4, op: 0.45 },
    fiber: { stroke: C.line2, width: 2.4, op: 1 },
    beam: { stroke: C.accent, width: 1.6, dash: '6 6', op: 0.9 },
    control: { stroke: C.ash, width: 1.1, dash: '2 4', op: 0.9 },
    monitor: { stroke: C.ash, width: 1.1, dash: '7 5', op: 0.9 },
    beacon: { stroke: C.sky, width: 1.4, dash: '3 5', op: 0.7 },
  }
  const s = style[kind]
  return (
    <g>
      <path d={d} fill="none" stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} strokeOpacity={s.op} />
      {label && (
        <text x={lx} y={ly} fontSize="9" letterSpacing="0.8" fill={C.ash} className="font-mono">
          {label}
        </text>
      )}
    </g>
  )
}

function DetailCard({ d }: { d: Detail }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={d.name}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3, ease }}
        className="grid gap-4 border-t border-line pt-5 md:grid-cols-12"
        aria-live="polite"
      >
        <h4 className="text-[20px] font-medium tracking-[-0.02em] md:col-span-3">{d.name}</h4>
        <p className="text-[15px] leading-relaxed text-fog md:col-span-6">{d.detail}</p>
        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-ash md:col-span-3">
          <span className="block text-accent-2">Interfaces and tests</span>
          {d.test}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

function useRunning(ref: React.RefObject<Element | null>) {
  const inView = useInView(ref, { margin: '10% 0px' })
  const reduce = useReducedMotion()
  return { inView, reduce }
}

/* ---------- SOURCE ---------- */

const SRC_BLOCKS: BlockDef[] = [
  { id: 'ref', x: 100, y: 56, w: 140, title: '10 MHz + PPS', sub: 'reference in' },
  { id: 'pll', x: 270, y: 56, w: 140, title: '100 MHz PLL', sub: 'clock to FPGA' },
  { id: 'fpga', x: 560, y: 56, w: 300, title: 'Source FPGA', sub: 'trigger · drive 1 · drive 2 · tags' },
  { id: 'qrng', x: 860, y: 56, w: 140, title: 'QRNG', sub: 'state + intensity' },
  { id: 'dfb', x: 100, y: 200, title: '780 nm DFB', sub: 'gain-switched 100 MHz' },
  { id: 'iso1', x: 280, y: 200, title: 'PM isolator', sub: 'after the laser' },
  { id: 'im', x: 460, y: 200, title: 'Sagnac IM', sub: '0 or Vπ → μ1, μ2' },
  { id: 'iso2', x: 640, y: 200, title: 'PM isolator', sub: 'stops back-flow' },
  { id: 'enc', x: 820, y: 200, title: 'Sagnac encoder', sub: 'iPOGNAC · D R A L' },
  { id: 'tap', x: 1010, y: 200, title: '99:1 tap + PD', sub: 'pulse energy' },
  { id: 'isox2', x: 130, y: 380, title: 'Isolators ×2', sub: 'counted, low PDL' },
  { id: 'att', x: 315, y: 380, w: 160, title: 'Attenuator', sub: '55–60 dB + 780 nm filter' },
  { id: 'otap', x: 495, y: 380, title: 'Output tap', sub: '2×2 · 99:1' },
  { id: 'guard', x: 652, y: 380, w: 112, title: 'Exit guard', sub: 'sacrificial' },
  { id: 'patch', x: 830, y: 380, w: 120, title: 'Patch panel', sub: 'one input active' },
  { id: 'fs', x: 1040, y: 330, w: 150, h: 54, title: 'Free-space head', sub: 'QWP–QWP–HWP' },
  { id: 'fiber', x: 1040, y: 432, w: 150, h: 54, title: 'Fiber port', sub: 'FC/APC 780HP' },
]

const SRC_DETAIL: Record<string, Detail> = {
  ref: { name: 'Reference', detail: 'A 10 MHz and PPS reference, from the link or from GNSS, disciplines the source clock.', test: 'Jitter, holdover, lock status' },
  pll: { name: '100 MHz PLL', detail: 'Locks to the reference and clocks the FPGA, so the laser trigger and both drive lanes share one timebase with budgeted skew.', test: 'Jitter, lock status, lane skew' },
  fpga: { name: 'Source FPGA', detail: 'Fires the laser trigger and two drive codes, one for intensity and one for polarization. It also reads the pulse-energy photodiode, the monitor SPAD time tags, and the interlock status, and keeps the session record.', test: 'Skew between codes, buffering' },
  qrng: { name: 'QRNG', detail: 'A quantum random number generator, or a buffer pre-filled from one, chooses the intensity and the polarization state of every pulse. A PRNG is used for prototypes only.', test: 'Health tests, rate, buffering' },
  dfb: { name: '780 nm DFB laser', detail: 'Gain-switched at 100 MHz into PM780-HP fiber, with its own TEC zone and a hardware interlock input that the watchdog can trip.', test: 'Pulse width, chirp, per-pulse energy, phase randomness' },
  iso1: { name: 'PM isolator', detail: 'The first of two PM isolators, placed after the laser to keep light from flowing back into it.', test: 'Isolation, PER' },
  im: { name: 'Sagnac intensity modulator', detail: 'RF driver 1 applies 0 or Vπ to select one of two intensities, μ1 or μ2, for decoy-state BB84. One fiber-pigtailed LiNbO₃ phase modulator sits inside the Sagnac loop.', test: 'Extinction, μ2/μ1 ratio, drift' },
  iso2: { name: 'PM isolator', detail: 'The second PM isolator, after the intensity modulator, stops back-flow from the polarization encoder.', test: 'Isolation, PER' },
  enc: { name: 'Sagnac polarization encoder', detail: 'An iPOGNAC-type encoder driven by RF driver 2 writes one of four states onto each pulse: D, R, A, or L. D/A and R/L are two mutually unbiased bases, which together form a BB84 pair.', test: 'State fidelity, leakage, drive levels' },
  tap: { name: '99:1 tap + fast PD', detail: 'Sends 1% of the light to a fast photodiode that measures pulse energy per state and feeds drive trims back to the FPGA.', test: 'Calibration, bandwidth' },
  isox2: { name: 'Isolators ×2', detail: 'Two polarization-independent, low-PDL isolators. These are the isolators counted in the isolation budget.', test: 'Isolation (dB), PDL' },
  att: { name: 'Attenuator + 780 nm filter', detail: 'About 55–60 dB of fixed attenuation brings each pulse down to the single-photon level, followed by a 780 nm fiber band-pass filter.', test: 'Attenuation, spectral rejection' },
  otap: { name: 'Output tap 2×2 (99:1)', detail: 'The reverse 1% feeds a watchdog that trips the laser through a hardware interlock independent of firmware. The forward 1% feeds a monitor SPAD that returns μ per state to the FPGA.', test: 'Tap ratio, watchdog threshold' },
  guard: { name: 'Exit guard and output plane', detail: 'A sacrificial isolator kept out of the isolation budget. The output plane after it is where μ1 and μ2 are defined and calibrated, and it is the security boundary of the source.', test: 'Inspection, μ calibration at the plane' },
  patch: { name: 'Patch panel', detail: 'A manual patch with exactly one input active. It routes the source output to the free-space branch or the fiber port, and a relay-fiber input disables the laser path.', test: 'Repeatability, loss, interlock state' },
  fs: { name: 'Free-space branch', detail: 'A collimator, then QWP–QWP–HWP polarization compensation, then the optical head. Compensation settings are recorded with every session.', test: 'Beam datum, compensation record' },
  fiber: { name: 'Fiber port', detail: '780HP single-mode fiber with FC/APC connectors. Telecom fiber is multimode at 780 nm, so links use 780HP, at roughly 3 to 4 dB per km.', test: 'Loss, return loss' },
}

const SRC_MAIN: Pt[] = [
  [24, 200],
  [1130, 200],
  [1130, 290],
  [40, 290],
  [40, 380],
  [920, 380],
]
const SRC_FS: Pt[] = [[920, 380], [945, 380], [945, 330], [1110, 330]]
const SRC_FIB: Pt[] = [[920, 380], [945, 380], [945, 432], [1110, 432]]

const STATES = ['D', 'A', 'R', 'L'] as const
type State = (typeof STATES)[number]

function glyph(state: State, weak: boolean) {
  const g = el('g', {})
  const sw = weak ? 1 : 1.5
  if (state === 'D' || state === 'A') {
    const a = state === 'D' ? -45 : 45
    g.appendChild(el('line', { x1: -9, y1: 0, x2: 9, y2: 0, stroke: C.lilac, 'stroke-width': sw, transform: `rotate(${a})` }))
  } else {
    g.appendChild(el('circle', { r: 8, fill: 'none', stroke: C.lilac, 'stroke-width': sw, 'stroke-dasharray': '10 5' }))
  }
  return g
}

function SourceDiagram() {
  const wrap = useRef<HTMLDivElement>(null)
  const layer = useRef<SVGGElement>(null)
  const { inView, reduce } = useRunning(wrap)
  const [sel, setSel] = useState('dfb')

  useEffect(() => {
    const g = layer.current
    if (!g || reduce || !inView) return
    const routes = [SRC_MAIN.concat(SRC_FS.slice(1)), SRC_MAIN.concat(SRC_FIB.slice(1))].map((pts) => ({ pts, cum: measure(pts) }))
    const r0 = routes[0]
    const dIM = distTo(r0.pts, r0.cum, 460, 200)
    const dENC = distTo(r0.pts, r0.cum, 820, 200)
    const dATT = distTo(r0.pts, r0.cum, 315, 380)
    type P = { node: SVGGElement; dot: SVGCircleElement; mark: SVGGElement | null; r: (typeof routes)[number]; d: number; hi: boolean; s: State; phase: number }
    const ps: P[] = []
    let raf = 0
    let last = performance.now()
    let acc = 0
    const SPEED = 300
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      acc += dt
      if (acc > 0.42) {
        acc = 0
        const node = el('g', {})
        const dot = el('circle', { r: 5, fill: C.lilac })
        node.appendChild(dot)
        g.appendChild(node)
        ps.push({ node, dot, mark: null, r: routes[Math.random() < 0.5 ? 0 : 1], d: 0, hi: Math.random() < 0.7, s: STATES[Math.floor(Math.random() * 4)], phase: Math.random() * 6 })
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.d += SPEED * dt
        const total = p.r.cum[p.r.cum.length - 1]
        if (p.d >= total) {
          p.node.remove()
          ps.splice(i, 1)
          continue
        }
        const [x, y] = at(p.r.pts, p.r.cum, p.d)
        p.node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
        const weak = p.d >= dATT
        let rad = 5
        if (p.d >= dIM) rad = p.hi ? 5.5 : 3.2
        if (weak) rad = 2.1
        p.dot.setAttribute('r', String(rad))
        p.dot.setAttribute('fill', weak ? C.accent2 : p.d >= dIM ? C.lilac : '#ffffff')
        p.dot.setAttribute('opacity', weak ? '0.75' : '1')
        if (p.d >= dENC && !p.mark) {
          p.mark = glyph(p.s, false)
          p.node.appendChild(p.mark)
        }
        if (p.mark) {
          if (weak && !p.mark.dataset.weak) {
            p.mark.remove()
            p.mark = glyph(p.s, true)
            p.mark.dataset.weak = '1'
            p.mark.setAttribute('opacity', '0.6')
            p.node.appendChild(p.mark)
          }
          if (p.s === 'R' || p.s === 'L') {
            const spin = ((now / 1000) * 220 + p.phase * 50) * (p.s === 'R' ? 1 : -1)
            ;(p.mark.firstChild as SVGElement).setAttribute('transform', `rotate(${spin.toFixed(1)})`)
          }
        }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ps.forEach((p) => p.node.remove())
    }
  }, [inView, reduce])

  return (
    <div ref={wrap}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ash sm:hidden">Swipe to follow the full chain →</p>
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 1200 470" className="h-auto w-full min-w-[920px]" role="group" aria-label="Source terminal signal chain. Select a block for details.">
          {/* control plane */}
          <Wire d="M170 56 H200" kind="control" />
          <Wire d="M340 56 H410" kind="control" />
          <Wire d="M790 56 H710" kind="control" />
          <Wire d="M430 86 V122 H100 V170" kind="control" label="trigger" lx={112} ly={116} />
          <Wire d="M460 86 V170" kind="control" label="drive 1" lx={468} ly={130} />
          <Wire d="M650 86 V142 H820 V170" kind="control" label="drive 2" lx={760} ly={136} />
          <Wire d="M1010 170 V116 H690 V86" kind="monitor" label="pulse energy" lx={880} ly={110} />
          {/* optical path: PM fiber to the encoder, then 780HP */}
          <Wire d={poly([[24, 200], [890, 200]])} kind="pm" />
          <Wire d={poly([[890, 200], [1130, 200], [1130, 290], [40, 290], [40, 380], [920, 380]])} />
          <Wire d={poly(SRC_FS)} kind="beam" />
          <Wire d={poly(SRC_FIB)} />
          {/* output plane: the security boundary */}
          <line x1="736" y1="326" x2="736" y2="452" stroke={C.accent} strokeWidth="1.4" strokeDasharray="5 5" />
          <text x="736" y="318" textAnchor="middle" fontSize="9" letterSpacing="1" fill={C.accent2} className="font-mono">
            OUTPUT PLANE · μ DEFINED
          </text>
          <text x="495" y="434" textAnchor="middle" fontSize="9" letterSpacing="0.8" fill={C.ash} className="font-mono">
            ↙ watchdog · monitor SPAD ↘
          </text>
          <g ref={layer} pointerEvents="none" />
          {SRC_BLOCKS.map((b) => (
            <Block key={b.id} b={b} selected={sel === b.id} onSelect={setSel} />
          ))}
        </svg>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fog">
        <span className="flex items-center gap-2"><span className="h-[3px] w-6 bg-accent-2/50" />PM fiber</span>
        <span className="flex items-center gap-2"><span className="h-[3px] w-6 bg-line-2" />780HP fiber</span>
        <span className="flex items-center gap-2"><span className="w-6 border-t border-dashed border-accent" />Free-space beam</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-lilac" />μ1 signal</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-lilac" />μ2 decoy</span>
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent-2" />Single-photon level</span>
      </div>
      <div className="mt-6">
        <DetailCard d={SRC_DETAIL[sel]} />
      </div>
    </div>
  )
}

/* ---------- RECEIVER ---------- */

type Head = 'fiber' | 'free'

const RX_BLOCKS = (head: Head): BlockDef[] => [
  head === 'fiber'
    ? { id: 'head', x: 110, y: 180, w: 150, title: 'Fiber head', sub: 'FC/APC collimator' }
    : { id: 'head', x: 110, y: 180, w: 150, title: 'Telescope + FSM', sub: 'quad-cell tracking' },
  { id: 'bpf', x: 300, y: 180, w: 150, title: 'Band-pass filter', sub: 'signal + λb · 1% watchdog' },
  { id: 'dich', x: 480, y: 180, w: 130, title: 'Dichroic', sub: 'beacon λb out' },
  { id: 'relay', x: 480, y: 64, w: 190, h: 52, title: 'Relay-mode port', sub: 'FC/APC relay out', dashed: true },
  { id: 'pol', x: 480, y: 302, w: 170, h: 54, title: 'Lock polarimeter', sub: 'D/A analyzer + 2 PDs' },
  { id: 'comp', x: 660, y: 180, w: 150, title: 'Compensation', sub: 'waveplates or EPC' },
  { id: 'split', x: 820, y: 180, w: 100, title: '50/50 split', sub: 'random basis' },
  { id: 'b1', x: 980, y: 110, w: 140, h: 56, title: 'Basis 1 · linear', sub: 'PC + PBS · H/V' },
  { id: 'b2', x: 980, y: 250, w: 140, h: 56, title: 'Basis 2 · circular', sub: 'QWP 45° + PBS · R/L' },
  { id: 'cmp', x: 1110, y: 412, w: 130, h: 56, title: 'Comparators', sub: 'TTL → LVDS ×4' },
  { id: 'tdc', x: 920, y: 412, w: 120, h: 56, title: 'TDC ×4', sub: 'carry-chain tags' },
]

const DETS: { id: 'H' | 'V' | 'R' | 'L'; y: number }[] = [
  { id: 'H', y: 84 },
  { id: 'V', y: 136 },
  { id: 'R', y: 224 },
  { id: 'L', y: 276 },
]

const RX_DETAIL = (head: Head): Record<string, Detail> => ({
  head:
    head === 'fiber'
      ? { name: 'Input head, fiber', detail: 'An FC/APC collimator on the common datum brings a 780HP fiber link into the receiver. In fiber mode, the compensation loop locks on transmitter reference sequences.', test: 'Coupling stability, return loss' }
      : { name: 'Input head, free space', detail: 'A primary mirror, a fine steering mirror, and a collimating lens. The steering mirror closes a tracking loop on a beacon pickoff read by a quad-cell PSD, so pointing never uses quantum counts.', test: 'Pointing range, loop bandwidth' },
  bpf: { name: 'Band-pass filter + watchdog', detail: 'Passes the 780 nm signal band and the beacon λb and rejects background light. A 1% tap feeds a bright-light watchdog photodiode that guards the detectors against blinding.', test: 'Rejection, trip level' },
  dich: { name: 'Dichroic', detail: 'Sends the classical beacon λb down to the lock polarimeter and passes the quantum signal on, so the beacon never reaches the detectors.', test: 'Isolation at λb' },
  relay: { name: 'Relay-mode port', detail: 'A mode switch after the dichroic can route the beam to an FSM-assisted fiber coupler and an FC/APC relay output, with the analyzers and detectors bypassed and powered off by hardware. Relay nodes are in feasibility study.', test: 'Coupling efficiency, bypass attestation' },
  pol: { name: 'Lock polarimeter', detail: 'A D/A analyzer and two photodiodes read the beacon polarization and drive the compensation loop, so the frame stays locked without touching quantum counts.', test: 'Loop bandwidth, limits' },
  comp: { name: 'Polarization compensation', detail: 'Waveplates or an electronic polarization controller, steered by the FPGA from the polarimeter (free space) or from transmitter reference sequences (fiber). It rotates the frame so transmitter D/A lands on Basis 1 and R/L lands on Basis 2.', test: 'Residual error, actuator limits, lock flags' },
  split: { name: '50/50 split', detail: 'A passive splitter sends each photon to the linear or the circular analyzer at random, which is the receiver’s basis choice.', test: 'Split ratio' },
  b1: { name: 'Basis 1, linear analyzer', detail: 'A polarization controller and a PBS measure |H⟩ and |V⟩ in the receiver frame, which compensation aligns with the transmitter’s D/A states.', test: 'Basis fidelity, extinction' },
  b2: { name: 'Basis 2, circular analyzer', detail: 'A quarter-wave plate at 45°, a polarization controller, and a PBS measure |R⟩ and |L⟩.', test: 'Basis fidelity, extinction' },
  det: { name: 'Detectors ×4', detail: 'Four silicon SPADs as the baseline, cheap and at room temperature at 780 nm. An SNSPD variant presents the same four-channel LVDS interface.', test: 'Efficiency, dark counts, dead time' },
  cmp: { name: 'Comparators', detail: 'Four TTL-to-LVDS comparators turn each detector click into a clean digital edge for timing.', test: 'Levels, dead time, skew' },
  tdc: { name: 'Time-to-digital converters', detail: 'Four carry-chain TDCs time-tag every detection with known relative skew and no unreported overflow.', test: 'Skew, resolution, overflow' },
  fpga: { name: 'Receiver FPGA', detail: 'Correlates its time tags b(i) with the transmitter pattern a(i) using an FFT correlator to lock clock offset and frequency. It then runs sifting, parameter estimation, error correction, and privacy amplification with the source over an authenticated classical channel. If parameter estimation fails, no key is output.', test: 'Sync lock, buffering' },
})

const RX_MAIN: Pt[] = [[24, 180], [820, 180]]
const RX_BEACON: Pt[] = [[24, 186], [480, 186], [480, 275]]
const toBasis = (b: 1 | 2): Pt[] => (b === 1 ? [[820, 180], [880, 180], [880, 110], [1060, 110]] : [[820, 180], [880, 180], [880, 250], [1060, 250]])
const toDet = (b: 1 | 2, y: number): Pt[] => [[1060, b === 1 ? 110 : 250], [1080, b === 1 ? 110 : 250], [1080, y], [1112, y]]

function ReceiverDiagram() {
  const wrap = useRef<HTMLDivElement>(null)
  const layer = useRef<SVGGElement>(null)
  const ticks = useRef<SVGGElement>(null)
  const detRefs = useRef<Record<string, SVGRectElement | null>>({})
  const { inView, reduce } = useRunning(wrap)
  const [head, setHead] = useState<Head>('free')
  const [sel, setSel] = useState('comp')
  const blocks = RX_BLOCKS(head)
  const details = RX_DETAIL(head)

  useEffect(() => {
    const g = layer.current
    const tg = ticks.current
    if (!g || !tg || reduce || !inView) return
    type P = { node: SVGGElement; mark: SVGGElement | null; pts: Pt[]; cum: number[]; d: number; s: State | 'beacon'; det?: string; kept?: boolean; drift: number }
    const ps: P[] = []
    const tk: { node: SVGRectElement; x: number }[] = []
    let raf = 0
    let last = performance.now()
    let acc = 0
    let bacc = 0
    const SPEED = 260
    const spawn = (beacon: boolean) => {
      const node = el('g', {})
      if (beacon) {
        node.appendChild(el('circle', { r: 3, fill: C.sky, opacity: 0.85 }))
        g.appendChild(node)
        ps.push({ node, mark: null, pts: RX_BEACON, cum: measure(RX_BEACON), d: 0, s: 'beacon', drift: 0 })
        return
      }
      const s = STATES[Math.floor(Math.random() * 4)]
      const basis: 1 | 2 = Math.random() < 0.5 ? 1 : 2
      const linear = s === 'D' || s === 'A'
      const kept = (basis === 1) === linear
      const pair = basis === 1 ? ['H', 'V'] : ['R', 'L']
      const det = kept ? (s === 'D' ? 'H' : s === 'A' ? 'V' : s) : pair[Math.random() < 0.5 ? 0 : 1]
      const y = DETS.find((d) => d.id === det)!.y
      const pts = RX_MAIN.concat(toBasis(basis).slice(1), toDet(basis, y).slice(1))
      node.appendChild(el('circle', { r: 2.6, fill: C.lilac }))
      const mark = glyph(s, true)
      node.appendChild(mark)
      g.appendChild(node)
      ps.push({ node, mark, pts, cum: measure(pts), d: 0, s, det, kept, drift: 25 + Math.random() * 30 })
    }
    const click = (det: string, kept: boolean) => {
      const r = detRefs.current[det]
      if (r) {
        r.setAttribute('fill', kept ? C.accent : '#2a1f45')
        window.setTimeout(() => r.setAttribute('fill', C.ink2), 160)
      }
      const node = el('rect', { x: 760, y: 416, width: 2.4, height: 16, rx: 1, fill: kept ? C.accent2 : C.ash, opacity: kept ? 1 : 0.4 })
      tg.appendChild(node)
      tk.push({ node, x: 760 })
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      acc += dt
      bacc += dt
      if (acc > 0.34) {
        acc = 0
        spawn(false)
      }
      if (bacc > 0.9) {
        bacc = 0
        spawn(true)
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.d += SPEED * dt
        const total = p.cum[p.cum.length - 1]
        if (p.d >= total) {
          if (p.det) click(p.det, !!p.kept)
          p.node.remove()
          ps.splice(i, 1)
          continue
        }
        const [x, y] = at(p.pts, p.cum, p.d)
        p.node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
        if (p.mark && p.s !== 'beacon') {
          const line = p.mark.firstChild as SVGElement
          if (p.s === 'D' || p.s === 'A') {
            // the link rotates the frame; compensation brings it back before the analyzers
            const base = p.s === 'D' ? -45 : 45
            const drift = x < 660 ? p.drift : x < 700 ? p.drift * (1 - (x - 660) / 40) : 0
            line.setAttribute('transform', `rotate(${(base + drift).toFixed(1)})`)
          } else {
            const spin = (now / 1000) * 220 * (p.s === 'R' ? 1 : -1)
            line.setAttribute('transform', `rotate(${spin.toFixed(1)})`)
          }
        }
      }
      for (let i = tk.length - 1; i >= 0; i--) {
        const t = tk[i]
        t.x -= 55 * dt
        if (t.x < 240) {
          t.node.remove()
          tk.splice(i, 1)
          continue
        }
        t.node.setAttribute('x', t.x.toFixed(1))
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ps.forEach((p) => p.node.remove())
      tk.forEach((t) => t.node.remove())
    }
  }, [inView, reduce])

  const detSelected = sel === 'det'
  return (
    <div ref={wrap}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <span className="label">Input head</span>
        <div role="group" aria-label="Receiver input head" className="flex rounded-full border border-line-2 p-1 font-mono text-[11px] uppercase tracking-[0.1em]">
          {(
            [
              ['free', 'Free space'],
              ['fiber', 'Fiber'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              aria-pressed={head === v}
              onClick={() => {
                setHead(v)
                setSel('head')
              }}
              className={`relative h-9 whitespace-nowrap rounded-full px-4 transition-colors ${head === v ? 'text-ink' : 'text-fog hover:text-bone'}`}
            >
              {head === v && <motion.span layoutId="rx-head" className="absolute inset-0 rounded-full bg-bone" transition={{ duration: 0.45, ease }} />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ash sm:hidden">Swipe to follow the full chain →</p>
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 1200 470" className="h-auto w-full min-w-[920px]" role="group" aria-label="Receiver terminal signal chain. Select a block for details.">
          {/* quantum path */}
          <Wire d={poly([[24, 180], [820, 180]])} kind={head === 'free' ? 'beam' : 'fiber'} />
          <Wire d={poly(toBasis(1))} />
          <Wire d={poly(toBasis(2))} />
          {DETS.map((d) => (
            <Wire key={d.id} d={poly(toDet(d.id === 'H' || d.id === 'V' ? 1 : 2, d.y))} />
          ))}
          {/* beacon to polarimeter, and the compensation lock */}
          <Wire d={poly([[480, 210], [480, 275]])} kind="beacon" label="beacon λb" lx={490} ly={252} />
          <Wire d="M565 302 H660 V212" kind="monitor" label="lock" lx={600} ly={296} />
          <Wire d="M480 150 V90" kind="control" />
          {/* electronics: detectors to comparators, TDC, FPGA */}
          <Wire d="M1188 84 V412 H1175" kind="fiber" />
          {DETS.map((d) => (
            <Wire key={`s${d.id}`} d={`M1168 ${d.y} H1188`} kind="fiber" />
          ))}
          <Wire d="M1045 412 H980" kind="fiber" />
          <Wire d="M860 412 H800" kind="fiber" />
          <text x="1112" y="320" textAnchor="middle" fontSize="9" letterSpacing="0.8" fill={C.ash} className="font-mono">
            Si SPAD ×4
          </text>
          <g ref={layer} pointerEvents="none" />
          {blocks.map((b) => (
            <Block key={b.id} b={b} selected={sel === b.id} onSelect={setSel} />
          ))}
          {/* detectors */}
          <g
            role="button"
            tabIndex={0}
            aria-label="Detectors: show details"
            aria-pressed={detSelected}
            className="cursor-pointer outline-none"
            onClick={() => setSel('det')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSel('det')
              }
            }}
          >
            {DETS.map((d) => (
              <g key={d.id}>
                <rect
                  ref={(r) => {
                    detRefs.current[d.id] = r
                  }}
                  x={1112}
                  y={d.y - 18}
                  width={56}
                  height={36}
                  rx="8"
                  fill={C.ink2}
                  stroke={detSelected ? C.accent : C.line2}
                  strokeWidth={detSelected ? 1.6 : 1}
                  style={{ transition: 'fill 120ms' }}
                />
                <text x={1140} y={d.y + 4} textAnchor="middle" fontSize="12" fill={C.bone} className="font-mono">
                  {d.id}
                </text>
              </g>
            ))}
          </g>
          {/* receiver FPGA with the time-tag lane */}
          <g
            role="button"
            tabIndex={0}
            aria-label="Receiver FPGA: show details"
            aria-pressed={sel === 'fpga'}
            className="cursor-pointer outline-none"
            onClick={() => setSel('fpga')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSel('fpga')
              }
            }}
          >
            <rect x={220} y={376} width={580} height={72} rx="9" fill={sel === 'fpga' ? '#1a1230' : C.ink2} fillOpacity={0.88} stroke={sel === 'fpga' ? C.accent : C.line2} strokeWidth={sel === 'fpga' ? 1.6 : 1} />
            <text x={240} y={398} fontSize="13" fontWeight="500" fill={C.bone}>Receiver FPGA</text>
            <text x={380} y={398} fontSize="9.5" letterSpacing="0.6" fill={C.fog} className="font-mono">FFT sync · sifting · error correction · privacy amp.</text>
            <line x1={240} y1={424} x2={780} y2={424} stroke={C.line} />
          </g>
          <g ref={ticks} pointerEvents="none" />
        </svg>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fog">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-lilac" />Quantum signal</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky" />Classical beacon λb</span>
        <span className="flex items-center gap-2"><span className="h-3 w-[3px] bg-accent-2" />Time tag kept after sifting</span>
        <span className="flex items-center gap-2"><span className="h-3 w-[3px] bg-ash/60" />Discarded, bases differed</span>
      </div>
      <div className="mt-6">
        <DetailCard d={details[sel]} />
      </div>
    </div>
  )
}

/* ---------- section ---------- */

const targets = [
  ['1 kbps', 'Target secure key rate'],
  ['1–10%', 'Maximum QBER'],
  ['1 km', 'MVP link distance'],
  ['30–50 km', 'Long-term ground-to-ground'],
]

const roadmap = [
  ['T1', '2026 to 2027', 'PULSE-Q terminal prototype', 'A free-space and fiber compatible terminal pair, source and receiver, for QKD demonstrations.'],
  ['T2', '2028 to 2029', 'Integrated photonics-based QKD', 'An integrated photonics chip design that replaces bulky adaptive optics inside the QKD terminals.'],
  ['T3', '2029 onward', 'Large-scale network deployments', 'QKD and classical communication links over 50 km and at higher data rates for commercial networks.'],
]

function TerminalHead({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-6">
        <Reveal className="label text-accent-2">{tag}</Reveal>
        <Reveal as="h3" delay={0.05} className="mt-4 text-[clamp(28px,3vw,44px)] font-medium leading-[1.05] tracking-[-0.035em]">
          {title}
        </Reveal>
      </div>
      <Reveal as="p" delay={0.1} className="max-w-[34rem] text-[15px] leading-relaxed text-fog lg:col-span-6">
        {body}
      </Reveal>
    </div>
  )
}

export function TerminalPair() {
  return (
    <section id="pulseq" className="relative border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_80%_at_20%_0%,rgba(53,28,119,0.45),transparent_70%)]" />
      <div className="wrap relative">
        <SectionLabel index="02">The product</SectionLabel>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="display text-[clamp(56px,7vw,116px)]">
              <MaskLines lines={['PULSE-Q']} />
            </h2>
            <Reveal as="p" className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
              <span className="text-bone">P</span>olarization mod<span className="text-bone">U</span>lated <span className="text-bone">L</span>aser{' '}
              <span className="text-bone">S</span>atellite <span className="text-bone">E</span>xperiment, <span className="text-accent-2">Q</span>uantum
            </Reveal>
          </div>
          <Reveal as="p" className="max-w-[32rem] text-[16px] leading-relaxed text-fog lg:col-span-5">
            PULSE-Q is our flagship product: a modular QKD transmitter and receiver pair that establishes secure keys across
            free-space, fiber, and passive optical relay links. It runs decoy-state BB84 at 780 nm, so the receiver can use
            silicon detectors that are inexpensive and work at room temperature.
          </Reveal>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 gap-px">
          {targets.map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.05} className="bg-ink p-7">
              <div className="display text-[clamp(36px,3.4vw,52px)] text-bone">{k}</div>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-fog">{v}</p>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ash">
          MVP success criteria for the first end-to-end key exchange
        </Reveal>

        <div className="mt-28">
          <TerminalHead
            tag="Source terminal"
            title="Prepares every photon, then guards what leaves."
            body="The source turns a 100 MHz pulse train from a 780 nm laser into decoy-state BB84 signals. A quantum random number generator picks one of two intensities and one of four polarization states for each pulse, and the chain then attenuates, monitors, and guards the light up to the output plane, the terminal’s security boundary."
          />
          <Reveal className="mt-10 rounded-[24px] border border-line bg-ink-2/80 p-5 sm:p-8">
            <SourceDiagram />
          </Reveal>
        </div>

        <div className="mt-28">
          <TerminalHead
            tag="Receiver terminal"
            title="Restores the frame, then measures every photon."
            body="The receiver accepts light through a swappable fiber or telescope head. A classical beacon keeps the polarization frame locked without touching quantum counts, a passive 50/50 split chooses each photon’s basis, and four detectors and time-to-digital converters tag every click for the key."
          />
          <Reveal className="mt-10 rounded-[24px] border border-line bg-ink-2/80 p-5 sm:p-8">
            <ReceiverDiagram />
          </Reveal>
        </div>

        <div className="mt-28">
          <Reveal className="flex items-center justify-between border-b border-line pb-5">
            <span className="label">Product roadmap</span>
            <span className="label hidden sm:block">Stage / timing / what we offer</span>
          </Reveal>
          <ol className="grid gap-px overflow-hidden rounded-b-[24px] bg-line lg:grid-cols-3">
            {roadmap.map(([t, when, name, body], i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="bg-ink p-7 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-[12px] ${i === 0 ? 'bg-accent text-bone' : 'border border-line-2 text-fog'}`}>{t}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ash">{when}</span>
                </div>
                <h4 className="mt-8 text-[22px] font-medium tracking-[-0.02em]">{name}</h4>
                <p className="mt-3 text-[14px] leading-relaxed text-fog">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
