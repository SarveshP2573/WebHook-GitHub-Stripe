import { useState } from 'react'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import SnowAnimation from '../components/ShowAnimation'

const Home = () => {
  const [activeFeature, setActiveFeature] = useState('slack')

  return (
    <div className='home-page'>
      <HeroSection />
      <FeaturesSection
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
      />
      <Footer />
      <SnowAnimation />
    </div>
  )
}

export default Home
