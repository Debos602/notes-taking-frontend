import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/useAuth'
import { getUserStats, getUsersGroupedByInterest } from '../lib/usersApi'
import { Users, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'

export function DashboardOverview() {
  const { user, token } = useAuth()
  const interestsQuery = useQuery({
    queryKey: ['users-grouped-by-interest', token],
    queryFn: () => getUsersGroupedByInterest(token),
    enabled: user?.role === 'ADMIN',
  })
  const statsQuery = useQuery({
    queryKey: ['user-stats', token],
    queryFn: () => getUserStats(token),
    enabled: user?.role === 'USER',
  })

  const interestGroups = interestsQuery.data ?? []
  const uniqueUsers = new Map(interestGroups.flatMap((group) => group.users.map((groupUser) => [groupUser._id, groupUser] as const)))
  const topInterest = interestGroups.reduce((current, group) => group.users.length > current.users.length ? group : current, { interest: '—', users: [] })
  const stats = Object.entries(statsQuery.data ?? {}).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
  const formatStatLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E0D7E7] bg-gradient-to-br from-[#FAF8FB] via-[#F5EFFA] to-[#EDE3F7] p-8 shadow-sm dark:border-[#332140] dark:from-[#1B1023] dark:via-[#1F1329] dark:to-[#241533] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#7C2AE8]/10 blur-3xl dark:bg-[#7C2AE8]/20" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7C2AE8]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8] dark:bg-[#7C2AE8]/15">
            <Sparkles className="h-3 w-3" />
            Workspace overview
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4] sm:text-4xl">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-2 text-sm text-[#6B5C7A] dark:text-[#93839F]">
            A quick overview of your notes workspace.
          </p>
        </div>
      </section>

      {/* USER stats */}
      {user?.role === 'USER' && (
        <section className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C2AE8]">Your activity</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#2A1A3D] dark:text-[#EEE6F4]">Personal stats</h2>
          </div>

          {statsQuery.isError ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{statsQuery.error instanceof Error ? statsQuery.error.message : 'Unable to load your stats.'}</span>
            </div>
          ) : statsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading stats" role="status">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] dark:border-[#332140] dark:bg-[#1B1023]" />
              ))}
            </div>
          ) : stats.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#E0D7E7] p-6 text-center text-sm text-[#6B5C7A] dark:border-[#332140]">
              No stats available yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([key, value]) => (
                <div
                  key={key}
                  className="group rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7C2AE8]/40 hover:shadow-md dark:border-[#332140] dark:bg-[#1B1023]"
                >
                  <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">{formatStatLabel(key)}</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2A1A3D] transition-colors group-hover:text-[#7C2AE8] dark:text-[#EEE6F4]">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ADMIN stats */}
      {user?.role === 'ADMIN' && (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-shadow hover:shadow-md dark:border-[#332140] dark:bg-[#1B1023]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">Total users</p>
                <Users className="h-4 w-4 text-[#7C2AE8]/60" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">
                {interestsQuery.isLoading ? '...' : uniqueUsers.size}
              </p>
            </div>
            <div className="rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-shadow hover:shadow-md dark:border-[#332140] dark:bg-[#1B1023]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">Distinct interests</p>
                <Sparkles className="h-4 w-4 text-[#7C2AE8]/60" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">
                {interestsQuery.isLoading ? '...' : interestGroups.length}
              </p>
            </div>
            <div className="rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-shadow hover:shadow-md dark:border-[#332140] dark:bg-[#1B1023]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B5C7A] dark:text-[#93839F]">Top interest</p>
                <TrendingUp className="h-4 w-4 text-[#7C2AE8]/60" />
              </div>
              <p className="mt-2 truncate text-3xl font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">
                {interestsQuery.isLoading ? '...' : topInterest.interest}
              </p>
            </div>
          </div>

          {interestsQuery.isError ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#EBC3D1] bg-[#FBEFF2] p-4 text-sm text-[#8A2645] dark:border-[#5A2338] dark:bg-[#2A1420]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{interestsQuery.error instanceof Error ? interestsQuery.error.message : 'Unable to load user interests.'}</span>
            </div>
          ) : interestsQuery.isLoading ? (
            <section className="space-y-3" aria-label="Loading interest groups" role="status">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] dark:border-[#332140] dark:bg-[#1B1023]" />
              ))}
            </section>
          ) : (
            <section className="space-y-3">
              {interestGroups.map((group) => (
                <article
                  key={group.interest}
                  className="rounded-xl border border-[#E0D7E7] bg-[#FAF8FB] p-5 transition-shadow hover:shadow-md dark:border-[#332140] dark:bg-[#1B1023]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">{group.interest}</h2>
                    <span className="rounded-full bg-[#DCEAFF] px-3 py-1 text-xs font-medium text-[#24558F] dark:bg-[#1D2E45] dark:text-[#8FB8EE]">
                      {group.users.length} {group.users.length === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.users.map((groupUser) => (
                      <div
                        key={groupUser._id}
                        className="flex items-center gap-2 rounded-full bg-[#F1E9F5] py-1 pl-1 pr-3 text-sm text-[#2A1A3D] transition-colors hover:bg-[#E6D8ED] dark:bg-[#2A1938] dark:text-[#EEE6F4] dark:hover:bg-[#33204A]"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#CFE2FF] text-[10px] font-semibold text-[#24558F] dark:bg-[#2A3F5C] dark:text-[#8FB8EE]">
                          {groupUser.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{groupUser.name}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          )}
        </section>
      )}
    </div>
  )
}