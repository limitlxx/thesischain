"use client"

import { useEffect, useState } from "react"

interface CounterProps {
  end: number
  label: string
  suffix?: string
}

function AnimatedCounter({ end, label, suffix }: CounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const increment = end / (duration / 50)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [end])

  return (
    <div className="text-center">
      <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent-deep to-accent-warm bg-clip-text text-transparent">
        {count}
        {suffix}
      </p>
      <p className="text-foreground/60 text-sm lg:text-base mt-2">{label}</p>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="relative py-16 lg:py-24">
      {/* African Textile Pattern Divider */}
      <div className="absolute top-0 left-0 right-0 h-1">
        <div className="h-full bg-gradient-to-r from-transparent via-accent-warm to-transparent opacity-30" />
        <div className="flex gap-2 px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-accent-deep/40" />
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 py-8">
          <AnimatedCounter end={80} label="of African student projects disappear" suffix="%" />
          <AnimatedCounter end={0} label="royalties earned today on traditional platforms" />
          <div className="text-center">
            <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent-warm to-accent-deep bg-clip-text text-transparent">
              $50B
            </p>
            <p className="text-foreground/60 text-sm lg:text-base mt-2">informal academic economy untapped</p>
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <div className="flex gap-2 px-4 justify-end">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-accent-warm/40" />
          ))}
        </div>
        <div className="h-full bg-gradient-to-l from-transparent via-accent-deep to-transparent opacity-30" />
      </div>
    </section>
  )
}
