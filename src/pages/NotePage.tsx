import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'

const notes = [
  {
    id: 1,
    title: 'Welcome to your notes',
    preview: 'Capture ideas, decisions, and next steps in one quiet workspace.',
    updated: 'Just now',
  },
  {
    id: 2,
    title: 'Project ideas',
    preview: 'A running list of improvements to explore with the team.',
    updated: 'Today',
  },
  {
    id: 3,
    title: 'Meeting notes',
    preview: 'Keep the important details close and turn them into action.',
    updated: 'Yesterday',
  },
]

export function NotePage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const filteredNotes = notes.filter((note) =>
    `${note.title} ${note.preview}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 dark:border-[#332140] dark:bg-[#1B1023] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8]">Personal workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">
            {user?.name ? `${user.name}'s notes` : 'Your notes'}
          </h1>
          <p className="mt-2 text-sm text-[#6B5C7A] dark:text-[#93839F]">Keep your thinking organized and easy to return to.</p>
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-[#7C2AE8] bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B22C9]">
          <Plus className="h-4 w-4" />
          New note
        </button>
      </section>

      <label className="relative block max-w-xl">
        <span className="sr-only">Search notes</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5C7A]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notes..."
          className="input pl-9"
        />
      </label>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredNotes.map((note) => (
          <article key={note.id} className="min-h-44 rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-shadow hover:shadow-lg dark:border-[#332140] dark:bg-[#1B1023]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">{note.title}</h2>
              <span className="shrink-0 font-mono text-[11px] text-[#93839F]">{note.updated}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{note.preview}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
