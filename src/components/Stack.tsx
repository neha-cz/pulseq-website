import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, useState, type ReactNode } from 'react'
import { MaskLines, Reveal, SectionLabel, ease } from './motion'

type Status = 'Pilot' | 'Roadmap' | 'Pilot + roadmap'

const layers: { id: string; name: string; status: Status; body: string; parts: string[] }[] = [
  {
    id: 'key',
    name: 'Key engine',
    status: 'Roadmap',
    body: 'Turns raw detection events into usable keys and hands them to the encryptors on the link, with every step logged for audit.',
    parts: ['Sifting and parameter estimation', 'Error correction', 'Privacy amplification', 'Authenticated classical channel'],
  },
  {
    id: 'control',
    name: 'Control and timing',
    status: 'Roadmap',
    body: 'One board runs the quantum layer: it chooses states from quantum randomness, time-tags every photon, and keeps the chips locked.',
    parts: ['FPGA with QRNG', 'Time-to-digital converters', 'FFT clock synchronization', 'Heater, TEC, and interlock control'],
  },
  {
    id: 'chips',
    name: 'Photonic chips',
    status: 'Pilot + roadmap',
    body: 'A transmitter chip that prepares decoy-state polarization pulses, and a receiver chip that recovers and analyzes them. The receiver chip is our pilot.',
    parts: ['Receiver: MZI-mesh polarization recovery (pilot)', 'Receiver: on-chip basis analysis', 'Transmitter: intensity and polarization encoding', 'Edge coupling to fiber on both'],
  },
  {
    id: 'optics',
    name: 'Optical terminal',
    status: 'Roadmap',
    body: 'The physical interface to the link: a telescope or fiber port, beacon tracking, and a gimbal, built to carry the chips into the field.',
    parts: ['Telescope with fine steering mirror', 'Beacon tracking and polarization lock', 'Two-axis gimbal', 'Fiber and free-space ports'],
  },
]

/* isometric plane: maps plane coords (0..200) onto the page */
const ISO = 'matrix(0.866 0.5 -0.866 0.5 0 0)'

function Plate({ z, active, children, label }: { z: MotionValue<number>; active: boolean; children: ReactNode; label: string }) {
  return (
    <motion.g style={{ y: z }}>
      {/* side faces */}
      <path d="M-173.2 100 L0 200 L0 212 L-173.2 112 Z" fill="#141416" stroke={active ? '#ff3d1f' : '#3a3a40'} strokeWidth="1" />
      <path d="M173.2 100 L0 200 L0 212 L173.2 112 Z" fill="#0f0f11" stroke={active ? '#ff3d1f' : '#3a3a40'} strokeWidth="1" />
      <g transform={ISO}>
        <rect x="0" y="0" width="200" height="200" fill={active ? '#19130f' : '#111113'} stroke={active ? '#ff3d1f' : '#3a3a40'} strokeWidth="1.2" />
        <g opacity={active ? 1 : 0.55}>{children}</g>
      </g>
      <motion.text
        x="196"
        y="112"
        className="font-mono"
        fontSize="11"
        letterSpacing="1.2"
        fill={active ? '#f4f2ee' : '#6f6d69'}
      >
        {label}
      </motion.text>
      <line x1="176" y1="108" x2="190" y2="108" stroke={active ? '#ff3d1f' : '#3a3a40'} />
    </motion.g>
  )
}

const flow = (d: number) => ({ animate: { strokeDashoffset: [0, -24] }, transition: { duration: d, repeat: Infinity, ease: 'linear' as const } })

function KeyArt() {
  return (
    <>
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => (
          <motion.rect
            key={`${r}-${c}`}
            x={34 + c * 17}
            y={34 + r * 17}
            width="11"
            height="11"
            fill={(r * 5 + c * 3) % 7 === 0 ? '#ff3d1f' : '#3a3a40'}
            animate={{ opacity: (r + c) % 3 === 0 ? [0.25, 1, 0.25] : 1 }}
            transition={{ duration: 2.6, repeat: Infinity, delay: (r + c) * 0.1 }}
          />
        )),
      )}
    </>
  )
}

