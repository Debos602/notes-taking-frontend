import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import MainLayout from './layout/MainLayout'


import { SettingPage } from './pages/SettingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotePage } from './pages/NotePage'
import { DashboardOverview } from './components/DashboardOverview'
import { UsersPage } from './pages/UsersPage'
import { AdminNotesPage } from './pages/AdminNotesPage'
import { UserPostsPage } from './pages/UserPostsPage'

function InitialLoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" aria-label="Loading" />
        <div>
          <p className="text-xl font-semibold tracking-tight">Loading your workspace</p>
          <p className="mt-1 text-sm text-slate-500">Checking your session and preparing your dashboard...</p>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ element }: { element: ReactNode }) {
  const { user, authReady } = useAuth()
  if (!authReady) return <InitialLoadingScreen />
  return user ? <>{element}</> : <Navigate to="/login" replace />
}

function AdminRoute({ element }: { element: ReactNode }) {
  const { user, authReady } = useAuth()
  if (!authReady) return <InitialLoadingScreen />
  return user?.role === 'ADMIN' ? <>{element}</> : <Navigate to="/" replace />
}

function UserRoute({ element }: { element: ReactNode }) {
  const { user, authReady } = useAuth()
  if (!authReady) return <InitialLoadingScreen />
  return user?.role === 'USER' ? <>{element}</> : <Navigate to="/" replace />
}

function App() {
  return (
    <AuthProvider>
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <DashboardOverview />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <NotePage />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <SettingPage />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute
              element={
                <AdminRoute
                  element={
                    <MainLayout>
                      <UsersPage />
                    </MainLayout>
                  }
                />
              }
            />
          }
        />
        <Route
          path="/admin/notes"
          element={
            <ProtectedRoute
              element={
                <AdminRoute
                  element={
                    <MainLayout>
                      <AdminNotesPage />
                    </MainLayout>
                  }
                />
              }
            />
          }
        />
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute
              element={
                <UserRoute
                  element={
                    <MainLayout>
                      <UserPostsPage />
                    </MainLayout>
                  }
                />
              }
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
