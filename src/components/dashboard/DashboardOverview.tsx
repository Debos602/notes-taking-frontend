import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { Activity, CheckCircle2, Clock3, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../../lib/api'
import { DashboardOverviewSkeleton } from './DashboardOverviewSkeleton'
import { DashboardChartPanel } from './DashboardChartPanel'
import { DashboardStatCard } from './DashboardStatCard'
import { DashboardStatusTag } from './DashboardStatusTag'
import { ACCENT, ACCENT_SOFT, CARD, INK, INK_SOFT, LINE, formatStatus, priorityColors, statusColors } from './dashboardStyles'

export function DashboardOverview() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.getDashboardData()
      return response.data
    },
  })

  const statusData = data
    ? Object.entries(data.statusCounts).map(([name, value]) => ({
        name: formatStatus(name),
        value,
      }))
    : []

  const priorityData = data
    ? Object.entries(data.priorityCounts).map(([name, value]) => ({
        name,
        value,
      }))
    : []

  const recentTasks = data?.recentTasks ?? []

  const overviewStats = data
    ? [
        { label: 'Total tasks', value: data.totalTasks, detail: 'all tasks', icon: ListTodo },
        { label: 'Pending', value: data.statusCounts.Pending ?? 0, detail: 'to do', icon: Clock3 },
        { label: 'In progress', value: data.statusCounts.In_Progress ?? 0, detail: 'active', icon: Activity },
        { label: 'Completed', value: data.statusCounts.Completed ?? 0, detail: 'finished', icon: CheckCircle2 },
      ]
    : []

  useLayoutEffect(() => {
    if (isLoading || isError || !data || !dashboardRef.current) return

    const context = gsap.context(() => {
      gsap.from('[data-dashboard-animate]', {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.08,
        clearProps: 'transform,opacity',
      })
    }, dashboardRef)

    return () => context.revert()
  }, [data, isError, isLoading])

  if (isLoading) {
    return <DashboardOverviewSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="rounded-sm border-2 border-[#B23A5C] bg-[#FBEFF2] p-6 text-[#8A2645] dark:border-[#D9628C] dark:bg-[#2A1420] dark:text-[#F0AFC4]">
        Failed to load dashboard data.
        <div className="mt-2 font-mono text-sm">{error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    )
  }

  return (
    <div ref={dashboardRef} className="space-y-4">
      <section data-dashboard-animate className={`${CARD} flex flex-col gap-4 p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={`text-2xl font-bold leading-tight tracking-[-0.01em] ${INK}`}>
              Welcome back, John
            </h2>
            <p className={`mt-1 font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
              here's what's moving across your projects
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardChartPanel title="Task status">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#93839F" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#93839F" fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 42, 232, 0.08)' }}
                  contentStyle={{
                    backgroundColor: '#1B1023',
                    border: '1px solid #332140',
                    borderRadius: '4px',
                    color: '#EEE6F4',
                  }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name]?.light ?? '#6B5C7A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </DashboardChartPanel>

        <DashboardChartPanel title="Priority mix">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={priorityColors[entry.name]?.light ?? '#9C8FAE'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1023',
                    border: '1px solid #332140',
                    borderRadius: '4px',
                    color: '#EEE6F4',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
        </DashboardChartPanel>
      </div>

      <section data-dashboard-animate className={`${CARD} p-5 sm:p-6`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className={`text-lg font-semibold tracking-tight ${INK}`}>Recent tasks</h3>
          <Link
            to="/tasks"
            className="font-mono text-[12px] font-medium tracking-wide hover:underline"
            style={{ color: ACCENT }}
          >
            see all
          </Link>
        </div>

        <div className="space-y-2">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              data-dashboard-animate
              className={`flex flex-col gap-3 rounded-sm border-2 ${LINE} ${ACCENT_SOFT} px-3 py-3 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-medium leading-snug ${INK}`}>{task.title}</p>
                <p className={`mt-1 font-mono text-[11px] tracking-wide ${INK_SOFT}`}>
                  {task.priority} priority · {task.description}
                </p>
              </div>
              <DashboardStatusTag status={task.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}