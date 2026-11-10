import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { MaskLines, Reveal, SectionLabel, ease } from './motion'

/* ---------- network map ---------- */

const GROUND = 400
const P = {
  aircraft: [250, 92],
  sat: [1040, 64],
  ship: [70, GROUND],
  forward: [190, GROUND],
  gs1: [372, GROUND],
  dcA: [620, GROUND],
  dcB: [860, GROUND],
  gs2: [1090, GROUND],
} as const

const free: [keyof typeof P, keyof typeof P][] = [
  ['aircraft', 'gs1'],
  ['ship', 'gs1'],
  ['forward', 'gs1'],
  ['sat', 'gs2'],
]
const fiber: [keyof typeof P, keyof typeof P][] = [
  ['gs1', 'dcA'],
  ['dcA', 'dcB'],
  ['dcB', 'gs2'],
]

const arc = (a: readonly number[], b: readonly number[]) => {
  const [x1, y1] = a
  const [x2, y2] = b
  const lift = Math.min(170, Math.abs(x2 - x1) * 0.5)
  const mx = (x1 + x2) / 2
  const my = Math.min(y1, y2) - (y1 === y2 ? lift : 20)
  return `M${x1} ${y1 - 14} Q${mx} ${my} ${x2} ${y2 - 30}`
}
const trench = (a: readonly number[], b: readonly number[]) => {
  const [x1] = a
  const [x2] = b
  return `M${x1} ${GROUND + 6} C${x1} ${GROUND + 70} ${x2} ${GROUND + 70} ${x2} ${GROUND + 6}`
}

/* the route one key takes: aircraft, ground station, fiber backbone, rooftop, satellite */
const ROUTE = [
  `M${P.aircraft[0]} ${P.aircraft[1]} L${P.gs1[0]} ${P.gs1[1] - 30}`,
  `L${P.gs1[0]} ${GROUND + 6}`,
  `C${P.gs1[0]} ${GROUND + 70} ${P.dcA[0]} ${GROUND + 70} ${P.dcA[0]} ${GROUND + 6}`,
  `C${P.dcA[0]} ${GROUND + 70} ${P.dcB[0]} ${GROUND + 70} ${P.dcB[0]} ${GROUND + 6}`,
  `C${P.dcB[0]} ${GROUND + 70} ${P.gs2[0]} ${GROUND + 70} ${P.gs2[0]} ${GROUND + 6}`,
  `L${P.gs2[0]} ${P.gs2[1] - 30} L${P.sat[0]} ${P.sat[1]}`,
].join(' ')

function Label({ x, y, children, anchor = 'middle', tone = '#a9a7a2' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; tone?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="11" letterSpacing="1.4" fill={tone} className="font-mono">
      {children}
    </text>
  )
}

function Glyphs() {
  const s = { stroke: '#f4f2ee', strokeWidth: 1.4, fill: 'none' } as const
  return (
    <g>
      {/* aircraft */}
      <g transform={`translate(${P.aircraft[0]} ${P.aircraft[1]})`}>
        <path d="M-24 0 H24 M-6 -2 L-14 -13 M-6 2 L-14 13 M16 -1 L20 -7 M16 1 L20 7" {...s} />
        <Label x={0} y={-24}>AIRCRAFT</Label>
      </g>
      {/* satellite */}
      <g transform={`translate(${P.sat[0]} ${P.sat[1]})`}>
        <rect x="-7" y="-7" width="14" height="14" {...s} />
        <rect x="-32" y="-5" width="20" height="10" {...s} />
        <rect x="12" y="-5" width="20" height="10" {...s} />
        <Label x={0} y={-20}>SATELLITE</Label>
      </g>
      {/* ship */}
      <g transform={`translate(${P.ship[0]} ${P.ship[1]})`}>
        <path d="M-22 -10 H22 L15 0 H-15 Z M-4 -10 V-22 H8 V-10" {...s} />
        <Label x={0} y={24}>SHIP</Label>
      </g>
      {/* forward site */}
      <g transform={`translate(${P.forward[0]} ${P.forward[1]})`}>
        <path d="M-14 0 L0 -18 L14 0 Z" {...s} />
        <Label x={0} y={24}>FORWARD SITE</Label>
      </g>
      {/* data centers */}
      {(['dcA', 'dcB'] as const).map((k, i) => (
        <g key={k} transform={`translate(${P[k][0]} ${P[k][1]})`}>
          <rect x="-26" y="-36" width="52" height="36" {...s} />
          {[-18, -6, 6, 18].map((x) => (
            <line key={x} x1={x} y1="-30" x2={x} y2="-6" stroke="#6f6d69" strokeWidth="1.4" />
          ))}
          <Label x={0} y={-48}>{`DATA CENTER ${i ? 'B' : 'A'}`}</Label>
        </g>
      ))}
    </g>
  )
}

