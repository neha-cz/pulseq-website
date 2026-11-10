import { motion } from 'framer-motion'
import { Arrow } from './Hero'
import { Logo } from './Nav'
import { Callout, Cinematic } from './Media'
import { MaskLines, Reveal, SectionLabel } from './motion'

const CONTACT = 'hello@malus.example'

const security = [
  ['The whole path is untrusted', 'Every link, fold, and relay is treated as reachable by an adversary. Security rests on what the endpoints measure, not on protecting the channel.'],
  ['No key material in the middle', 'No intermediate component or party in the path ever holds key material, and relays add only loss and a fixed delay.'],
  ['Hardware interlocks', 'A reverse-light watchdog trips the laser through an interlock that does not depend on firmware, and the Source drops to a safe optical state.'],
  ['Defended against light injection', 'Counted isolators, an exit guard, and a bright-light watchdog at the Receiver address back-reflection probing and detector blinding.'],
  ['Quantum randomness', 'Basis and intensity choices come from a quantum random number generator with defined health tests and failure handling.'],
  ['No key on a failed check', 'If parameter estimation fails, the endpoints output no key. The classical channel is authenticated end to end.'],
]

export function Security() {
  return (
    <section id="security" className="relative border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="wrap">
        <SectionLabel index="04">Security model</SectionLabel>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(38px,4.8vw,76px)] lg:col-span-6">
            <MaskLines lines={['Designed in from the', 'output plane outward.']} />
          </h2>
          <Reveal className="lg:col-span-6">
            <Cinematic name="optics" alt="Receiver aperture with crossed red laser lines" className="aspect-[16/10] rounded-[24px] border border-line" drift="in">
              <Callout x={51} y={50} label="Watchdog on every port" n="SEC" />
            </Cinematic>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {security.map(([t, b], i) => (
            <Reveal key={t} delay={(i % 3) * 0.06} className="group relative bg-ink p-8 sm:p-10 transition-colors duration-500 hover:bg-ink-2">
              <span className="font-mono text-[11px] text-laser">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-10 text-[22px] font-medium tracking-[-0.02em]">{t}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-fog">{b}</p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-laser transition-all duration-700 group-hover:w-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const gates = [
  ['01', 'Laser and modulators', 'Pulse train, intensity levels, extinction, and phase randomness'],
  ['02', 'Source output chain', 'D, R, A, L states recorded, isolation and watchdog trip time'],
  ['03', 'Four-detector receiver', 'Each analyzer output detected, time-tagged, and recorded'],
  ['04', 'Short fiber link', 'Clock sync, compensation lock, and basis mapping verified'],
  ['05', 'Free-space link on gimbals', 'Beacon polarimeter lock, steering mirror tracking, and QBER'],
  ['06', 'Chip and SNSPD comparison', 'Efficiency, QBER, and control stability against the baseline'],
]

export function Company() {
  return (
    <section id="company" className="relative overflow-hidden border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="pointer-events-none absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-laser/10 blur-[140px]" />
      <div className="wrap relative">
        <SectionLabel index="05">Company</SectionLabel>
        <div className="mt-10 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display text-[clamp(38px,4.8vw,76px)]">
              <MaskLines lines={['Spun out of the', 'Zhong Lab at the', 'University of Chicago.']} />
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-5 text-[16px] leading-relaxed text-fog lg:pt-4">
            <Reveal as="p">
              Malus began in Professor Tian Zhong&apos;s lab at the University of Chicago Pritzker School of Molecular
              Engineering, where the group works on quantum photonics and quantum networking.
            </Reveal>
            <Reveal as="p" delay={0.06}>
              We believe quantum-secure links will only matter at scale if the whole system, from the photonics to the
              key processing, is integrated, affordable, and stable outside the lab. We are starting with the receiver
              chip as our pilot, and building toward the full stack one verified step at a time.
            </Reveal>
            <Reveal as="p" delay={0.12}>
              Our classical channel builds on terminal heritage from the PULSE-A mission, so the quantum and classical
              halves of the system grow from work that has already been done.
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-20">
          <Cinematic name="lab" alt="Quantum optics bench at night with a photonic chip on a probe stage and a red laser" className="aspect-[4/3] rounded-[24px] border border-line sm:aspect-[21/9]" drift="left">
            <Callout x={73} y={64} label="Chip on probe stage" side="left" n="LAB" />
            <div className="absolute bottom-0 left-0 p-5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70">Bench characterization</div>
          </Cinematic>
        </Reveal>

        <div className="mt-24">
          <Reveal className="flex items-center justify-between border-b border-line pb-5">
            <span className="label">Integration sequence</span>
            <span className="label hidden sm:block">Step / what we prove</span>
          </Reveal>
          <ol>
            {gates.map(([g, e, o], i) => (
              <Reveal as="li" key={g} delay={i * 0.04} className="group grid grid-cols-12 items-baseline gap-4 border-b border-line py-6 transition-colors hover:bg-ink-2/60">
                <span className="col-span-2 sm:col-span-1 font-mono text-[13px] text-laser">{g}</span>
                <span className="col-span-10 sm:col-span-4 text-[19px] tracking-[-0.02em]">{e}</span>
                <span className="col-span-12 sm:col-span-7 text-[14px] text-fog max-sm:pl-[calc(16.66%+4px)]">{o}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

const asks = [
  ['Pilot programs', 'For aerospace, defense, and data center teams who want to evaluate a configuration on their own link.', 'Pilot inquiry'],
  ['Investors', 'For partners who want to discuss our technical plan, our milestones, and where the product goes next.', 'Investor inquiry'],
  ['Careers', 'For photonics, optics, FPGA, and systems engineers who want to build quantum hardware that ships.', 'Careers'],
]

export function Contact() {
  return (
    <section id="contact" className="relative border-t border-line py-[clamp(96px,12vw,180px)] grain">
      <div className="wrap">
        <SectionLabel index="06">Contact</SectionLabel>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(48px,8vw,132px)] lg:col-span-8">
            <MaskLines lines={['Build the link', 'with us.']} />
          </h2>
          <Reveal as="p" className="lg:col-span-4 text-[16px] leading-relaxed text-fog max-w-[26rem]">
            We are working with early partners on pilot configurations, and we would welcome a conversation about the
            links you need to protect.
          </Reveal>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {asks.map(([t, b, subj], i) => (
            <Reveal key={t} delay={i * 0.06}>
              <a
                href={`mailto:${CONTACT}?subject=${encodeURIComponent(subj)}`}
                className="group flex h-full flex-col justify-between rounded-[20px] border border-line bg-ink-2 p-7 transition-all duration-500 hover:-translate-y-0.5 hover:border-line-2"
              >
                <div>
                  <h3 className="text-[24px] font-medium tracking-[-0.02em]">{t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-fog">{b}</p>
                </div>
                <span className="mt-10 inline-flex items-center gap-3 text-[14px] text-bone">
                  <span className="link-draw">Get in touch</span>
                  <motion.span className="inline-flex transition-transform duration-300 group-hover:translate-x-1">
                    <Arrow />
                  </motion.span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-5 max-w-[22rem] text-[14px] leading-relaxed text-ash">
              Makers of PULSE-Q, a fully integrated photonic quantum key distribution system, from chips to keys.
            </p>
          </div>
          <nav aria-label="Footer" className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3 text-[14px]">
            <ul className="space-y-3">
              <li className="label mb-4">Product</li>
              <li><a className="link-draw text-fog hover:text-bone" href="#stack">The system</a></li>
                            <li><a className="link-draw text-fog hover:text-bone" href="#platform">Platform</a></li>
            </ul>
            <ul className="space-y-3">
              <li className="label mb-4">Markets</li>
              <li><a className="link-draw text-fog hover:text-bone" href="#applications">Aerospace and defense</a></li>
              <li><a className="link-draw text-fog hover:text-bone" href="#applications">AI data centers</a></li>
            </ul>
            <ul className="space-y-3">
              <li className="label mb-4">Company</li>
              <li><a className="link-draw text-fog hover:text-bone" href="#company">About</a></li>
              <li><a className="link-draw text-fog hover:text-bone" href={`mailto:${CONTACT}?subject=Careers`}>Careers</a></li>
              <li><a className="link-draw text-fog hover:text-bone" href={`mailto:${CONTACT}`}>Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ash sm:flex-row sm:justify-between">
          <span>© 2026 Malus</span>
          <span>Chicago, Illinois</span>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="wrap">
          <p aria-hidden className="display select-none text-[clamp(80px,22vw,340px)] leading-[0.78] tracking-[-0.06em] text-ink-3 translate-y-[12%]">
            Malus
          </p>
        </div>
      </div>
    </footer>
  )
}
