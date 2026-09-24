import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import { DashboardOverview } from './components/dashboard/DashboardOverview'
import TasksPage from './pages/TasksPage'
import { SettingPage } from './pages/SettingPage'
import { TeamPage } from './pages/TeamPage'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <DashboardOverview />
          </MainLayout>
        }
      />
      <Route
        path="/tasks"
        element={
          <MainLayout>
            <TasksPage />
          </MainLayout>
        }
      />
      <Route
        path="/team"
        element={
          <MainLayout>
            <TeamPage />
          </MainLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <MainLayout>
            <SettingPage />
          </MainLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
