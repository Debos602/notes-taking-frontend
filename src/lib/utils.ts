import { z } from 'zod'
import type { Priority, Status } from '../types'

export const priorityOptions: Priority[] = ['Low', 'Medium', 'High']
export const statusOptions: Status[] = ['Pending', 'InProgress', 'Completed']

export const priorityOrder: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or fewer'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  priority: z.enum(['Low', 'Medium', 'High'], {
    error: 'Priority is required',
  }),
  status: z.enum(['Pending', 'InProgress', 'Completed']).optional(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const priorityColors: Record<Priority, string> = {
  Low: 'bg-green-100 text-green-800 ring-green-200',
  Medium: 'bg-amber-100 text-amber-800 ring-amber-200',
  High: 'bg-rose-100 text-rose-800 ring-rose-200',
}

export const statusColors: Record<Status, string> = {
  Pending: 'bg-slate-100 text-slate-700 ring-slate-200',
  InProgress: 'bg-blue-100 text-blue-800 ring-blue-200',
  Completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function zodToErrors(
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.length ? String(issue.path.join('.')) : 'form'
    out[path] = issue.message
  }
  return out
}
