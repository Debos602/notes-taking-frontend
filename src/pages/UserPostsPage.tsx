import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../contexts/useAuth'
import { createPost, getUserPosts } from '../lib/notesApi'
import { NoteListSkeleton } from '../components/NoteListSkeleton'

const PAGE_SIZE = 9

export function UserPostsPage() {
  const { user, token } = useAuth()
  const userId = user?.id || user?._id
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const postsQuery = useQuery({
    queryKey: ['user-posts', userId, page, token],
    queryFn: () => getUserPosts(userId ?? '', page, PAGE_SIZE, token),
    placeholderData: keepPreviousData,
    enabled: user?.role === 'USER' && Boolean(userId),
  })
  const createMutation = useMutation({
    mutationFn: () => createPost({ title: title.trim(), content: content.trim() }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts', userId] })
      setTitle('')
      setContent('')
      setPage(1)
      setIsCreateModalOpen(false)
    },
  })

  if (user?.role !== 'USER') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        This page is available for user accounts.
      </div>
    )
  }

  if (postsQuery.isLoading) return <NoteListSkeleton />

  if (postsQuery.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {postsQuery.error instanceof Error ? postsQuery.error.message : 'Unable to load your posts.'}
      </div>
    )
  }

  const posts = postsQuery.data?.data.posts ?? []
  const totalPages = postsQuery.data?.meta.totalPage ?? 1

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E0D7E7] bg-gradient-to-br from-[#FAF8FB] via-[#F5EFFA] to-[#EDE3F7] p-6 shadow-sm dark:border-[#332140] dark:from-[#1B1023] dark:via-[#1F1329] dark:to-[#241533] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#7C2AE8]/10 blur-3xl dark:bg-[#7C2AE8]/20" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7C2AE8]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8] dark:bg-[#7C2AE8]/15">
            <Sparkles className="h-3 w-3" />
            Personal workspace
          </div>
          <h1 className="mt-3 flex items-center gap-2 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">
            <FileText className="h-7 w-7 text-[#7C2AE8]" />
            My posts
          </h1>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">Posts created by {postsQuery.data?.data.name || user.name}.</p>
            <button
              type="button"
              onClick={() => { createMutation.reset(); setIsCreateModalOpen(true) }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7C2AE8] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#6B22C9] hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create post
            </button>
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E0D7E7] p-12 text-center dark:border-[#332140]">
          <FileText className="h-8 w-8 text-[#C9BAD6] dark:text-[#4A3760]" />
          <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">You have not created any posts yet.</p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group min-h-44 rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7C2AE8]/40 hover:shadow-lg dark:border-[#332140] dark:bg-[#1B1023]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-[#2A1A3D] transition-colors group-hover:text-[#7C2AE8] dark:text-[#EEE6F4]">{post.title}</h2>
                <span className="shrink-0 font-mono text-[11px] text-[#93839F]">{new Date(post.updatedAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">{post.content}</p>
            </article>
          ))}
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-4 dark:border-[#332140] dark:bg-[#1B1023]">
        <p className="font-mono text-xs text-[#6B5C7A] dark:text-[#93839F]">
          Page {page} of {totalPages} · {postsQuery.data?.meta.total ?? 0} posts
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || postsQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E0D7E7] px-3 py-2 text-sm transition-colors hover:bg-[#F1E9F5] disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#332140] dark:hover:bg-[#2A1938]"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || postsQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E0D7E7] px-3 py-2 text-sm transition-colors hover:bg-[#F1E9F5] disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#332140] dark:hover:bg-[#2A1938]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <Modal title="Create post" onClose={() => !createMutation.isPending && setIsCreateModalOpen(false)}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createMutation.mutate() }}>
            <label className="block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">
              Title
              <input required value={title} onChange={(event) => setTitle(event.target.value)} className="input mt-2" />
            </label>
            <label className="block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">
              Content
              <textarea required value={content} onChange={(event) => setContent(event.target.value)} className="input mt-2 min-h-32 resize-y" />
            </label>
            {createMutation.isError && <p className="text-sm text-[#B23A5C]">{createMutation.error instanceof Error ? createMutation.error.message : 'Unable to create post.'}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-lg border border-[#E0D7E7] px-4 py-2 text-sm transition-colors hover:bg-[#F1E9F5] dark:border-[#332140] dark:hover:bg-[#2A1938]">Cancel</button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
                className="rounded-lg bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6B22C9] disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create post'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}