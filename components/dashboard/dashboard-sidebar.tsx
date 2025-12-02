"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, Activity, TrendingUp, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      id: "ipnfts",
      label: "My IPNFTs",
      icon: FileText,
      href: "/dashboard",
    },
    {
      id: "activity",
      label: "Activity",
      icon: Activity,
      href: "/dashboard",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      href: "/dashboard",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboard",
    },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border/40">
        <h2 className="font-semibold text-foreground">Dashboard</h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Mint CTA */}
      <div className="p-4 border-t border-border/40">
        <Button asChild className="w-full" size="sm">
          <Link href="/mint" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Mint New IPNFT
          </Link>
        </Button>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border/40 text-xs text-foreground/50">
        <p className="text-center">Connected to Camp Network</p>
      </div>
    </aside>
  )
}
