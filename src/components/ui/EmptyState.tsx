import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  title = 'No tasks found',
  description = 'There are currently no tasks. Create one to get started.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center sm:py-14">
      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-800">
        <svg
          className="h-6 w-6 text-secondary-400 dark:text-secondary-500 sm:h-8 sm:w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6M9 16h6M12 8V6m0 0a2 2 0 012 2v1m-2-3V6a2 2 0 012-2h.01M12 6v1m0 0V6zm0 0h-1a2 2 0 00-2 2v4a2 2 0 002 2h1"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100">{title}</h3>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{description}</p>
      </div>
      {action}
    </div>
  )
}
