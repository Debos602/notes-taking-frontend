export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-secondary-500 dark:text-secondary-400 sm:py-10">
      <div className="relative">
        <div className="h-10 w-10 rounded-full border-4 border-secondary-200 border-t-primary-600 animate-spin dark:border-secondary-700" />
        <div className="absolute inset-0 -z-10 h-10 w-10 rounded-full border-4 border-transparent border-t-primary-600 animate-ping opacity-40" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )
}