function Station({ at, label, delay, side }: { at: readonly number[]; label: string; delay: number; side: 'left' | 'right' }) {
  const lx = side === 'right' ? 18 : -18
  const anchor = side === 'right' ? 'start' : 'end'
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <path d="M-10 0 L0 -26 L10 0 M-6 -10 H6" stroke="#f4f2ee" strokeWidth="1.4" fill="none" />
      <circle cx="0" cy="-30" r="5" fill="#ff3d1f" />
      <motion.circle
        cx="0"
        cy="-30"
        r="5"
        fill="none"
        stroke="#ff3d1f"
        animate={{ r: [5, 22], opacity: [0.9, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay }}
      />
      <Label x={lx} y={-40} anchor={anchor} tone="#f4f2ee">{label}</Label>
      <Label x={lx} y={-26} anchor={anchor} tone="#ff7a4d">PULSE-Q</Label>
    </g>
  )
}

function NetworkMap() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const draw = (i: number) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    animate: inView ? { pathLength: 1 } : {},
    transition: { duration: 1.2, ease, delay: 0.2 + i * 0.18 },
  })
  return (
    <svg ref={ref} viewBox="0 0 1160 500" className="h-auto w-full min-w-[720px]" role="img" aria-label="Network map: an aircraft, a ship, a forward site and a satellite connect by free-space links to PULSE-Q ground stations, which hand keys into a fiber backbone between two data centers">
      {/* sky and ground */}
      <line x1="0" y1={GROUND} x2="1160" y2={GROUND} stroke="#3a3a40" />
      <rect x="0" y={GROUND} width="1160" height="100" fill="#0d0d0f" />
      <Label x={20} y={GROUND + 92} anchor="start" tone="#6f6d69">UNDERGROUND FIBER</Label>
      <Label x={20} y={30} anchor="start" tone="#6f6d69">LINE OF SIGHT</Label>

      {/* fiber backbone */}
      {fiber.map(([a, b], i) => (
        <g key={`${a}${b}`}>
          <motion.path d={trench(P[a], P[b])} stroke="#c9c4b8" strokeOpacity="0.55" strokeWidth="3" fill="none" {...draw(i + 4)} />
        </g>
      ))}
      <path d={`M${P.gs1[0]} ${GROUND - 26} V${GROUND + 6} M${P.gs2[0]} ${GROUND - 26} V${GROUND + 6}`} stroke="#c9c4b8" strokeOpacity="0.4" strokeWidth="2" />

      {/* free-space links */}
      {free.map(([a, b], i) => (
        <g key={`${a}${b}`}>
          <motion.path d={arc(P[a], P[b])} stroke="#ff3d1f" strokeWidth="9" strokeOpacity="0.1" fill="none" {...draw(i)} />
          <motion.path d={arc(P[a], P[b])} stroke="#ff3d1f" strokeWidth="1.5" strokeDasharray="5 7" fill="none" {...draw(i)} />
        </g>
      ))}

      <Glyphs />
      <Station at={P.gs1} label="GROUND STATION" delay={0} side="right" />
      <Station at={P.gs2} label="ROOFTOP NODE" delay={1.2} side="left" />

      {/* one key crossing the whole hybrid route */}
      {!reduce && inView && (
        <g>
          <circle r="11" fill="#ff3d1f" opacity="0.25">
            <animateMotion dur="7s" repeatCount="indefinite" path={ROUTE} />
          </circle>
          <circle r="4" fill="#ffd2b8">
            <animateMotion dur="7s" repeatCount="indefinite" path={ROUTE} />
          </circle>
        </g>
      )}
    </svg>
  )
}

