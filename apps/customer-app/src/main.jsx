import './responsive.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Global smooth scrolling (all pages) + GSAP sync
const lenis = new Lenis({
  duration: 1.15,
  smoothWheel: true,
  smoothTouch: false,
  wheelMultiplier: 1,
})

// Keep ScrollTrigger in sync with Lenis (fixes scroll-driven tweens never completing)
ScrollTrigger.scrollerProxy(document.documentElement, {
  scrollTop(value) {
    if (arguments.length) {
      lenis.scrollTo(value, { immediate: true })
    }
    return lenis.animatedScroll
  },
})

lenis.on('scroll', () => {
  ScrollTrigger.update()
})

requestAnimationFrame(() => ScrollTrigger.refresh())

gsap.ticker.add((time) => {
  // GSAP time is in seconds; Lenis expects ms.
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

