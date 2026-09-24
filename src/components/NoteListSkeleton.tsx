export function NoteListSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading notes" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <article key={index} className="min-h-44 animate-pulse rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-5 dark:border-[#332140] dark:bg-[#1B1023]">
          <div className="flex items-start justify-between gap-3">
            <div className="h-5 w-3/5 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-3 w-16 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-3 w-5/6 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-3 w-2/3 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
          </div>
        </article>
      ))}
    </section>
  )
}
