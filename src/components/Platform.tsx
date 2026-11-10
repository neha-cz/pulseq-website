import { ChipCanvas } from './ChipCanvas'
import { MaskLines, Reveal, SectionLabel } from './motion'

const units = [
  {
    n: 'A',
    name: 'Source unit',
    body: 'Prepares decoy-state polarization pulses and launches them through a patch panel to a fiber port or a free-space optical head with its own polarization compensation.',
    parts: ['780 nm gain-switched DFB', 'Two Sagnac modulators', 'QRNG-driven FPGA', 'Transmitter chip (roadmap)'],
  },
  {
    n: 'B',
    name: 'Receiver unit',
    body: 'Accepts light through a swappable head, either a fiber collimator or a telescope with a fine steering mirror, then compensates, analyzes, and time-tags it on four channels.',
    parts: ['Swappable fiber or telescope head', 'Beacon polarimeter lock', 'Linear and circular analyzers', 'MZI-mesh receiver chip (pilot)'],
  },
  {
    n: 'C',
    name: 'Baseplate and gimbal',
    body: 'Carries one or more units on kinematic mounts with defined datums. Each pointed unit sits on an azimuth and elevation gimbal, with fiber routed along the axes.',
    parts: ['Kinematic, repeatable seats', 'Two-axis gimbal with homing', 'Boresight calibration', 'No electrical path to the signal'],
  },
]

export function Platform() {
  return (
    <section id="platform" className="relative border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="wrap">
        <SectionLabel index="02">Platform</SectionLabel>
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(38px,4.8vw,76px)] lg:col-span-7">
            <MaskLines lines={['A deployment is a', 'configuration, not a', 'new product.']} />
          </h2>
          <Reveal as="p" className="text-[16px] leading-relaxed text-fog lg:col-span-5 max-w-[30rem]">
            The same two units serve a bench link, a long free-space link, and a mixed path. Customers choose the
            configuration they need, and as the photonic chips mature they drop into the same units.
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-[24px] border border-line">
            <ChipCanvas layout="panel" className="aspect-[4/3] sm:aspect-[16/8]" />
            <div className="pointer-events-none absolute right-0 top-0 p-5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70">
              Pilot receiver chip / live render
            </div>
          </div>
        </Reveal>

        <div className="mt-5 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line lg:grid-cols-3">
          {units.map((u, i) => (
            <Reveal key={u.n} delay={i * 0.08} className="bg-ink p-7 sm:p-10">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-2 font-mono text-[12px]">{u.n}</span>
                <span className="label">Unit</span>
              </div>
              <h3 className="mt-12 text-[30px] font-medium tracking-[-0.03em]">{u.name}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-fog">{u.body}</p>
              <ul className="mt-8 space-y-0">
                {u.parts.map((p) => (
                  <li key={p} className="flex items-center gap-3 border-t border-line py-3 text-[13px] text-bone/85">
                    <span className="h-1 w-1 rounded-full bg-laser" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
