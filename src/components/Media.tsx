import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Photograph with a slow cinematic drift (Ken Burns) and scroll parallax.
 * Images live in /public/media as name-960.webp and name-1920.webp.
 */
export function Cinematic({
  name,
  alt,
  className = '',
  drift = 'in',
  children,
  priority = false,
}: {
  name: string
  alt: string
  className?: string
  drift?: 'in' | 'left' | 'right' | 'hero'
  children?: ReactNode
  priority?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const loop =
    drift === 'hero'
      ? { scale: [1.02, 1.09], x: ['0%', '-1.5%'] }
      : drift === 'in'
      ? { scale: [1.1, 1.2], x: ['0%', '-1%'] }
      : drift === 'left'
        ? { scale: [1.14, 1.14], x: ['2.5%', '-2.5%'] }
        : { scale: [1.14, 1.14], x: ['-2.5%', '2.5%'] }
  return (
    <div ref={ref} className={`${className.includes('absolute') ? '' : 'relative '}overflow-hidden bg-ink-2 ${className}`}>
      <motion.div className="absolute inset-0" style={{ y }}>
        <motion.img
          src={`./media/${name}-1920.webp`}
          srcSet={`./media/${name}-960.webp 960w, ./media/${name}-1920.webp 1920w`}
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover"
          initial={{ scale: loop.scale[0], x: loop.x[0] }}
          animate={reduce ? undefined : loop}
          transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(10,10,11,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 grain" />
      {children}
    </div>
  )
}

/** Muted looping video that only plays while on screen. */
export function LoopVideo({ src, poster, className = '', label }: { src: string; poster: string; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const inView = useInView(ref, { margin: '20% 0px' })
  const reduce = useReducedMotion()
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (inView && !reduce) v.play().catch(() => {})
    else v.pause()
  }, [inView, reduce])
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  )
}

/** A diagram callout pinned to a point on a photograph, in percent. */
export function Callout({
  x,
  y,
  label,
  side = 'right',
  delay = 0,
  n,
}: {
  x: number
  y: number
  label: string
  side?: 'left' | 'right'
  delay?: number
  n?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-4% 0px' })
  return (
    <div ref={ref} className="pointer-events-none absolute" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden>
      <motion.span
        className="absolute -left-[7px] -top-[7px] block h-[14px] w-[14px] rounded-full border border-bone/80"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay, duration: 0.6 }}
      />
      <span className="absolute -left-[2px] -top-[2px] block h-[4px] w-[4px] rounded-full bg-laser" />
      <motion.span
        className="absolute -left-[7px] -top-[7px] block h-[14px] w-[14px] rounded-full border border-laser"
        animate={inView ? { scale: [1, 2.6], opacity: [0.8, 0] } : {}}
        transition={{ delay: delay + 0.6, duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className={`absolute top-0 flex items-center gap-2 ${side === 'right' ? 'left-[10px]' : 'right-[10px] flex-row-reverse'}`}
        initial={{ opacity: 0, x: side === 'right' ? -6 : 6 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: delay + 0.3, duration: 0.7 }}
      >
        <motion.span
          className="block h-px bg-bone/60"
          initial={{ width: 0 }}
          animate={inView ? { width: 36 } : {}}
          transition={{ delay: delay + 0.3, duration: 0.6 }}
        />
        <span className="-translate-y-[1px] whitespace-nowrap rounded-full border border-bone/15 bg-ink/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bone backdrop-blur-md">
          {n && <span className="mr-1.5 text-laser">{n}</span>}
          {label}
        </span>
      </motion.div>
    </div>
  )
}

/** Corner brackets that frame a region of a photo and gently track. */
export function TrackBox({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  const c = 'absolute h-3 w-3 border-laser'
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
      animate={{ x: [0, 6, -4, 0], y: [0, -3, 2, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
      <span className="absolute -top-6 left-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-bone/80">{label}</span>
    </motion.div>
  )
}
