import type { Metadata } from "next"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export const metadata: Metadata = {
  title: "My Dashboard - ThesisChain Africa",
  description: "Manage your minted theses, track earnings, and view validation requests",
}

export default function DashboardPage() {
  return <DashboardClient />
}
