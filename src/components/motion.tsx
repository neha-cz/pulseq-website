import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

export const ease = [0.16, 1, 0.3, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.0, ease, delay },
  }),
}

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'p' | 'h2' | 'h3' | 'li' | 'span'
}) {
  const M = motion[as] as typeof motion.div
  return (
    <M
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      custom={delay}
    >
      {children}
    </M>
  )
}

/** Splits a headline into lines that rise out of a mask. */
export function MaskLines({ lines, className, delay = 0 }: { lines: string[]; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  return (
    <div ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: '105%' }}
            animate={inView ? { y: '0%' } : {}}
            transition={{ duration: 1.1, ease, delay: delay + i * 0.09 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <Reveal className="flex items-center gap-4 label">
      <span className="text-laser">{index}</span>
      <span className="h-px w-10 bg-line-2" />
      <span>{children}</span>
    </Reveal>
  )
}
