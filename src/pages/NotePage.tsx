import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Edit3, Plus, Save, Search, Trash2 } from 'lucide-react'
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
  const [search, setSearch] = useState('')
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

  const notes = notesQuery.data?.data.filter((note) =>
    `${note.title} ${note.content}`.toLowerCase().includes(search.toLowerCase()),
  ) ?? []
  const totalPages = notesQuery.data?.meta.totalPage ?? 1

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 dark:border-[#332140] dark:bg-[#1B1023] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8]">Personal workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">{user?.name ? `${user.name}'s notes` : 'Your notes'}</h1>
          <p className="mt-2 text-sm text-[#6B5C7A] dark:text-[#93839F]">Keep your thinking organized and easy to return to.</p>
        </div>
        <button type="button" onClick={() => { createMutation.reset(); setIsCreateModalOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-[#7C2AE8] bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B22C9]"><Plus className="h-4 w-4" />New note</button>
      </section>

      <label className="relative block max-w-xl">
        <span className="sr-only">Search notes</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5C7A]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes..." className="input pl-9" />
      </label>

      {notesQuery.isLoading ? <NoteListSkeleton /> : notesQuery.isError ? (
        <div className="rounded-sm border-2 border-[#B23A5C] bg-[#FBEFF2] p-4 text-sm text-[#8A2645]">{notesQuery.error instanceof Error ? notesQuery.error.message : 'Unable to load notes.'}</div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <article key={note.id} onClick={() => { setSelectedNoteId(note.id); setIsEditingNote(false) }} className="group min-h-44 cursor-pointer rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-shadow hover:shadow-lg dark:border-[#332140] dark:bg-[#1B1023]">
                <div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">{note.title}</h2><span className="shrink-0 font-mono text-[11px] text-[#93839F]">{new Date(note.updatedAt).toLocaleDateString()}</span></div>
                <p className="mt-4 text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{note.content}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedNoteId(note.id); setIsEditingNote(true) }} className="inline-flex h-8 w-8 items-center justify-center gap-1 overflow-hidden rounded-sm border-2 border-[#7C2AE8] px-2 text-xs font-medium text-[#7C2AE8] transition-all group-hover:w-18 group-focus-within:w-18" aria-label="Edit note"><Edit3 className="h-3.5 w-3.5 shrink-0" /><span className="max-w-0 opacity-0 transition-opacity group-hover:max-w-12 group-hover:opacity-100 group-focus-within:max-w-12 group-focus-within:opacity-100">Edit</span></button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); setDeleteTargetId(note.id) }} className="inline-flex h-8 w-8 items-center justify-center gap-1 overflow-hidden rounded-sm border-2 border-[#B23A5C] px-2 text-xs font-medium text-[#B23A5C] transition-all group-hover:w-22 group-focus-within:w-22" aria-label="Delete note"><Trash2 className="h-3.5 w-3.5 shrink-0" /><span className="max-w-0 opacity-0 transition-opacity group-hover:max-w-16 group-hover:opacity-100 group-focus-within:max-w-16 group-focus-within:opacity-100">Delete</span></button>
                </div>
              </article>
            ))}
          </section>
          <div className="flex items-center justify-between rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-4 dark:border-[#332140] dark:bg-[#1B1023]"><p className="font-mono text-xs text-[#6B5C7A] dark:text-[#93839F]">Page {page} of {totalPages} · page={page} &amp; limit={PAGE_SIZE}</p><div className="flex gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1 || notesQuery.isFetching} className="inline-flex items-center gap-1 rounded-sm border-2 border-[#E0D7E7] px-3 py-2 text-sm disabled:opacity-50 dark:border-[#332140]"><ChevronLeft className="h-4 w-4" />Prev</button><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || notesQuery.isFetching} className="inline-flex items-center gap-1 rounded-sm border-2 border-[#E0D7E7] px-3 py-2 text-sm disabled:opacity-50 dark:border-[#332140]">Next<ChevronRight className="h-4 w-4" /></button></div></div>
        </>
      )}

      {isCreateModalOpen && <Modal title="Create note" onClose={() => !createMutation.isPending && setIsCreateModalOpen(false)}><div className="space-y-4"><label className="block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">Title<input value={title} onChange={(event) => setTitle(event.target.value)} className="input mt-2" /></label><label className="block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">Content<textarea value={content} onChange={(event) => setContent(event.target.value)} className="input mt-2 min-h-32 resize-y" /></label>{createMutation.isError && <p className="text-sm text-[#B23A5C]">{createMutation.error instanceof Error ? createMutation.error.message : 'Unable to create note.'}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-sm border-2 border-[#E0D7E7] px-4 py-2 text-sm dark:border-[#332140]">Cancel</button><button type="button" onClick={() => createMutation.mutate()} disabled={!title.trim() || !content.trim() || createMutation.isPending} className="rounded-sm border-2 border-[#7C2AE8] bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{createMutation.isPending ? 'Creating...' : 'Create note'}</button></div></div></Modal>}

      {selectedNoteId && <Modal title={isEditingNote ? 'Edit note' : 'Note details'} onClose={() => !updateMutation.isPending && setSelectedNoteId(null)}>{noteQuery.isLoading ? <p className="text-sm text-[#6B5C7A]">Loading note...</p> : noteQuery.isError ? <p className="text-sm text-[#B23A5C]">{noteQuery.error instanceof Error ? noteQuery.error.message : 'Unable to load note.'}</p> : isEditingNote ? <div className="space-y-4"><input value={title} onChange={(event) => setTitle(event.target.value)} className="input" /><textarea value={content} onChange={(event) => setContent(event.target.value)} className="input min-h-32 resize-y" />{updateMutation.isError && <p className="text-sm text-[#B23A5C]">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Unable to update note.'}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsEditingNote(false)} className="rounded-sm border-2 border-[#E0D7E7] px-4 py-2 text-sm">Cancel</button><button type="button" onClick={() => updateMutation.mutate()} disabled={!title.trim() || !content.trim() || updateMutation.isPending} className="inline-flex items-center gap-2 rounded-sm bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Save className="h-4 w-4" />Save</button></div></div> : noteQuery.data ? <div><h3 className="text-xl font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">{noteQuery.data.title}</h3><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{noteQuery.data.content}</p></div> : null}</Modal>}

      {deleteTargetId && <Modal title="Delete note" onClose={() => !deleteMutation.isPending && setDeleteTargetId(null)}><p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">This note will be permanently deleted.</p>{deleteMutation.isError && <p className="mt-3 text-sm text-[#B23A5C]">{deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Unable to delete note.'}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDeleteTargetId(null)} className="rounded-sm border-2 border-[#E0D7E7] px-4 py-2 text-sm">Cancel</button><button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-sm bg-[#B23A5C] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Trash2 className="h-4 w-4" />{deleteMutation.isPending ? 'Deleting...' : 'Delete note'}</button></div></Modal>}
    </div>
  )
}
