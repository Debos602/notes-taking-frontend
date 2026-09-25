import { AlertCircle, ChevronLeft, ChevronRight, Edit3, Shield, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserListSkeleton } from '../components/UserListSkeleton'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../contexts/useAuth'
import { createUser, deleteUser, getUsers, updateUser, type AdminUser } from '../lib/usersApi'

const PAGE_SIZE = 10

export function UsersPage() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER')
  const [interests, setInterests] = useState('')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const usersQuery = useQuery({
    queryKey: ['users', page, token],
    queryFn: () => getUsers(page, PAGE_SIZE, token),
    enabled: user?.role === 'ADMIN',
  })

  const createMutation = useMutation({
    mutationFn: () => createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      interests: interests.split(',').map((interest) => interest.trim()).filter(Boolean),
    }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setName('')
      setEmail('')
      setPassword('')
      setRole('USER')
      setInterests('')
      setIsCreateModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateUser(editingUser?._id ?? '', {
      name: name.trim(),
      email: email.trim(),
      role,
      interests: interests.split(',').map((interest) => interest.trim()).filter(Boolean),
      ...(password ? { password } : {}),
    }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
      setName('')
      setEmail('')
      setPassword('')
      setRole('USER')
      setInterests('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(deleteTarget?._id ?? '', token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setDeleteTarget(null)
    },
  })

  function openEditModal(item: AdminUser) {
    createMutation.reset()
    updateMutation.reset()
    setEditingUser(item)
    setName(item.name)
    setEmail(item.email)
    setPassword('')
    setRole(item.role)
    setInterests(item.interests.join(', '))
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        Access denied.
      </div>
    )
  }

  if (usersQuery.isLoading) return <UserListSkeleton />

  if (usersQuery.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {usersQuery.error instanceof Error ? usersQuery.error.message : 'Unable to load users.'}
      </div>
    )
  }

  const users = usersQuery.data?.data ?? []
  const totalPages = usersQuery.data?.meta.totalPage ?? 1
  const inputClass = 'input mt-2'
  const labelClass = 'block text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]'
  const cancelBtnClass = 'rounded-lg border border-[#E0D7E7] px-4 py-2 text-sm transition-colors hover:bg-[#F1E9F5] dark:border-[#332140] dark:hover:bg-[#2A1938]'
  const primaryBtnClass = 'rounded-lg bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6B22C9] disabled:opacity-50'

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
            <Users className="h-7 w-7 text-[#7C2AE8]" />
            Users
          </h1>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">Manage registered users in your workspace.</p>
            <button
              type="button"
              onClick={() => { createMutation.reset(); setIsCreateModalOpen(true) }}
              className="rounded-xl bg-[#7C2AE8] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#6B22C9] hover:shadow-md"
            >
              Create user
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] dark:border-[#332140] dark:bg-[#1B1023]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="border-b border-[#E0D7E7] bg-[#F1E9F5]/60 dark:border-[#332140] dark:bg-[#241533]/60">
              <tr>
                <th className="p-4 font-medium text-[#6B5C7A] dark:text-[#93839F]">Name</th>
                <th className="p-4 font-medium text-[#6B5C7A] dark:text-[#93839F]">Email</th>
                <th className="p-4 font-medium text-[#6B5C7A] dark:text-[#93839F]">Role</th>
                <th className="p-4 font-medium text-[#6B5C7A] dark:text-[#93839F]">Interests</th>
                <th className="p-4 font-medium text-[#6B5C7A] dark:text-[#93839F]">Created</th>
                <th className="p-4 text-right font-medium text-[#6B5C7A] dark:text-[#93839F]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id} className="border-b border-[#E0D7E7] transition-colors last:border-0 hover:bg-[#F1E9F5]/50 dark:border-[#332140] dark:hover:bg-[#2A1938]/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#CFE2FF] text-[10px] font-semibold text-[#24558F] dark:bg-[#2A3F5C] dark:text-[#8FB8EE]">
                        {item.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#6B5C7A] dark:text-[#93839F]">{item.email}</td>
                  <td className="p-4">
                    <span
                      className={
                        item.role === 'ADMIN'
                          ? 'rounded-full bg-[#F1E0C8] px-2.5 py-1 text-xs font-medium text-[#8A5A1E] dark:bg-[#3D2E12] dark:text-[#E3B978]'
                          : 'rounded-full bg-[#DCEAFF] px-2.5 py-1 text-xs font-medium text-[#24558F] dark:bg-[#1D2E45] dark:text-[#8FB8EE]'
                      }
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="p-4 text-[#6B5C7A] dark:text-[#93839F]">{item.interests.length ? item.interests.join(', ') : '—'}</td>
                  <td className="p-4 text-[#6B5C7A] dark:text-[#93839F]">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#7C2AE8]/40 text-[#7C2AE8] transition-colors hover:bg-[#7C2AE8]/10"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { deleteMutation.reset(); setDeleteTarget(item) }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#B23A5C]/40 text-[#B23A5C] transition-colors hover:bg-[#B23A5C]/10"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Users className="h-8 w-8 text-[#C9BAD6] dark:text-[#4A3760]" />
            <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">No users found.</p>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-4 dark:border-[#332140] dark:bg-[#1B1023]">
        <p className="font-mono text-xs text-[#6B5C7A] dark:text-[#93839F]">
          Page {page} of {totalPages} · {usersQuery.data?.meta.total ?? 0} users
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || usersQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E0D7E7] px-3 py-2 text-sm transition-colors hover:bg-[#F1E9F5] disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#332140] dark:hover:bg-[#2A1938]"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || usersQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E0D7E7] px-3 py-2 text-sm transition-colors hover:bg-[#F1E9F5] disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#332140] dark:hover:bg-[#2A1938]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <Modal title="Create user" onClose={() => !createMutation.isPending && setIsCreateModalOpen(false)}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createMutation.mutate() }}>
            <label className={labelClass}>Name<input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Role
              <select value={role} onChange={(event) => setRole(event.target.value as 'ADMIN' | 'USER')} className={inputClass}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            <label className={labelClass}>
              Interests
              <span className="mt-1 block text-xs font-normal text-[#6B5C7A] dark:text-[#93839F]">Separate interests with commas</span>
              <input value={interests} onChange={(event) => setInterests(event.target.value)} placeholder="Technology, AI" className={inputClass} />
            </label>
            {createMutation.isError && <p className="text-sm text-[#B23A5C]">{createMutation.error instanceof Error ? createMutation.error.message : 'Unable to create user.'}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className={cancelBtnClass}>Cancel</button>
              <button type="submit" disabled={!name.trim() || !email.trim() || password.length < 8 || createMutation.isPending} className={primaryBtnClass}>
                {createMutation.isPending ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingUser && (
        <Modal title="Edit user" onClose={() => !updateMutation.isPending && setEditingUser(null)}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); updateMutation.mutate() }}>
            <label className={labelClass}>Name<input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>
              New password
              <span className="mt-1 block text-xs font-normal text-[#6B5C7A] dark:text-[#93839F]">Leave blank to keep the current password.</span>
              <input minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>Role
              <select value={role} onChange={(event) => setRole(event.target.value as 'ADMIN' | 'USER')} className={inputClass}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            <label className={labelClass}>Interests<input value={interests} onChange={(event) => setInterests(event.target.value)} className={inputClass} /></label>
            {updateMutation.isError && <p className="text-sm text-[#B23A5C]">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Unable to update user.'}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingUser(null)} className={cancelBtnClass}>Cancel</button>
              <button type="submit" disabled={!name.trim() || !email.trim() || (password.length > 0 && password.length < 8) || updateMutation.isPending} className={primaryBtnClass}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete user" onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}>
          <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">Delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
          {deleteMutation.isError && <p className="mt-3 text-sm text-[#B23A5C]">{deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Unable to delete user.'}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className={cancelBtnClass}>Cancel</button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B23A5C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#9A2E4D] disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete user'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}