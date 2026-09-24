import type { CreateNoteInput, Note, NotesResponse, UpdateNoteInput } from '../types'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '')

const authHeaders = (token?: string | null): Record<string, string> =>
  token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {}

const normalizeNote = (note: Note & { _id?: string }): Note => ({
  id: note.id || note._id || '',
  title: note.title,
  content: note.content,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
})

export async function getNotes(page: number, limit: number, token?: string | null): Promise<NotesResponse> {
  const params = new URLSearchParams({ sort: '-createdAt', page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/notes/my-notes?${params.toString()}`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as (NotesResponse & { error?: string }) | null

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || result?.error || 'Unable to load notes.')
  }

  return { ...result, data: result.data.map(normalizeNote) }
}

export async function createNote(input: CreateNoteInput, token?: string | null): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    data?: Note
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || result?.error || 'Unable to create note.')
  }

  return normalizeNote(result.data)
}

export async function getNote(noteId: string, token?: string | null): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/notes/${encodeURIComponent(noteId)}`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string; error?: string; data?: Note & { _id?: string } } | null
  if (!response.ok || !result?.success || !result.data) throw new Error(result?.message || result?.error || 'Unable to load note.')
  return normalizeNote(result.data)
}

export async function updateNote(noteId: string, input: UpdateNoteInput, token?: string | null): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/notes/${encodeURIComponent(noteId)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(input),
  })
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string; error?: string; data?: Note & { _id?: string } } | null
  if (!response.ok || !result?.success || !result.data) throw new Error(result?.message || result?.error || 'Unable to update note.')
  return normalizeNote(result.data)
}

export async function deleteNote(noteId: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notes/${encodeURIComponent(noteId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string; error?: string } | null
  if (!response.ok || (result && result.success === false)) throw new Error(result?.message || result?.error || 'Unable to delete note.')
}