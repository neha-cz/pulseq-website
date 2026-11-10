import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Cinematic, LoopVideo } from './Media'
import { MaskLines, ease } from './motion'

/** Set to the hero clip once it is generated; until then the still runs with a slow camera drift. */
const HERO_VIDEO: { src: string; poster: string } | null = {
  src: './media/hero-terminal.mp4',
  poster: './media/hero-terminal-poster.jpg',
}

export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end start'] })
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])

  return (
    <section id="top" ref={wrapRef} className="relative h-[100svh] min-h-[680px] overflow-hidden bg-ink">
      <motion.div className="absolute inset-0" style={{ y: sceneY, scale: sceneScale }}>
        {HERO_VIDEO ? (
          <LoopVideo
            src={HERO_VIDEO.src}
            poster={HERO_VIDEO.poster}
            label="A free-space optical terminal on a gimbal tracks across a rooftop at dusk, sending a red beam into the haze"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Cinematic
            name="hero-terminal"
            alt="A free-space optical terminal on a two-axis gimbal on a rooftop at dusk, sending a red beam into the haze"
            className="absolute inset-0"
            drift="hero"
            priority
          />
        )}
        {/* grade the footage down so it sits in the dark page */}
        <div className="pointer-events-none absolute inset-0 grain" />
        <div className="pointer-events-none absolute inset-0 bg-[#0a0a0b]/45 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_65%_40%,transparent_30%,rgba(10,10,11,0.7)_100%)]" />
        <div className="pointer-events-none absolute right-0 top-16 hidden p-6 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70 lg:block">
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-laser align-middle" />
          Free-space node / dusk
        </div>
      </motion.div>

      {/* readability gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,11,0.88)_0%,rgba(10,10,11,0.55)_32%,rgba(10,10,11,0)_60%)] max-lg:bg-[linear-gradient(0deg,#0a0a0b_10%,rgba(10,10,11,0.65)_50%,rgba(10,10,11,0.1)_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={{ y: textY }} className="relative z-10 h-full">
        <div className="wrap flex h-full flex-col justify-end pb-28 lg:pb-32">
          <motion.p
            className="label mb-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-laser opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-laser" />
            </span>
            Introducing PULSE-Q <span className="text-ash">/</span> A University of Chicago spin-out
          </motion.p>
          <h1 className="display text-[clamp(44px,7vw,112px)]">
            <MaskLines lines={['The quantum link,', 'built on chips.']} delay={0.3} />
          </h1>
          <motion.p
            className="mt-8 max-w-[34rem] text-[17px] leading-relaxed text-bone/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.75 }}
          >
            We are building a full stack hybrid free-space-to-fiber integrated photonics quantum key distribution system
            for aerospace, defense, and data center networking platforms.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.9 }}
          >
            <a href="#contact" className="btn btn-primary">
              Request a briefing
              <Arrow />
            </a>
            <a href="#stack" className="btn btn-ghost">
              Meet PULSE-Q
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 border-t border-line/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <div className="wrap grid h-14 grid-cols-2 items-center gap-4 md:grid-cols-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
          <span><span className="text-bone">780 nm</span> signal band</span>
          <span><span className="text-bone">100 MHz</span> pulse rate</span>
          <span className="hidden md:block"><span className="text-bone">Tx + Rx</span> photonic chips</span>
          <span className="hidden md:block"><span className="text-bone">Pilot</span> MZI-mesh receiver</span>
        </div>
      </motion.div>
    </section>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
