import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import { useEffect } from 'react'
import { Applications } from './components/Applications'
import { Company, Contact, Footer, Security } from './components/Closing'
import { Film } from './components/Film'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Platform } from './components/Platform'
import { Stack } from './components/Stack'
import { Statement } from './components/Statement'

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15, anchors: { offset: -64 } })
    let raf = 0
    const tick = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a href="#stack" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Stack />
        <Film />
        <Platform />
        <Applications />
        <Security />
        <Company />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
