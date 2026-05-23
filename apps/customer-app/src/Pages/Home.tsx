import React from 'react'
import Hero from '../Components/HomePage/Hero'
import TrustedBy from '../Components/HomePage/TrustedBy'
import HowItWorks from '../Components/HomePage/HowItWorks'
import BrandHome from '../Components/HomePage/BrandHome'
import Services from '../Components/HomePage/Services'
import Testimonials from '../Components/HomePage/Testimonials'
import WhyChooseUs from '../Components/HomePage/WhyChooseUs'
import Footer from '../Components/Footer'
import QuickQuote from '../Components/HomePage/QuickQuote'
import Comparison from '../Components/HomePage/Comparison'
import SafeSection from '../Components/HomePage/SafeSection'
import FaqSection from '../Components/HomePage/FaqSection'
import CtaSection from '../Components/HomePage/CtaSection'
const Home = () => {
  return (
    <div className="home-landing">
      <Hero />
      <TrustedBy />
      <main className="home-landing__main">
        <HowItWorks />
        <BrandHome />
        <Services />
        <QuickQuote />
        <SafeSection />
        <Comparison />
        <WhyChooseUs />
        <Testimonials />
        <FaqSection />
        <CtaSection />  
      </main>

      <Footer />
    </div>
  )
}

export default Home
