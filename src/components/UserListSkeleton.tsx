export function UserListSkeleton() {
  return (
    <section className="overflow-hidden rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] dark:border-[#332140] dark:bg-[#1B1023]" aria-label="Loading users" role="status">
      <div className="animate-pulse divide-y divide-[#E0D7E7] dark:divide-[#332140]">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid min-w-170 grid-cols-6 gap-4 p-4">
            <div className="h-4 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-4 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-4 w-16 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-4 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="h-4 w-24 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
            <div className="ml-auto h-8 w-20 rounded-sm bg-[#E0D7E7] dark:bg-[#332140]" />
          </div>
        ))}
      </div>
    </section>
  )
}