/* ---------- copy ---------- */

const integrated = [
  ['Modular', 'Transmitter and receiver units combine into any topology, and the same unit takes either a fiber port or a telescope head.'],
  ['Scalable', 'The chips come from a wafer-scale process, so every unit behaves alike. Adding a node means adding a unit, not building another optical bench.'],
  ['Energy-efficient', 'Modulators and interferometers on a chip replace racks of bulk optics and their drivers, which lowers the power draw at airborne and edge sites.'],
  ['Easy to deploy', 'The terminal is designed to fit in a backpack and to be set up in the field without an optics bench or hand alignment.'],
]

const hybrid = [
  ['Free space reaches where fiber cannot', 'Aircraft, ships, satellites, and forward sites can only be reached through the air, and a line-of-sight link can cross a river or a campus without trenching.'],
  ['Fiber connects what is already built', 'Data centers and cities already sit on dense fiber, which carries keys over stable links that do not depend on the weather.'],
  ['One network across both', 'PULSE-Q converts between free space and fiber on the chip, so a single key can cross both kinds of link and the network can grow wherever it needs to.'],
]

function Column({ eyebrow, title, items }: { eyebrow: string; title: string; items: string[][] }) {
  return (
    <div>
      <Reveal className="label text-laser">{eyebrow}</Reveal>
      <Reveal as="h3" delay={0.05} className="mt-4 text-[clamp(26px,2.4vw,36px)] font-medium leading-[1.1] tracking-[-0.03em]">
        {title}
      </Reveal>
      <ul className="mt-8 border-t border-line">
        {items.map(([t, b], i) => (
          <Reveal as="li" key={t} delay={0.08 + i * 0.05} className="group grid gap-2 border-b border-line py-6 sm:grid-cols-12 sm:gap-6">
            <span className="flex items-baseline gap-3 text-[18px] tracking-[-0.02em] sm:col-span-5">
              <span className="font-mono text-[11px] text-laser">{String(i + 1).padStart(2, '0')}</span>
              {t}
            </span>
            <span className="text-[14px] leading-relaxed text-fog sm:col-span-7">{b}</span>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

export function Network() {
  return (
    <section id="network" className="relative border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="wrap">
        <SectionLabel index="01">The network</SectionLabel>
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(38px,4.8vw,76px)] lg:col-span-7">
            <MaskLines lines={['A quantum network', 'that reaches where', 'fiber cannot.']} />
          </h2>
          <Reveal as="p" className="max-w-[32rem] text-[16px] leading-relaxed text-fog lg:col-span-5">
            We believe we are building the first integrated photonic QKD system that works across both free space and
            fiber. Our focus is the network, getting quantum-secure keys to every node that needs them, over whichever
            link reaches it.
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <div className="rounded-[24px] border border-line bg-ink-2 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="label">One key, one route, two kinds of link</span>
              <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.12em] text-fog">
                <span className="flex items-center gap-2">
                  <span className="h-0 w-6 border-t border-dashed border-laser" />
                  Free space
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-[3px] w-6 bg-[#c9c4b8]/60" />
                  Fiber
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-laser" />
                  PULSE-Q conversion
                </span>
              </div>
            </div>
            <div className="-mx-5 mt-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <NetworkMap />
            </div>
          </div>
        </Reveal>

        <div className="mt-24 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Column eyebrow="Why integrated photonics" title="A quantum terminal you can carry." items={integrated} />
          <Column eyebrow="Why free space and fiber" title="Every link a network needs." items={hybrid} />
        </div>
      </div>
    </section>
  )
}