function ControlArt() {
  return (
    <>
      <rect x="70" y="70" width="60" height="60" fill="#18181b" stroke="#a9a7a2" />
      <text x="78" y="104" fontSize="11" fill="#a9a7a2" className="font-mono">FPGA</text>
      {[
        [24, 30, 'QRNG'],
        [146, 30, 'TDC'],
        [24, 146, 'CLK'],
        [146, 146, 'DAC'],
      ].map(([x, y, t]) => (
        <g key={t as string}>
          <rect x={x as number} y={y as number} width="30" height="24" fill="#18181b" stroke="#6f6d69" />
          <text x={(x as number) + 4} y={(y as number) + 15} fontSize="7" fill="#6f6d69" className="font-mono">{t}</text>
        </g>
      ))}
      {['M54 42 L70 80', 'M146 42 L130 80', 'M54 158 L70 120', 'M146 158 L130 120'].map((d) => (
        <g key={d}>
          <path d={d} stroke="#3a3a40" strokeWidth="2" />
          <motion.path d={d} stroke="#ff3d1f" strokeWidth="1.4" strokeDasharray="3 9" {...flow(0.8)} />
        </g>
      ))}
    </>
  )
}

function ChipsArt() {
  return (
    <>
      {/* transmitter chip, roadmap: dashed outline */}
      <rect x="18" y="56" width="72" height="88" fill="#121214" stroke="#6f6d69" strokeDasharray="4 4" />
      <text x="24" y="70" fontSize="8" fill="#6f6d69" className="font-mono">TX CHIP</text>
      <path d="M26 100 H50 M50 92 H82 M50 108 H82 M50 92 V108" stroke="#55555c" strokeWidth="2" fill="none" />
      {/* receiver chip, pilot */}
      <rect x="110" y="40" width="74" height="120" fill="#16110f" stroke="#ff3d1f" />
      <text x="116" y="54" fontSize="8" fill="#ff7a4d" className="font-mono">RX CHIP</text>
      {[64, 80, 96, 112, 128, 144].map((y, i) => (
        <path key={y} d={`M118 ${y} C138 ${y} 138 ${i < 3 ? 88 : 120} 150 ${i < 3 ? 88 : 120}`} stroke="#ff3d1f" strokeWidth="1" fill="none" opacity="0.8" />
      ))}
      <path d="M150 88 C164 88 164 104 176 104 M150 120 C164 120 164 104 176 104" stroke="#ff3d1f" strokeWidth="1.2" fill="none" />
      {/* link between the two */}
      <path d="M90 100 H110" stroke="#3a3a40" strokeWidth="2" />
      <motion.path d="M82 100 H118" stroke="#ff3d1f" strokeWidth="1.6" strokeDasharray="3 9" {...flow(0.7)} />
    </>
  )
}

function OpticsArt() {
  return (
    <>
      <circle cx="100" cy="100" r="58" fill="none" stroke="#6f6d69" />
      <circle cx="100" cy="100" r="40" fill="#0c0c0e" stroke="#a9a7a2" />
      <motion.circle cx="100" cy="100" r="40" fill="none" stroke="#ff3d1f" strokeDasharray="6 10" animate={{ rotate: 360 }} style={{ originX: '100px', originY: '100px' }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} />
      <path d="M100 52 V148 M52 100 H148" stroke="#3a3a40" />
      <circle cx="100" cy="100" r="4" fill="#ff3d1f" />
      {[20, 180].map((x) => (
        <rect key={x} x={x - 8} y="92" width="16" height="16" fill="#18181b" stroke="#6f6d69" />
      ))}
    </>
  )
}

const art: Record<string, () => ReactNode> = { key: KeyArt, control: ControlArt, chips: ChipsArt, optics: OpticsArt }

