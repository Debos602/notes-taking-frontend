import { formatStatus, statusColors } from './dashboardStyles'

export function DashboardStatusTag({ status }: { status: string }) {
  const label = formatStatus(status)
  const color = statusColors[label]?.light ?? '#6B5C7A'
  const colorDark = statusColors[label]?.dark ?? '#93839F'

  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-sm border-2 px-2 py-0.5 font-mono text-[11px] tracking-wide"
      style={{ borderColor: color, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full dark:hidden" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="hidden h-1.5 w-1.5 rounded-full dark:inline-block" style={{ backgroundColor: colorDark }} aria-hidden="true" />
      {label}
    </span>
  )
}
