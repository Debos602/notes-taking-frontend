import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Edit3, FileText, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { NoteListSkeleton } from '../components/NoteListSkeleton'
import { useAuth } from '../contexts/useAuth'
import { createNote, deleteNote, getNote, getNotes, updateNote } from '../lib/notesApi'

const PAGE_SIZE = 6

export function NotePage() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isEditingNote, setIsEditingNote] = useState(false)

  const notesQuery = useQuery({
    queryKey: ['notes', page, token],
    queryFn: () => getNotes(page, PAGE_SIZE, token),
    placeholderData: keepPreviousData,
  })
  const noteQuery = useQuery({
    queryKey: ['note', selectedNoteId, token],
    queryFn: () => getNote(selectedNoteId as string, token),
    enabled: Boolean(selectedNoteId),
  })
  const createMutation = useMutation({
    mutationFn: () => createNote({ title: title.trim(), content: content.trim() }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setTitle('')
      setContent('')
      setIsCreateModalOpen(false)
      setPage(1)
    },
  })
  const updateMutation = useMutation({
    mutationFn: () => updateNote(selectedNoteId as string, { title: title.trim(), content: content.trim() }, token),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(['note', selectedNoteId, token], updatedNote)
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setIsEditingNote(false)
    },
  })
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(deleteTargetId as string, token),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['note', deleteTargetId, token] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setDeleteTargetId(null)
      if (selectedNoteId === deleteTargetId) setSelectedNoteId(null)
    },
  })

  useEffect(() => {
    if (noteQuery.data) {
      setTitle(noteQuery.data.title)
      setContent(noteQuery.data.content)
    }
  }, [noteQuery.data])

  const notes = notesQuery.data?.data ?? []
  const totalPages = notesQuery.data?.meta.totalPage ?? 1

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E0D7E7] bg-gradient-to-br from-[#FAF8FB] via-[#F5EFFA] to-[#EDE3F7] p-6 shadow-sm dark:border-[#332140] dark:from-[#1B1023] dark:via-[#1F1329] dark:to-[#241533] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#7C2AE8]/10 blur-3xl dark:bg-[#7C2AE8]/20" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7C2AE8]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8] dark:bg-[#7C2AE8]/15">
              <Sparkles className="h-3 w-3" />
              Personal workspace
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">
              {user?.name ? `${user.name}'s notes` : 'Your notes'}
            </h1>
            <p className="mt-2 text-sm text-[#6B5C7A] dark:text-[#93839F]">Keep your thinking organized and easy to return to.</p>
          </div>
          <button
            type="button"
            onClick={() => { createMutation.reset(); setIsCreateModalOpen(true) }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7C2AE8] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#6B22C9] hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New note
          </button>
        </div>
      </section>

      {notesQuery.isLoading ? (
        <NoteListSkeleton />
      ) : notesQuery.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
          {notesQuery.error instanceof Error ? notesQuery.error.message : 'Unable to load notes.'}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E0D7E7] p-12 text-center dark:border-[#332140]">
          <FileText className="h-8 w-8 text-[#C9BAD6] dark:text-[#4A3760]" />
          <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">No notes yet — create your first one.</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <article
                key={note.id}
                onClick={() => { setSelectedNoteId(note.id); setIsEditingNote(false) }}
                className="group flex min-h-44 cursor-pointer flex-col rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7C2AE8]/40 hover:shadow-lg dark:border-[#332140] dark:bg-[#1B1023]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-[#2A1A3D] transition-colors group-hover:text-[#7C2AE8] dark:text-[#EEE6F4]">{note.title}</h2>
                  <span className="shrink-0 font-mono text-[11px] text-[#93839F]">{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{note.content}</p>
                <div className="mt-4 flex justify-end gap-2 border-t border-[#E0D7E7]/70 pt-3 dark:border-[#332140]">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); setSelectedNoteId(note.id); setIsEditingNote(true) }}
                    className="inline-flex h-8 w-8 items-center justify-center gap-1 overflow-hidden rounded-lg border border-[#7C2AE8]/40 px-2 text-xs font-medium text-[#7C2AE8] transition-all hover:bg-[#7C2AE8]/10 group-hover:w-18 group-focus-within:w-18"
                    aria-label="Edit note"
                  >
                    <Edit3 className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-0 opacity-0 transition-opacity group-hover:max-w-12 group-hover:opacity-100 group-focus-within:max-w-12 group-focus-within:opacity-100">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); setDeleteTargetId(note.id) }}
                    className="inline-flex h-8 w-8 items-center justify-center gap-1 overflow-hidden rounded-lg border border-[#B23A5C]/40 px-2 text-xs font-medium text-[#B23A5C] transition-all hover:bg-[#B23A5C]/10 group-hover:w-22 group-focus-within:w-22"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-0 opacity-0 transition-opacity group-hover:max-w-16 group-hover:opacity-100 group-focus-within:max-w-16 group-focus-within:opacity-100">Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </section>

          <div className="flex items-center justify-between rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-4 dark:border-[#332140] dark:bg-[#1B1023]">
            <p className="font-mono text-xs text-[#6B5C7A] dark:text-[#93839F]">
              Page {page} of {totalPages} · page={page} &amp; limit={PAGE_SIZE}
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
        </>
      )}

      {isCreateModalOpen && (
        <Modal title="Create note" onClose={() => !createMutation.isPending && setIsCreateModalOpen(false)}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="input mt-2" />
            </label>
            <label className="block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">
              Content
              <textarea value={content} onChange={(event) => setContent(event.target.value)} className="input mt-2 min-h-32 resize-y" />
            </label>
            {createMutation.isError && <p className="text-sm text-[#B23A5C]">{createMutation.error instanceof Error ? createMutation.error.message : 'Unable to create note.'}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-lg border border-[#E0D7E7] px-4 py-2 text-sm transition-colors hover:bg-[#F1E9F5] dark:border-[#332140] dark:hover:bg-[#2A1938]">Cancel</button>
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
                className="rounded-lg bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6B22C9] disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create note'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {selectedNoteId && (
        <Modal title={isEditingNote ? 'Edit note' : 'Note details'} onClose={() => !updateMutation.isPending && setSelectedNoteId(null)}>
          {noteQuery.isLoading ? (
            <p className="text-sm text-[#6B5C7A]">Loading note...</p>
          ) : noteQuery.isError ? (
            <p className="text-sm text-[#B23A5C]">{noteQuery.error instanceof Error ? noteQuery.error.message : 'Unable to load note.'}</p>
          ) : isEditingNote ? (
            <div className="space-y-4">
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="input" />
              <textarea value={content} onChange={(event) => setContent(event.target.value)} className="input min-h-32 resize-y" />
              {updateMutation.isError && <p className="text-sm text-[#B23A5C]">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Unable to update note.'}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditingNote(false)} className="rounded-lg border border-[#E0D7E7] px-4 py-2 text-sm transition-colors hover:bg-[#F1E9F5] dark:border-[#332140] dark:hover:bg-[#2A1938]">Cancel</button>
                <button
                  type="button"
                  onClick={() => updateMutation.mutate()}
                  disabled={!title.trim() || !content.trim() || updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6B22C9] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </div>
          ) : noteQuery.data ? (
            <div>
              <h3 className="text-xl font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">{noteQuery.data.title}</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{noteQuery.data.content}</p>
            </div>
          ) : null}
        </Modal>
      )}

      {deleteTargetId && (
        <Modal title="Delete note" onClose={() => !deleteMutation.isPending && setDeleteTargetId(null)}>
          <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">This note will be permanently deleted.</p>
          {deleteMutation.isError && <p className="mt-3 text-sm text-[#B23A5C]">{deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Unable to delete note.'}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTargetId(null)} className="rounded-lg border border-[#E0D7E7] px-4 py-2 text-sm transition-colors hover:bg-[#F1E9F5] dark:border-[#332140] dark:hover:bg-[#2A1938]">Cancel</button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B23A5C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#9A2E4D] disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete note'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}