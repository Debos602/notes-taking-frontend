import { FileText, Layers3, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function DashboardOverview() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <section className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 dark:border-[#332140] dark:bg-[#1B1023] sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8]">Workspace overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">Welcome back, {user?.name || 'User'}</h1>
        <p className="mt-2 text-sm text-[#6B5C7A] dark:text-[#93839F]">A quick overview of your notes workspace.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/notes" className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-5 hover:border-[#7C2AE8] dark:border-[#332140] dark:bg-[#1B1023]">
          <FileText className="h-6 w-6 text-[#7C2AE8]" />
          <p className="mt-4 text-lg font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">Notes</p>
          <p className="mt-1 text-sm text-[#6B5C7A] dark:text-[#93839F]">View and manage your notes.</p>
        </Link>
        <Link to="/profile" className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-5 hover:border-[#7C2AE8] dark:border-[#332140] dark:bg-[#1B1023]">
          <UserRound className="h-6 w-6 text-[#7C2AE8]" />
          <p className="mt-4 text-lg font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">Profile</p>
          <p className="mt-1 text-sm text-[#6B5C7A] dark:text-[#93839F]">Review your account details.</p>
        </Link>
        <Link to="/team" className="rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-5 hover:border-[#7C2AE8] dark:border-[#332140] dark:bg-[#1B1023]">
          <Layers3 className="h-6 w-6 text-[#7C2AE8]" />
          <p className="mt-4 text-lg font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">Team</p>
          <p className="mt-1 text-sm text-[#6B5C7A] dark:text-[#93839F]">See your team workspace.</p>
        </Link>
      </section>
    </div>
  )
}
