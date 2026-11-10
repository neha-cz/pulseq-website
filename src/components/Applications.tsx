import { motion } from 'framer-motion'
import { Callout, Cinematic, TrackBox } from './Media'
import { MaskLines, Reveal, SectionLabel } from './motion'

function AeroScene() {
  return (
    <Cinematic name="aircraft" alt="Aircraft in silhouette above the clouds at blue hour, with a red optical link on the horizon" className="absolute inset-0" drift="left">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <motion.line
          x1="36" y1="12" x2="80" y2="58"
          stroke="#ff3d1f" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeDasharray="4 8"
          animate={{ strokeDashoffset: [0, -24] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
      <TrackBox x={24} y={10} w={24} h={11} label="Track / beacon lock" />
      <Callout x={80} y={58} label="Ground terminal" side="left" n="RX" delay={0.4} />
      <div className="absolute inset-x-0 bottom-0 flex justify-between p-5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70">
        <span>Link / air to ground</span>
        <span>FSM track ●</span>
      </div>
    </Cinematic>
  )
}

function DCScene() {
  return (
    <Cinematic name="datahall" alt="Aisle of GPU server racks in a data center, crossed by red free-space optical links" className="absolute inset-0" drift="in">
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-laser to-transparent"
        animate={{ top: ['10%', '90%'] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        aria-hidden
      />
      <TrackBox x={3} y={14} w={22} h={34} label="GPU cluster A" />
      <TrackBox x={75} y={12} w={22} h={34} label="GPU cluster B" />
      <Callout x={50} y={30} label="Free-space key link" n="QKD" delay={0.3} />
      <div className="absolute inset-x-0 bottom-0 flex justify-between p-5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70">
        <span>Key refresh / cluster to cluster</span>
        <span>Hall 2</span>
      </div>
    </Cinematic>
  )
}

const apps = [
  {
    id: 'aero',
    tag: 'Aerospace and defense',
    title: ['Keys over line of sight,', 'handed into fiber.'],
    body: 'Airborne and space platforms need keys that can be exchanged across optical links in motion and delivered into fiber at the ground. Our terminals mount on two-axis gimbals, track a classical beacon, and move between free space and fiber on the chip.',
    uses: 'Such as air-to-ground links, ship-to-shore links, forward operating bases, and satellite ground stations.',
    Scene: AeroScene,
  },
  {
    id: 'dc',
    tag: 'AI data centers',
    title: ['Quantum-secure links', 'between GPU clusters.'],
    body: 'Model weights and training data move between GPU clusters across halls and campuses. We are building optical interconnects that refresh encryption keys for those links, using free-space hops where fiber is hard to route and fiber where it already runs.',
    uses: 'Such as hall-to-hall links, campus interconnects, and links between sovereign compute sites.',
    Scene: DCScene,
  },
]

export function Applications() {
  return (
    <section id="applications" className="relative border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="wrap">
        <SectionLabel index="03">Applications</SectionLabel>
        <h2 className="mt-10 display text-[clamp(38px,4.8vw,76px)] max-w-[16ch]">
          <MaskLines lines={['Built for links that', 'cannot be trusted.']} />
        </h2>
        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          {apps.map(({ id, tag, title, body, uses, Scene }, i) => (
            <Reveal key={id} delay={i * 0.1}>
              <article className="group overflow-hidden rounded-[24px] border border-line bg-ink-2 transition-transform duration-500 hover:-translate-y-0.5">
                <div className="relative aspect-[16/10.5] overflow-hidden border-b border-line">
                  <div className="absolute inset-0 transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]">
                    <Scene />
                  </div>
                </div>
                <div className="p-7 sm:p-10">
                  <p className="label text-laser">{tag}</p>
                  <h3 className="mt-5 text-[clamp(28px,2.6vw,40px)] font-medium leading-[1.05] tracking-[-0.035em]">
                    {title[0]}
                    <br />
                    <span className="text-fog">{title[1]}</span>
                  </h3>
                  <p className="mt-6 text-[15px] leading-relaxed text-fog max-w-[34rem]">{body}</p>
                  <p className="mt-6 border-t border-line pt-5 text-[13px] leading-relaxed text-ash">{uses}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
