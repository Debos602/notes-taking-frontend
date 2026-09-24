import type { ReactNode } from 'react'
import { CARD, INK } from './dashboardStyles'

interface DashboardChartPanelProps {
  title: string
  children: ReactNode
}

export function DashboardChartPanel({ title, children }: DashboardChartPanelProps) {
  return (
    <section data-dashboard-animate className={`${CARD} p-5 sm:p-6`}>
      <h3 className={`text-lg font-semibold tracking-tight ${INK}`}>{title}</h3>
      <div className="mt-4 h-64 w-full">{children}</div>
    </section>
  )
}
