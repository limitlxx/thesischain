"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { date: "Jan 1", earnings: 0 },
  { date: "Jan 8", earnings: 12.5 },
  { date: "Jan 15", earnings: 28.3 },
  { date: "Jan 22", earnings: 45.7 },
  { date: "Jan 29", earnings: 68.2 },
  { date: "Feb 5", earnings: 89.1 },
  { date: "Feb 12", earnings: 125.6 },
  { date: "Feb 19", earnings: 156.8 },
  { date: "Feb 26", earnings: 198.4 },
  { date: "Mar 5", earnings: 242.15 },
  { date: "Mar 12", earnings: 588.16 },
]

export function EarningsChart() {
  return (
    <ChartContainer
      config={{
        earnings: {
          label: "Earnings (USDC)",
          color: "hsl(var(--color-accent-warm))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            stroke="var(--color-foreground)"
            style={{ fontSize: "12px" }}
            tick={{ fill: "var(--color-foreground)" }}
          />
          <YAxis
            stroke="var(--color-foreground)"
            style={{ fontSize: "12px" }}
            tick={{ fill: "var(--color-foreground)" }}
            label={{ value: "Earnings (USDC)", angle: -90, position: "insideLeft" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="var(--color-accent-warm)"
            strokeWidth={2}
            dot={{ fill: "var(--color-accent-warm)", r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
