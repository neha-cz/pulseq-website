import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { SectionLabel } from './motion'

const text =
  'Encrypted traffic recorded today can be decrypted later. Quantum key distribution ties the secrecy of a key to physics, so any attempt to measure it in transit shows up as errors at the receiver. The theory is settled. The hard part has been building systems that are small, affordable, and stable enough to leave the lab.'

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.24em]">
      {word}
    </motion.span>
  )
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.45'] })
  const words = text.split(' ')
  return (
    <section ref={ref} className="relative border-t border-line py-[clamp(96px,16vw,220px)]">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <SectionLabel index="00">Why now</SectionLabel>
        </div>
        <p className="lg:col-span-9 text-[clamp(28px,3.6vw,56px)] leading-[1.12] tracking-[-0.03em] font-[450]">
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>
      </div>
    </section>
  )
}
