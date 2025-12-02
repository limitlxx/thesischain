"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-deep/5 via-accent-warm/5 to-accent-deep/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-deep/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-pretty">
              Ready to Protect Your Research?
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Connect your wallet now and mint your thesis on Camp Network. Start building your academic legacy today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <w3m-button /> */}
            <Button variant="outline" asChild size="lg">
              <Link href="#" className="flex items-center gap-2">
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-foreground/50">No gas fees for first 100 users. Campaign ends soon.</p>
        </div>
      </div>
    </section>
  )
}
