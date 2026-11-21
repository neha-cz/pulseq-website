import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { ease } from './motion'

const links = [
  { href: '#network', label: 'Network' },
  { href: '#pulseq', label: 'PULSE-Q' },
  { href: '#platform', label: 'Platform' },
  { href: '#applications', label: 'Applications' },
  { href: '#company', label: 'Company' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
        {/* Compton scattering: an incoming wave scatters off a point into an outgoing ray */}
        <path d="M2 19 q2.6 -6 5.2 0 t5.2 0 t5.2 0" fill="none" stroke="#b9a3e8" strokeWidth="2" />
        <path d="M18 19 L28 9" stroke="currentColor" strokeWidth="2" />
        <path d="M23 9 H28 V14" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="19" r="2.6" fill="#8b3ff0" />
      </svg>
      <span className="text-[17px] font-medium tracking-[-0.02em]">Compton Networks</span>
    </span>
  )
}

export function Nav() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 240 && !open)
    setSolid(y > 40)
  })

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.5, ease }}
    >
      <div
        className={`transition-colors duration-500 ${solid || open ? 'bg-ink/80 backdrop-blur-xl border-b border-line' : 'border-b border-transparent'}`}
      >
        <nav className="wrap flex h-16 items-center justify-between" aria-label="Primary">
          <a href="#top" aria-label="Compton Networks home" className="text-bone">
            <Logo />
          </a>
          <ul className="hidden md:flex items-center gap-8 text-[13px] text-fog">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-draw hover:text-bone transition-colors py-1">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden sm:inline-flex btn btn-primary !h-9 !px-4 !text-[13px]">
              Request a briefing
            </a>
            <button
              className="md:hidden inline-flex h-11 w-11 items-center justify-center"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-bone transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-px w-5 bg-bone transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.ul
              className="md:hidden wrap pb-6 flex flex-col"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              {[...links, { href: '#contact', label: 'Request a briefing' }].map((l) => (
                <li key={l.href} className="border-t border-line">
                  <a href={l.href} onClick={() => setOpen(false)} className="flex h-14 items-center text-2xl tracking-tight">
                    {l.label}
                  </a>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
