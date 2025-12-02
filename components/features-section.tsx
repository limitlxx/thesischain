import { Card } from "@/components/ui/card"
import { Network, Zap, Lock, BookOpen, TrendingUp, Users } from "lucide-react"

const features = [
  {
    icon: Network,
    title: "Decentralized Network",
    description: "Connect with researchers and developers across Africa through our blockchain-based platform.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Smart contracts ensure instant verification and authentication of academic credentials.",
  },
  {
    icon: Lock,
    title: "Secure Storage",
    description: "Your research is protected by Camp Network blockchain security and encryption.",
  },
  {
    icon: BookOpen,
    title: "Open Publishing",
    description: "Publish your theses directly to the blockchain with permanent, immutable records.",
  },
  {
    icon: TrendingUp,
    title: "Tokenized Rewards",
    description: "Earn tokens for contributions, citations, and peer reviews on the network.",
  },
  {
    icon: Users,
    title: "Community Collaboration",
    description: "Build meaningful connections with researchers sharing your academic interests.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 lg:py-32 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-accent-deep to-accent-warm bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Everything you need to collaborate, publish, and grow your academic career on the blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group relative border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:border-accent-deep/50"
              >
                <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-accent-deep/5 to-accent-warm/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent-deep/20 to-accent-warm/20 group-hover:from-accent-deep/30 group-hover:to-accent-warm/30 transition-colors">
                    <Icon className="h-6 w-6 text-accent-deep group-hover:text-accent-warm transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
