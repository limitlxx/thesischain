"use client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MintWizard } from "@/components/mint-wizard"

export default function MintPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12 px-4 md:px-8">
        <MintWizard />
      </div>
      <Footer />
    </main>
  )
}
