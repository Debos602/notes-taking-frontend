import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { AuthContext } from './useAuth'
import type { AuthContextType } from './useAuth'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '')
const AUTH_SESSION_KEY = 'auth-session-active'

type AuthResponse = {
  message?: string
  error?: string
  success?: boolean
  data?: { token?: string; accessToken?: string; user?: AuthUser }
  token?: string
  accessToken?: string
}

function getResponseToken(response: Response, result: AuthResponse | null) {
  const authorization = response.headers.get('Authorization')
  const headerToken = authorization?.replace(/^Bearer\s+/i, '').trim()
  return result?.data?.token
    ?? result?.data?.accessToken
    ?? result?.token
    ?? result?.accessToken
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

async function getCurrentUser(token?: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const result: unknown = await response.json().catch(() => null)
  const resultRecord = isRecord(result) ? result : null
  const dataRecord = isRecord(resultRecord?.data) ? resultRecord.data : null
  const user = isAuthUser(dataRecord?.user)
    ? dataRecord.user
    : isAuthUser(resultRecord?.user)
      ? resultRecord.user
      : isAuthUser(resultRecord?.data)
        ? resultRecord.data
        : isAuthUser(result)
          ? result
          : null

  if (!response.ok || !user || !('email' in user)) {
    throw new Error(
      typeof resultRecord?.message === 'string' ? resultRecord.message : 'Unable to load user information.',
    )
  }

  return user as AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

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
      }
    } catch {
      // A missing backend session simply leaves the user signed out.
    } finally {
      setAuthReady(true)
    }
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_SESSION_KEY) !== 'true') {
      setAuthReady(true)
      return
    }
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
    } catch {
      throw new Error('Unable to reach the login server. Is the backend running?')
    }

    const result = await response.json().catch(() => null) as AuthResponse | null

    if (!response.ok) {
      throw new Error(result?.message || result?.error || 'Login failed. Please check your credentials.')
    }

    const loginToken = getResponseToken(response, result)
    const currentUser = result?.data?.user ?? await getCurrentUser(loginToken)
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
    setToken(loginToken ?? 'cookie-session')
    setUser(currentUser)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string, interests?: string[]) => {
      let response: Response
      try {
        response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password, interests }),
        })
      } catch {
        throw new Error('Unable to reach the registration server. Is the backend running?')
      }

      const result = await response.json().catch(() => null) as AuthResponse | null

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || result?.error || 'Registration failed. Please try again.')
      }

      const registerToken = getResponseToken(response, result)
      const currentUser = result?.data?.user ?? await getCurrentUser(registerToken)
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
      setToken(registerToken ?? 'cookie-session')
      setUser(currentUser)
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    } finally {
      setToken(null)
      setUser(null)
      sessionStorage.removeItem(AUTH_SESSION_KEY)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    authReady,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
