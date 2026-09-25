import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { AuthUser } from '../types'
import { AuthContext } from './useAuth'
import type { AuthContextType } from './useAuth'

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '')
const AUTH_SESSION_KEY = 'auth-session-active'
const AUTH_TOKEN_KEY = 'auth-token'

type AuthResponse = {
  message?: string
  error?: string
  success?: boolean
  data?: {
    token?: string
    accessToken?: string
    access_token?: string
    user?: AuthUser
    tokens?: { token?: string; accessToken?: string; access_token?: string }
  }
  token?: string
  accessToken?: string
  access_token?: string
}

type AuthResult = { token?: string; user: AuthUser }

function getResponseToken(response: Response, result: AuthResponse | null) {
  const authorization = response.headers.get('Authorization')
  const headerToken = authorization?.replace(/^Bearer\s+/i, '').trim()
  return result?.data?.token
    ?? result?.data?.accessToken
    ?? result?.data?.access_token
    ?? result?.data?.tokens?.token
    ?? result?.data?.tokens?.accessToken
    ?? result?.data?.tokens?.access_token
    ?? result?.token
    ?? result?.accessToken
    ?? result?.access_token
    ?? headerToken
    ?? response.headers.get('x-access-token')
    ?? response.headers.get('access-token')
    ?? undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthUser(value: unknown): value is AuthUser {
  return isRecord(value) && typeof value.email === 'string'
}

function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value) || typeof value.email !== 'string') {
    return null
  }

  const rawId = value.id ?? value._id ?? value.email
  return {
    ...(value as Partial<AuthUser>),
    id: String(rawId),
    name: typeof value.name === 'string' ? value.name : value.email.split('@')[0],
    email: value.email,
    role: typeof value.role === 'string' ? value.role : undefined,
    interests: Array.isArray(value.interests)
      ? value.interests.filter((item): item is string => typeof item === 'string')
      : undefined,
  }
}

function getUserId(user: AuthUser | null | undefined): string | null {
  if (!user) return null
  const id = user.id ?? user._id
  return id === undefined || id === null || id === '' ? null : String(id)
}

async function getCurrentUser(token?: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const result: unknown = await response.json().catch(() => null)
  const resultRecord = isRecord(result) ? result : null
  const dataRecord = isRecord(resultRecord?.data) ? resultRecord.data : null
  const user = normalizeAuthUser(
    isAuthUser(dataRecord?.user)
      ? dataRecord.user
      : isAuthUser(resultRecord?.user)
        ? resultRecord.user
        : isAuthUser(resultRecord?.data)
          ? resultRecord.data
          : isAuthUser(result)
            ? result
            : null,
  )

  if (!response.ok || !user || !('email' in user)) {
    throw new Error(
      typeof resultRecord?.message === 'string' ? resultRecord.message : 'Unable to load user information.',
    )
  }

  return user
}

async function loginRequest({ email, password }: { email: string; password: string }): Promise<AuthResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const result = await response.json().catch(() => null) as AuthResponse | null
  if (!response.ok) throw new Error(result?.message || result?.error || 'Login failed. Please check your credentials.')
  const token = getResponseToken(response, result)
  const user = normalizeAuthUser(result?.data?.user)
    ?? { id: email, name: email.split('@')[0], email }

  return { token, user }
}

async function registerRequest({ name, email, password, interests }: { name: string; email: string; password: string; interests?: string[] }): Promise<AuthResult> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, interests }),
  })
  const result = await response.json().catch(() => null) as AuthResponse | null
  if (!response.ok || !result?.success) throw new Error(result?.message || result?.error || 'Registration failed. Please try again.')
  const user = normalizeAuthUser(result.data?.user)
    ?? { id: email, name, email, interests }

  return {
    token: getResponseToken(response, result),
    user,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const loginMutation = useMutation({ mutationFn: loginRequest })
  const registerMutation = useMutation({ mutationFn: registerRequest })
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Logout request failed.')
    },
  })

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await response.json().catch(() => null) as AuthResponse | null

      if (response.ok) {
        const refreshedToken = getResponseToken(response, result)
        const currentUser = await getCurrentUser(refreshedToken)
        setUser(currentUser)
        setToken(refreshedToken ?? 'cookie-session')
        if (refreshedToken) {
          sessionStorage.setItem(AUTH_TOKEN_KEY, refreshedToken)
        }
      }
    } catch {
      // A missing backend session simply leaves the user signed out.
    } finally {
      setAuthReady(true)
    }
  }, [])

  useEffect(() => {
    // Prefer a persisted real token — this avoids depending on a cross-site
    // cookie (which browsers, especially in incognito/private mode, may block).
    const storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
      getCurrentUser(storedToken)
        .then((currentUser) => setUser(currentUser))
        .catch(() => {
          // Stored token is no longer valid — clear it and fall back to signed-out state.
          sessionStorage.removeItem(AUTH_TOKEN_KEY)
          sessionStorage.removeItem(AUTH_SESSION_KEY)
          setToken(null)
          setUser(null)
        })
        .finally(() => setAuthReady(true))
      return
    }

    if (sessionStorage.getItem(AUTH_SESSION_KEY) !== 'true') {
      setAuthReady(true)
      return
    }
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const { token: loginToken, user: currentUser } = await loginMutation.mutateAsync({ email, password })
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
    if (loginToken) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, loginToken)
    }
    setToken(loginToken ?? 'cookie-session')
    setUser(currentUser)
  }, [loginMutation])

  const register = useCallback(
    async (name: string, email: string, password: string, interests?: string[]) => {
      const { token: registerToken, user: currentUser } = await registerMutation.mutateAsync({ name, email, password, interests })
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
      if (registerToken) {
        sessionStorage.setItem(AUTH_TOKEN_KEY, registerToken)
      }
      setToken(registerToken ?? 'cookie-session')
      setUser(currentUser)
    },
    [registerMutation],
  )

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      setToken(null)
      setUser(null)
      sessionStorage.removeItem(AUTH_SESSION_KEY)
      sessionStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }, [logoutMutation])

  const updateProfile = useCallback(async (input: { name?: string; email?: string; interests?: string[] }) => {
    if (!user) throw new Error('You must be logged in to update your profile.')

    const userId = getUserId(user)
    if (!userId) {
      throw new Error('Your session is invalid. Please log in again.')
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    })
    const result = await response.json().catch(() => null) as {
      message?: string
      error?: string
      data?: { user?: AuthUser } | AuthUser
      user?: AuthUser
    } | null
    const updatedUser = normalizeAuthUser(
      result?.user
        ?? (result?.data && 'user' in result.data ? result.data.user : result?.data),
    )

    if (!response.ok || !updatedUser) {
      throw new Error(result?.message || result?.error || 'Unable to update your profile.')
    }

    setUser(updatedUser)
  }, [token, user])

  const deleteAccount = useCallback(async () => {
    if (!user) return

    const userId = getUserId(user)
    if (!userId) {
      throw new Error('Your session is invalid. Please log in again.')
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : undefined,
    })
    const result = await response.json().catch(() => null) as { message?: string; error?: string } | null

    if (!response.ok) {
      throw new Error(result?.message || result?.error || 'Unable to delete your account.')
    }

    await logout()
  }, [logout, token, user])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    authReady,
    login,
    register,
    updateProfile,
    deleteAccount,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}