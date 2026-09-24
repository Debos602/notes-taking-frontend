import type { Priority, Status } from '../../types'
import { priorityColors, statusColors } from '../../lib/utils'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const classes = priorityColors[priority] ?? priorityColors.Medium
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${classes}`}
    >
      {priority}
    </span>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const classes = statusColors[status] ?? statusColors.Pending
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${classes}`}
    >
      {status === 'InProgress' ? 'In Progress' : status}
    </span>
  )
}
