export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard" role="status">
      <section className="rounded-2xl border border-secondary-200/80 bg-white/80 p-5 shadow-sm dark:border-secondary-800 dark:bg-secondary-900/70 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
            <div className="h-8 w-56 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-lg bg-secondary-200 dark:bg-secondary-800 sm:w-28" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-secondary-200/80 bg-secondary-100 dark:border-secondary-800 dark:bg-secondary-900"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-secondary-200/80 bg-white/80 p-5 shadow-sm dark:border-secondary-800 dark:bg-secondary-900/70 sm:p-6"
          >
            <div className="h-6 w-32 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
            <div className="mt-4 h-64 animate-pulse rounded-xl bg-secondary-100 dark:bg-secondary-800/70" />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-secondary-200/80 bg-white/80 p-5 shadow-sm dark:border-secondary-800 dark:bg-secondary-900/70 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="h-6 w-32 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
          <div className="h-4 w-14 animate-pulse rounded bg-secondary-200 dark:bg-secondary-800" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl border border-secondary-200 bg-secondary-50/70 dark:border-secondary-800 dark:bg-secondary-800/40"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
