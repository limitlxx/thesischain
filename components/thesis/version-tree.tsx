"use client"
import { GitBranch } from "lucide-react"

interface Version {
  id: string
  title: string
  date: string
  author: string
  isFork?: boolean
}

interface VersionTreeProps {
  versions: Version[]
}

export function VersionTree({ versions }: VersionTreeProps) {
  return (
    <div className="space-y-4">
      {versions.map((version, index) => (
        <div key={version.id} className="relative">
          {/* Connector Line */}
          {index < versions.length - 1 && <div className="absolute left-3 top-8 w-0.5 h-12 bg-border"></div>}

          {/* Version Node */}
          <div className="flex gap-3">
            {/* Timeline Circle */}
            <div className="flex flex-col items-center pt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  version.isFork
                    ? "bg-accent-warm ring-2 ring-accent-warm/30"
                    : "bg-accent-deep ring-2 ring-accent-deep/30"
                }`}
              ></div>
            </div>

            {/* Version Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-sm text-foreground leading-tight">{version.title}</h4>
                {version.isFork && <GitBranch className="w-3 h-3 text-accent-warm flex-shrink-0 mt-0.5" />}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {new Date(version.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground truncate">{version.author}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
