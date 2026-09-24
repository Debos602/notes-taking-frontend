const statuses = ['pending', 'progress', 'completed']

export function TaskBoardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" aria-label="Loading tasks" role="status">
      {statuses.map((status) => (
        <div
          key={status}
          className="min-h-80 rounded-2xl border border-secondary-200 bg-secondary-50/80 p-3 dark:border-secondary-800 dark:bg-secondary-950/30"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary-300 dark:bg-secondary-700" />
              <div className="h-4 w-20 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
              <div className="h-5 w-7 animate-pulse rounded-full bg-secondary-200 dark:bg-secondary-800" />
            </div>
            <div className="h-3 w-14 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
          </div>

          <div className="min-h-64 space-y-3 rounded-xl border border-dashed border-secondary-200/80 p-1.5 dark:border-secondary-800">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-secondary-200 bg-white p-4 shadow-sm dark:border-secondary-800 dark:bg-secondary-900"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="h-7 w-7 shrink-0 rounded-md bg-secondary-200 dark:bg-secondary-800" />
                    <div className="h-4 w-3/4 rounded bg-secondary-200 dark:bg-secondary-800" />
                  </div>
                  <div className="h-5 w-10 rounded bg-secondary-200 dark:bg-secondary-800" />
                </div>
                <div className="mb-2 h-3 w-full rounded bg-secondary-100 dark:bg-secondary-800/80" />
                <div className="mb-5 h-3 w-2/3 rounded bg-secondary-100 dark:bg-secondary-800/80" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-14 rounded-full bg-secondary-200 dark:bg-secondary-800" />
                    <div className="h-5 w-16 rounded-full bg-secondary-200 dark:bg-secondary-800" />
                  </div>
                  <div className="h-3 w-16 rounded bg-secondary-100 dark:bg-secondary-800/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
