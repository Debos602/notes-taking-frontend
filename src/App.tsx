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


function ProtectedRoute({ element }: { element: ReactNode }) {
  const { user, authReady } = useAuth()
  if (!authReady) return null
  return user ? <>{element}</> : <Navigate to="/login" replace />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
