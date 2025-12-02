"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Bell } from "lucide-react"

interface Validation {
  id: string
  thesisTitle: string
  supervisorName: string
  submittedAt: string
}

interface ValidationRequestsProps {
  validations: Validation[]
}

export function ValidationRequests({ validations }: ValidationRequestsProps) {
  if (!validations || validations.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="pt-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/60">No pending validations</p>
            <p className="text-sm text-foreground/40 mt-1">Your theses are validated or awaiting supervisor review</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {validations.map((validation) => (
        <Card key={validation.id} className="border-border/40 hover:border-accent/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{validation.thesisTitle}</h3>
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-foreground/60 mb-1">
                  Awaiting validation from{" "}
                  <span className="font-medium text-foreground">{validation.supervisorName}</span>
                </p>
                <p className="text-xs text-foreground/40">Submitted {validation.submittedAt}</p>
              </div>

              {/* Actions */}
              <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap bg-transparent">
                <Bell className="h-4 w-4" />
                Remind
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
