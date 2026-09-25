import { API_BASE_URL } from '../contexts/AuthContext'

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  interests: string[]
  createdAt: string
  updatedAt: string
}

export interface UsersResponse {
  success: boolean
  message: string
  meta: { page: number; limit: number; total: number; totalPage: number }
  data: AdminUser[]
}

export interface InterestUser {
  _id: string
  name: string
  email: string
}

export interface InterestGroup {
  interest: string
  users: InterestUser[]
}

export type UserStats = Record<string, unknown>

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'USER'
  interests: string[]
}

export type UpdateUserInput = Partial<Pick<CreateUserInput, 'name' | 'email' | 'role' | 'interests'>> & {
  password?: string
}

function authHeaders(token?: string | null): Record<string, string> {
  return token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {}
}

function formatApiError(result: {
  success?: boolean
  message?: string
  error?: string | { issues?: Array<{ message?: string; path?: string[] }> }
  errorSources?: Array<{ path?: string; message?: string }>
} | null, fallback: string): string {
  const errorSources = Array.isArray(result?.errorSources)
    ? result.errorSources
        .map((item) => item?.message)
        .filter((message): message is string => typeof message === 'string' && message.length > 0)
    : []

  const issueMessages = Array.isArray((result as { error?: { issues?: Array<{ message?: string }> } } | null)?.error?.issues)
    ? (result as { error?: { issues?: Array<{ message?: string }> } })?.error?.issues
        ?.map((issue) => issue.message)
        .filter((message): message is string => typeof message === 'string' && message.length > 0) ?? []
    : []

  const combined = [...errorSources, ...issueMessages]
  if (combined.length > 0) {
    return combined.join(' ')
  }

  if (typeof result?.message === 'string' && result.message.length > 0) {
    return result.message
  }

  if (typeof result?.error === 'string' && result.error.length > 0) {
    return result.error
  }

  return fallback
}

export async function getUsers(page: number, limit: number, token?: string | null): Promise<UsersResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as (UsersResponse & { error?: string }) | null

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || result?.error || 'Unable to load users.')
  }

  return result
}

export async function getUsersGroupedByInterest(token?: string | null): Promise<InterestGroup[]> {
  const response = await fetch(`${API_BASE_URL}/aggregations/users/grouped-by-interest`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    data?: InterestGroup[]
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || result?.error || 'Unable to load user interests.')
  }

  return result.data
}

export async function getUserStats(token?: string | null): Promise<UserStats> {
  const response = await fetch(`${API_BASE_URL}/aggregations/user/stats`, {
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    data?: UserStats
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || result?.error || 'Unable to load your stats.')
  }

  return result.data
}

export async function createUser(input: CreateUserInput, token?: string | null): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(input),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    data?: AdminUser
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(formatApiError(result, 'Unable to create user.'))
  }

  return result.data
}

export async function updateUser(userId: string, input: UpdateUserInput, token?: string | null): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(input),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
    data?: AdminUser
  } | null

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(formatApiError(result, 'Unable to update user.'))
  }

  return result.data
}

export async function deleteUser(userId: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(token),
  })
  const result = await response.json().catch(() => null) as {
    success?: boolean
    message?: string
    error?: string
  } | null

  if (!response.ok || result?.success === false) {
    throw new Error(formatApiError(result, 'Unable to delete user.'))
  }
}
