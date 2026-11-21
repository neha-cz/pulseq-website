import { MaskLines, Reveal, SectionLabel } from './motion'

const units = [
  {
    n: 'A',
    name: 'Modular terminals',
    body: 'A source and a receiver, each with a fiber port and a free-space port. The receiver’s input head swaps between an FC/APC collimator and a telescope with a fine steering mirror.',
    parts: ['FC/APC 780HP fiber port', 'Free-space optical head', 'Swappable receiver head', 'Si SPAD or SNSPD, same interface'],
  },
  {
    n: 'B',
    name: 'Optical extension nodes',
    body: 'A receiver in relay mode and a source in relay-launch mode share one baseplate and pass the beam through fiber in the mount. A node adds only loss and a fixed delay, and it never detects light or holds key material.',
    parts: ['Free space → fiber → free space', 'Space- or tower-based extension', 'Hardware interlocks in relay mode', 'In feasibility study'],
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
        <SectionLabel index="03">Platform</SectionLabel>
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(38px,4.8vw,76px)] lg:col-span-7">
            <MaskLines lines={['A deployment is a', 'configuration, not a', 'new product.']} />
          </h2>
          <Reveal as="p" className="text-[16px] leading-relaxed text-fog lg:col-span-5 max-w-[30rem]">
            The same terminal pair serves a tabletop link, a rooftop free-space link, a fiber link, and paths that mix the
            two. Customers choose the configuration they need, and the hardware stays the same.
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line lg:grid-cols-3">
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
                    <span className="h-1 w-1 rounded-full bg-accent" />
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
