"use client"
import { Sparkles } from "lucide-react"
import { MagicBook3D } from "./magic-book-3d"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent-deep/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-deep/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-warm/10 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-deep/30 bg-accent-deep/10 px-4 py-2 w-fit">
              <Sparkles className="h-4 w-4 text-accent-deep" />
              <span className="text-sm font-medium text-accent-deep">Powered by Camp Network</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-pretty">
                Your Final Year Project Deserves to Live Forever
              </h1>

              <p className="text-xl text-foreground/70 leading-relaxed">
                Mint it as verifiable IP on Camp Network and earn royalties every time someone builds on it.
              </p>
            </div>

            {/* <div className="flex flex-col sm:flex-row gap-4">
              <w3m-button />
            </div> */}
          </div>

          {/* Right Visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-deep/20 to-accent-warm/20 blur-2xl animate-pulse" />
              <div className="absolute inset-0">
                <MagicBook3D />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-2 border-accent-warm/30 animate-spin [animation-duration:20s]" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border-2 border-accent-deep/30 animate-spin [animation-duration:25s] [animation-direction:reverse]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
