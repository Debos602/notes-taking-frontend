import { TrendingUp, type LucideIcon } from 'lucide-react'
import { ACCENT, ACCENT_SOFT, CARD, INK, INK_SOFT, LINE } from './dashboardStyles'

interface DashboardStatCardProps {
  label: string
  value: number
  detail: string
  icon: LucideIcon
}

export function DashboardStatCard({ label, value, detail, icon: Icon }: DashboardStatCardProps) {
  return (
    <div data-dashboard-animate className={`${CARD} p-4 transition-colors sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm ${INK_SOFT}`}>{label}</p>
          <p className={`mt-3 text-3xl font-bold ${INK}`}>{value}</p>
        </div>
        <div className={`rounded-sm border-2 p-2.5 ${LINE} ${ACCENT_SOFT}`}>
          <Icon className={`h-5 w-5 ${INK}`} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs">
        <TrendingUp className="h-3.5 w-3.5" style={{ color: ACCENT }} />
        <span className={`font-mono tracking-wide ${INK_SOFT}`}>{detail}</span>
      </div>
    </div>
  )
}
