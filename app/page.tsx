import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorks } from "@/components/how-it-works"
import { CTASection } from "@/components/cta-section"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <CTASection />
      <FeaturesSection />
      <Footer />
    </main>
  )
}
