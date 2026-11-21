import { motion } from 'framer-motion'
import { Arrow } from './Hero'
import { Logo } from './Nav'
import { Callout, Cinematic } from './Media'
import { MaskLines, Reveal, SectionLabel } from './motion'

const CONTACT = 'hello@comptonnetworks.example'

export function Company() {
  return (
    <section id="company" className="relative overflow-hidden border-t border-line py-[clamp(96px,12vw,180px)]">
      <div className="pointer-events-none absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[140px]" />
      <div className="wrap relative">
        <SectionLabel index="04">Company</SectionLabel>
        <div className="mt-10 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display text-[clamp(38px,4.8vw,76px)]">
              <MaskLines lines={['Spun out of the', 'Zhong Lab at the', 'University of Chicago.']} />
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-5 text-[16px] leading-relaxed text-fog lg:pt-4">
            <Reveal as="p">
              Compton Networks is a team of eight undergraduate researchers and engineers, spun out of Professor Tian
              Zhong&apos;s lab and the undergraduate space program at the University of Chicago.
            </Reveal>
            <Reveal as="p" delay={0.06}>
              We believe quantum security needs to become as deployable as the optical networks themselves. Our first goal
              is an end-to-end key exchange between modular PULSE-Q source and receiver terminals, starting with a tabletop
              demonstration and moving to rooftop and drone-carried links.
            </Reveal>
            <Reveal as="p" delay={0.12}>
              PULSE-Q builds on PULSE-A, a free-space optical satellite mission from the UChicago Space Program that has
              completed risk-reduction testing and is set to launch in 2027. We have passed a mission concept review for
              satellite-based QKD, presented a space-to-ground QKD baseline at SmallSat 2026, and collaborate with
              NASA&apos;s JPL on the Deep Space Quantum Link.
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-20">
          <Cinematic name="lab" alt="Quantum optics bench at night with a photonic chip on a probe stage and a violet laser" className="aspect-[4/3] rounded-[24px] border border-line sm:aspect-[21/9]" drift="left">
            <Callout x={73} y={64} label="Chip on probe stage" side="left" n="LAB" />
            <div className="absolute bottom-0 left-0 p-5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/70">Bench characterization</div>
          </Cinematic>
        </Reveal>
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
        <SectionLabel index="05">Contact</SectionLabel>
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
              Building the next generation of quantum-secure optical infrastructure. Makers of PULSE-Q.
            </p>
          </div>
          <nav aria-label="Footer" className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3 text-[14px]">
            <ul className="space-y-3">
              <li className="label mb-4">Product</li>
              <li><a className="link-draw text-fog hover:text-bone" href="#network">Network</a></li>
              <li><a className="link-draw text-fog hover:text-bone" href="#pulseq">PULSE-Q</a></li>
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
          <span>© 2026 Compton Networks</span>
          <span>Chicago, Illinois</span>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="wrap">
          <p aria-hidden className="display select-none text-[clamp(80px,22vw,340px)] leading-[0.78] tracking-[-0.06em] text-ink-3 translate-y-[12%]">
            Compton
          </p>
        </div>
      </div>
    </footer>
  )
}
