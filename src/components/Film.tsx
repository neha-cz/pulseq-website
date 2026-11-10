import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { LoopVideo } from './Media'

export function Film() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // frame grows from an inset card to full bleed, then the copy arrives
  const inset = useTransform(scrollYProgress, [0, 0.45], ['12%', '0%'])
  const radius = useTransform(scrollYProgress, [0, 0.45], [28, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1])
  const copyOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1])
  const copyY = useTransform(scrollYProgress, [0.35, 0.6], [40, 0])
  const hudOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.85, 1], [0, 1, 1, 0.4])

  return (
    <section ref={ref} className="relative h-[220vh] border-t border-line" aria-label="Photonic chip under 780 nm illumination">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="absolute overflow-hidden"
          style={{ top: inset, bottom: inset, left: inset, right: inset, borderRadius: radius }}
        >
          <motion.div className="absolute inset-0" style={{ scale }}>
            <LoopVideo
              src="./media/wafer-loop.mp4"
              poster="./media/wafer-poster.jpg"
              label="Macro footage of a laser beam entering a grating coupler on a photonic chip"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#0a0a0b_0%,rgba(10,10,11,0.2)_45%,rgba(10,10,11,0.35)_100%)]" />
          <div className="pointer-events-none absolute inset-0 grain" />

          {/* HUD over the footage */}
          <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: hudOpacity }} aria-hidden>
            <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="h-28 w-28 rounded-full border border-bone/40 sm:h-40 sm:w-40"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{ borderStyle: 'dashed' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-laser"
                animate={{ scale: [0.6, 1.25], opacity: [0.9, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              />
              <div className="absolute left-full top-1/2 ml-4 flex items-center gap-2 whitespace-nowrap">
                <span className="h-px w-10 bg-bone/60" />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone">Grating coupler / λ 780 nm</span>
              </div>
            </div>
            <div className="absolute left-0 right-0 top-0 hidden justify-between p-6 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70 sm:flex">
              <span>REC ● Free space → waveguide</span>
              <span>Macro / 100 mm</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="absolute inset-x-0 bottom-0 pb-[clamp(40px,8vh,96px)]" style={{ opacity: copyOpacity, y: copyY }}>
          <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2 className="display text-[clamp(40px,6vw,96px)] lg:col-span-8">
              Light enters here.
              <br />
              <span className="text-fog">Keys leave as fiber.</span>
            </h2>
            <p className="lg:col-span-4 max-w-[26rem] text-[16px] leading-relaxed text-bone/80">
              A grating antenna on the chip takes light straight out of free space and into a single-mode waveguide, where
              the rest of the receiver can correct and measure it.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