function StatusPill({ s }: { s: Status }) {
  const pilot = s !== 'Roadmap'
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] ${pilot ? 'border-laser/60 text-laser' : 'border-line-2 text-fog'}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${pilot ? 'bg-laser' : 'border border-fog'}`} />
      {s}
    </span>
  )
}

function Diagram({ progress, active }: { progress: MotionValue<number>; active: number }) {
  const gap = useTransform(progress, [0.05, 0.4], [26, 96])
  const z = [0, 1, 2, 3].map((i) => useTransform(gap, (g) => (i - 1.5) * g))
  return (
    <svg viewBox="-200 -240 580 680" className="h-full w-full" role="img" aria-label="Exploded view of the integrated QKD system: key engine, control and timing, photonic chips, and optical terminal">
      {/* vertical datum line through the stack */}
      <line x1="0" y1="-200" x2="0" y2="420" stroke="#26262a" strokeDasharray="2 6" />
      {[...layers].reverse().map((l, ri) => {
        const i = layers.length - 1 - ri
        const A = art[l.id]
        return (
          <Plate key={l.id} z={z[i]} active={active === i} label={l.name.toUpperCase()}>
            <A />
          </Plate>
        )
      })}
    </svg>
  )
}

export function Stack() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(2)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v < 0.3) setActive(2)
    else setActive(Math.min(3, Math.floor(((v - 0.3) / 0.65) * 4)))
  })
  const staticProgress = useTransform(scrollYProgress, () => 1)

  const Intro = (
    <>
      <SectionLabel index="01">The product</SectionLabel>
      <h2 className="mt-8 display text-[clamp(52px,6.2vw,104px)]">
        <MaskLines lines={['PULSE-Q']} />
      </h2>
      <Reveal as="p" className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
        <span className="text-bone">P</span>olarization mod<span className="text-bone">U</span>lated <span className="text-bone">L</span>aser <span className="text-bone">S</span>atellite <span className="text-bone">E</span>xperiment, <span className="text-laser">Q</span>uantum
      </Reveal>
      <Reveal as="p" className="mt-5 max-w-[30rem] text-[16px] leading-relaxed text-fog">
        PULSE-Q is our complete QKD system on integrated photonics, with chip-based transmitter and receiver units, the
        control and timing electronics, and the key post-processing in one stack. Its MZI-mesh receiver chip is the first
        piece, and it is our pilot.
      </Reveal>
    </>
  )

  const List = ({ interactive }: { interactive: boolean }) => (
    <ol className="mt-8 border-t border-line">
      {layers.map((l, i) => {
        const on = !interactive || active === i
        return (
          <li key={l.id} className="border-b border-line">
            <div className="flex items-center justify-between gap-4 py-4">
              <span className={`flex items-baseline gap-4 text-[20px] tracking-[-0.02em] transition-colors duration-500 ${on ? 'text-bone' : 'text-ash'}`}>
                <span className="font-mono text-[11px] text-laser">L{layers.length - i}</span>
                {l.name}
              </span>
              <StatusPill s={l.status} />
            </div>
            <motion.div
              initial={false}
              animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
              transition={{ duration: 0.6, ease }}
              className="overflow-hidden"
            >
              <p className="pb-3 text-[14px] leading-relaxed text-fog">{l.body}</p>
              <ul className={`flex flex-wrap gap-2 pb-5 ${interactive ? "[@media(max-height:800px)]:hidden" : ""}`}>
                {l.parts.map((p) => (
                  <li key={p} className="rounded-full border border-line px-3 py-1 text-[12px] text-bone/80">{p}</li>
                ))}
              </ul>
            </motion.div>
          </li>
        )
      })}
    </ol>
  )

  return (
    <section id="stack" className="relative border-t border-line">
      {/* desktop: pinned exploded view */}
      <div ref={ref} className="relative hidden h-[320vh] lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="wrap grid w-full grid-cols-12 items-center gap-10">
            <div className="col-span-5">
              {Intro}
              <List interactive />
            </div>
            <div className="col-span-7 h-[86vh]">
              <Diagram progress={scrollYProgress} active={active} />
            </div>
          </div>
        </div>
      </div>
      {/* mobile + tablet */}
      <div className="wrap py-24 lg:hidden">
        {Intro}
        <div className="mx-auto mt-10 aspect-[58/68] max-w-[460px]">
          <Diagram progress={staticProgress} active={2} />
        </div>
        <List interactive={false} />
      </div>
    </section>
  )
}
