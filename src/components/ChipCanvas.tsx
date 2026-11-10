import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ChipScene, type ChipLayout } from '../three/chipScene'

const calloutText: Record<string, [string, string]> = {
  antenna: ['01', 'Pilot receiver chip / grating antennas'],
  mesh: ['02', 'MZI mesh, N − 1 nodes per rail'],
  basis: ['03', 'On-chip basis split H / V / R / L'],
  fiber: ['04', 'Edge couplers to PM fiber, 127 µm'],
}

/** Live render of the receiver chip, with callouts that track the 3D parts. */
export function ChipCanvas({ layout = 'panel', className = '' }: { layout?: ChipLayout; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const calloutRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const reduce = useReducedMotion()
  const [webgl, setWebgl] = useState(true)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    let scene: ChipScene
    try {
      scene = new ChipScene(canvas)
    } catch {
      setWebgl(false)
      return
    }
    let raf = 0
    let visible = false
    const placeCallouts = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight
      for (const c of scene.callouts) {
        const el = calloutRefs.current[c.id]
        if (!el) continue
        const p = scene.project(c.position, w, h)
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      }
    }
    const resize = () => {
      scene.resize(wrap.clientWidth, wrap.clientHeight, layout)
      scene.settle()
      placeCallouts()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) setShown(true)
    })
    io.observe(wrap)
    const onMove = (e: PointerEvent) => {
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      scene.frame()
      placeCallouts()
    }
    if (!reduce) loop()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.dispose()
    }
  }, [reduce, layout])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-ink ${className}`}>
      {webgl ? (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Live 3D render of the pilot receiver chip: light falls onto grating antennas and travels through the MZI mesh into four fibers" role="img" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_55%_55%,#3a1208_0%,transparent_70%)]" />
      )}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        {Object.entries(calloutText).map(([id, [n, t]]) => (
          <div
            key={id}
            ref={(el) => {
              calloutRefs.current[id] = el
            }}
            className="absolute left-0 top-0 will-change-transform"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={shown ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 + Number(n) * 0.15, duration: 0.8 }}
              className="flex -translate-y-full items-end gap-2 pb-1"
            >
              <span className="h-8 w-px bg-gradient-to-t from-bone/60 to-transparent" />
              <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-fog">
                <span className="mr-2 text-laser">{n}</span>
                {t}
              </span>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 grain" />
    </div>
  )
}
