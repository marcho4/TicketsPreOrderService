import HeroSection from '@/components/HeroSection'
import SocialProof from '@/components/SocialProof'
import CallToAction from '@/components/CallToAction'
import Features from '@/components/Features'

export default function Home() {
  return (
    <div className="@container mx-auto px-8 md:px-12 lg:px-16">
      <HeroSection />
      <SocialProof />
      <Features />
      <CallToAction />
    </div>
  )
}

