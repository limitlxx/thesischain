"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="border-border/40 border-dashed">
      <CardContent className="pt-12 pb-12">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-accent-deep/20 to-accent-warm/20">
              <BookOpen className="h-8 w-8 text-accent-warm" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Theses Yet</h3>
          <p className="text-foreground/60 mb-6 max-w-sm mx-auto">
            You haven't minted any thesis yet. Start by uploading your final year project and mint it as verifiable IP
            on Camp Network.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/mint">
              Mint Your First Thesis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
