"use client"

import { Card } from "@/components/ui/card"
import { Zap, CheckCircle, TrendingUp } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Mint Your Thesis",
    description: "Connect your wallet and mint your final year project as an NFT on Camp Network blockchain",
    icon: Zap,
    gradient: "from-accent-deep/20 to-accent-deep/5",
  },
  {
    number: 2,
    title: "Get Validated",
    description: "Community experts review and validate your research, adding credibility and proof of ownership",
    icon: CheckCircle,
    gradient: "from-accent-warm/20 to-accent-warm/5",
  },
  {
    number: 3,
    title: "Earn & Be Discovered",
    description:
      "Earn royalties when developers build on your work and get discovered by the global research community",
    icon: TrendingUp,
    gradient: "from-accent-deep/20 to-accent-warm/10",
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-pretty">
            <span className="bg-gradient-to-r from-accent-deep to-accent-warm bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Three simple steps to protect your intellectual property and start earning
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-4 w-8 h-1 bg-gradient-to-r from-accent-deep/30 to-transparent" />
                )}

                <Card
                  className={`relative border-border/50 bg-gradient-to-br ${step.gradient} hover:border-accent-deep/50 transition-all duration-300 overflow-hidden group`}
                >
                  {/* Animated accent corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-warm/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-8 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent-deep/40 to-accent-warm/40">
                        <Icon className="h-6 w-6 text-accent-deep" />
                      </div>
                      <span className="text-5xl font-bold text-accent-deep/10">{step.number}</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl text-foreground">{step.title}</h3>
                      <p className="text-foreground/60 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
