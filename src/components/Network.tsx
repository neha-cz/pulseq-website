import { Reveal, SectionLabel } from './motion'

/* ---------- copy ---------- */

const integrated = [
  ['Modular', 'Because the system is built from modular components, the whole setup is easy to deploy: it is designed to fit in a backpack and to be assembled quickly in the field, without an optics bench or hand alignment.'],
  ['Scalable', 'The chips come from a wafer-scale process, so every unit behaves alike. Adding a node means adding a unit, not building another optical bench.'],
  ['Energy-efficient', 'Modulators and interferometers on a chip replace racks of bulk optics and their drivers, which lowers the power draw at airborne and edge sites.'],
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
        <div className="mt-12 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Column eyebrow="Why integrated photonics" title="A quantum terminal you can carry." items={integrated} />
          <Column eyebrow="Why free space and fiber" title="Every link a network needs." items={hybrid} />
        </div>
      </div>
    </section>
  )
}
