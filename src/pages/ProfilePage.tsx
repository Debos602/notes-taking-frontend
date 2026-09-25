import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit3, Mail, Save, ShieldCheck, Trash2, User, UserRound, X } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { Modal } from '../components/ui/Modal'

export function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '')
  const canManageProfile = user?.role?.toLowerCase() === 'admin'

  const updateMutation = useMutation({
    mutationFn: (input: { name: string; email: string; interests: string[] }) => updateProfile(input),
    onSuccess: (_, input) => {
      queryClient.setQueryData(['current-user'], (currentUser: typeof user) =>
        currentUser ? { ...currentUser, ...input } : currentUser,
      )
      setIsEditing(false)
      setError('')
    },
    onError: (saveError) => {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update your profile.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['current-user'] })
      setIsDeleteModalOpen(false)
    },
    onError: (deleteError) => {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete your account.')
    },
  })

  function resetProfileForm() {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setInterests(user?.interests?.join(', ') || '')
  }

  function toggleEditProfile() {
    updateMutation.reset()
    setError('')
    resetProfileForm()
    setIsEditing((value) => !value)
  }

  const handleDelete = () => {
    setError('')
    deleteMutation.reset()
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 dark:border-[#332140] dark:bg-[#1B1023] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-[#7C2AE8] bg-[#F1E9F5] dark:bg-[#2A1938]">
            <User className="h-9 w-9 text-[#7C2AE8] dark:text-[#A868F0]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8]">Account profile</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">
              {user?.name || 'User'}
            </h1>
            <p className="mt-1 text-sm text-[#6B5C7A] dark:text-[#93839F]">{user?.email}</p>
          </div>
          {canManageProfile && <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleEditProfile}
              className="inline-flex items-center gap-2 rounded-sm border-2 border-[#E0D7E7] px-3 py-2 text-sm font-medium text-[#2A1A3D] hover:bg-[#F1E9F5] dark:border-[#332140] dark:text-[#EEE6F4] dark:hover:bg-[#2A1938]"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {isEditing ? 'Cancel' : 'Edit profile'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-sm border-2 border-[#B23A5C] px-3 py-2 text-sm font-medium text-[#B23A5C] hover:bg-[#FBEFF2] disabled:opacity-60 dark:border-[#D9628C] dark:text-[#D9628C] dark:hover:bg-[#2A1420]"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete account'}
            </button>
          </div>}
        </div>
      </section>

      {error && <p className="rounded-sm border-2 border-[#B23A5C] bg-[#FBEFF2] p-3 text-sm text-[#8A2645]">{error}</p>}

      {isEditing && canManageProfile && (
          <Modal title="Edit profile" onClose={() => {
            if (!updateMutation.isPending) {
              resetProfileForm()
              updateMutation.reset()
              setIsEditing(false)
            }
          }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} className="input mt-2" />
            </label>
            <label className="text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">
              Email address
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input mt-2" />
            </label>
            <label className="text-sm font-medium text-[#2A1A3D] dark:text-[#EEE6F4] sm:col-span-2">
              Interests <span className="font-normal text-[#6B5C7A]">(comma separated)</span>
              <input value={interests} onChange={(event) => setInterests(event.target.value)} className="input mt-2" />
            </label>
          </div>
          <button
            type="button"
            onClick={() => updateMutation.mutate({
              name: name.trim(),
              email: email.trim(),
              interests: interests.split(',').map((item) => item.trim()).filter(Boolean),
            })}
            disabled={updateMutation.isPending}
            className="mt-5 inline-flex items-center gap-2 rounded-sm border-2 border-[#7C2AE8] bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B22C9] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </Modal>
      )}

      {isDeleteModalOpen && canManageProfile && (
        <Modal title="Delete account" onClose={() => {
          if (!deleteMutation.isPending) {
            deleteMutation.reset()
            setError('')
            setIsDeleteModalOpen(false)
          }
        }}>
          <p className="text-sm leading-6 text-[#6B5C7A] dark:text-[#93839F]">
            This permanently removes your account and cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => { deleteMutation.reset(); setError(''); setIsDeleteModalOpen(false) }} disabled={deleteMutation.isPending} className="rounded-sm border-2 border-[#E0D7E7] px-4 py-2 text-sm font-medium text-[#2A1A3D] dark:border-[#332140] dark:text-[#EEE6F4]">
              Cancel
            </button>
            <button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-sm border-2 border-[#B23A5C] bg-[#B23A5C] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete account'}
            </button>
          </div>
        </Modal>
      )}

      <section className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 dark:border-[#332140] dark:bg-[#1B1023]">
        <div className="mb-5 flex items-center gap-3">
          <UserRound className="h-5 w-5 text-[#7C2AE8]" />
          <h2 className="text-lg font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">Personal information</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-2 border-[#E0D7E7] p-4 dark:border-[#332140]">
            <div className="flex items-center gap-2 text-[#6B5C7A] dark:text-[#93839F]">
              <User className="h-4 w-4" />
              <span className="font-mono text-[11px] uppercase tracking-wide">Full name</span>
            </div>
            <p className="mt-2 font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">{user?.name || 'Not available'}</p>
          </div>
          <div className="border-2 border-[#E0D7E7] p-4 dark:border-[#332140]">
            <div className="flex items-center gap-2 text-[#6B5C7A] dark:text-[#93839F]">
              <Mail className="h-4 w-4" />
              <span className="font-mono text-[11px] uppercase tracking-wide">Email address</span>
            </div>
            <p className="mt-2 break-all font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">{user?.email || 'Not available'}</p>
          </div>
          <div className="border-2 border-[#E0D7E7] p-4 dark:border-[#332140]">
            <div className="flex items-center gap-2 text-[#6B5C7A] dark:text-[#93839F]">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-mono text-[11px] uppercase tracking-wide">Account ID</span>
            </div>
            <p className="mt-2 break-all font-medium text-[#2A1A3D] dark:text-[#EEE6F4]">{user?.id || 'Not available'}</p>
          </div>
        </div>
      </section>

      {user?.interests && user.interests.length > 0 && (
        <section className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 dark:border-[#332140] dark:bg-[#1B1023]">
          <h2 className="text-lg font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">Interests</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <span key={interest} className="border-2 border-[#7C2AE8] px-3 py-1.5 font-mono text-xs text-[#7C2AE8] dark:text-[#A868F0]">
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
