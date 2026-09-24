import { createContext, useContext } from 'react'
import type { AuthUser } from '../types'

export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  authReady: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    interests?: string[],
  ) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
