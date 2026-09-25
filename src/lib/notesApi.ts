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

export interface NoteOwner {
  _id: string
  name: string
  email: string
  role: string
}

export interface AdminNote {
  id: string
  title: string
  content: string
  owner: NoteOwner
  createdAt: string
  updatedAt: string
}

export interface AdminNotesResponse {
  success: boolean
  message: string
  meta: { page: number; limit: number; total: number; totalPage: number }
  data: AdminNote[]
}

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

export async function getAllNotes(page: number, limit: number, token?: string | null): Promise<AdminNotesResponse> {
  const params = new URLSearchParams({ sort: '-createdAt', page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/notes?${params.toString()}`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    meta: AdminNotesResponse['meta']
    data?: Array<AdminNote & { _id?: string }>
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || result?.error || 'Unable to load all notes.')
  }

  return {
    success: result.success,
    message: result.message || 'Notes retrieved successfully',
    meta: result.meta,
    data: result.data.map((note) => ({ ...note, id: note.id || note._id || '' })),
  }
}

export interface UserPost {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface UserPostsResponse {
  success: boolean
  message: string
  meta: { page: number; limit: number; total: number; totalPage: number }
  data: {
    _id: string
    name: string
    email: string
    role: string
    interests: string[]
    posts: UserPost[]
  }
}

export async function getUserPosts(userId: string | number, page: number, limit: number, token?: string | null): Promise<UserPostsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/aggregations/posts/user/${encodeURIComponent(String(userId))}?${params.toString()}`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as (UserPostsResponse & { error?: string }) | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || result?.error || 'Unable to load your posts.')
  }

  return {
    ...result,
    data: {
      ...result.data,
      posts: result.data.posts.map((post) => ({ ...post, id: post.id || (post as UserPost & { _id?: string })._id || '' })),
    },
  }
}

export interface CreatePostInput {
  title: string
  content: string
}

export async function createPost(input: CreatePostInput, token?: string | null): Promise<UserPost> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(input),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    data?: UserPost & { _id?: string }
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || result?.error || 'Unable to create post.')
  }

  return { ...result.data, id: result.data.id || result.data._id || '' }
}