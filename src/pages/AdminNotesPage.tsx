import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, ChevronLeft, ChevronRight, Shield, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { NoteListSkeleton } from '../components/NoteListSkeleton'
import { useAuth } from '../contexts/useAuth'
import { getAllNotes } from '../lib/notesApi'

const PAGE_SIZE = 9

export function AdminNotesPage() {
  const { user, token } = useAuth()
  const [page, setPage] = useState(1)

  const notesQuery = useQuery({
    queryKey: ['all-notes', page, token],
    queryFn: () => getAllNotes(page, PAGE_SIZE, token),
    placeholderData: keepPreviousData,
    enabled: user?.role === 'ADMIN',
  })

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        Access denied.
      </div>
    )
  }

  if (notesQuery.isLoading) return <NoteListSkeleton />

  if (notesQuery.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {notesQuery.error instanceof Error ? notesQuery.error.message : 'Unable to load all notes.'}
      </div>
    )
  }

  const notes = notesQuery.data?.data ?? []
  const totalPages = notesQuery.data?.meta.totalPage ?? 1

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E0D7E7] bg-gradient-to-br from-[#FAF8FB] via-[#F5EFFA] to-[#EDE3F7] p-6 shadow-sm dark:border-[#332140] dark:from-[#1B1023] dark:via-[#1F1329] dark:to-[#241533] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#7C2AE8]/10 blur-3xl dark:bg-[#7C2AE8]/20" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7C2AE8]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8] dark:bg-[#7C2AE8]/15">
            <Shield className="h-3 w-3" />
            Administration
          </div>
          <h1 className="mt-3 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">
            <StickyNote className="h-7 w-7 text-[#7C2AE8]" />
            All notes
          </h1>
          <p className="mt-2 text-sm text-[#6B5C7A] dark:text-[#93839F]">Review notes created by everyone in the workspace.</p>
        </div>
      </section>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E0D7E7] p-12 text-center dark:border-[#332140]">
          <StickyNote className="h-8 w-8 text-[#C9BAD6] dark:text-[#4A3760]" />
          <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">No notes found.</p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="group flex min-h-48 flex-col rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7C2AE8]/40 hover:shadow-lg dark:border-[#332140] dark:bg-[#1B1023]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-[#2A1A3D] transition-colors group-hover:text-[#7C2AE8] dark:text-[#EEE6F4]">{note.title}</h2>
                <span className="shrink-0 font-mono text-[11px] text-[#93839F]">{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{note.content}</p>
              <div className="mt-5 flex items-center gap-3 border-t border-[#E0D7E7] pt-3 dark:border-[#332140]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#CFE2FF] text-[10px] font-semibold text-[#24558F] dark:bg-[#2A3F5C] dark:text-[#8FB8EE]">
                  {note.owner?.name?.slice(0, 2)?.toUpperCase() ?? '??'}
                </span>
                <div className="min-w-0 text-xs">
                  <p className="truncate font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">{note.owner?.name ?? 'Unknown user'}</p>
                  <p className="truncate text-[#6B5C7A] dark:text-[#93839F]">{note.owner?.email ?? 'No email'}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-4 dark:border-[#332140] dark:bg-[#1B1023]">
        <p className="font-mono text-xs text-[#6B5C7A] dark:text-[#93839F]">
          Page {page} of {totalPages} · {notesQuery.data?.meta.total ?? 0} notes
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || notesQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E0D7E7] px-3 py-2 text-sm transition-colors hover:bg-[#F1E9F5] disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#332140] dark:hover:bg-[#2A1938]"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || notesQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E0D7E7] px-3 py-2 text-sm transition-colors hover:bg-[#F1E9F5] disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#332140] dark:hover:bg-[#2A1938]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}