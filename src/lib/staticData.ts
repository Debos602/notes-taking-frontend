import type {
  CreateTaskInput,
  DashboardApiResponse,
  Task,
  UpdateTaskInput,
} from '../types'

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Map the onboarding flow',
    description: 'Document the first-run experience and identify friction points.',
    priority: 'High',
    status: 'InProgress',
    createdDate: '2026-09-20T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Review component library',
    description: 'Check shared components for consistency before the next release.',
    priority: 'Medium',
    status: 'Pending',
    createdDate: '2026-09-18T11:30:00.000Z',
  },
  {
    id: 3,
    title: 'Publish release notes',
    description: 'Summarize the latest improvements for the team.',
    priority: 'Low',
    status: 'Completed',
    createdDate: '2026-09-15T14:15:00.000Z',
  },
  {
    id: 4,
    title: 'Prepare usability interviews',
    description: 'Write interview prompts and schedule five customer sessions.',
    priority: 'High',
    status: 'Pending',
    createdDate: '2026-09-12T08:45:00.000Z',
  },
  {
    id: 5,
    title: 'Refine dashboard empty states',
    description: 'Make empty and loading states useful and easy to scan.',
    priority: 'Medium',
    status: 'Completed',
    createdDate: '2026-09-08T16:20:00.000Z',
  },
]

let tasks = [...initialTasks]

const nextId = () => tasks.reduce((highest, task) => Math.max(highest, Number(task.id)), 0) + 1

export function getStaticTasks(query: {
  page?: number
  limit?: number
  search?: string
  status?: Task['status']
  priority?: Task['priority']
  sortBy?: 'createdAt' | 'title' | 'priority'
  sortOrder?: 'asc' | 'desc'
}) {
  const page = query.page ?? 1
  const limit = query.limit ?? 10
  const search = query.search?.trim().toLowerCase() ?? ''
  const priorityRank = { Low: 1, Medium: 2, High: 3 }

  const filtered = tasks
    .filter((task) => !search || `${task.title} ${task.description}`.toLowerCase().includes(search))
    .filter((task) => !query.status || task.status === query.status)
    .filter((task) => !query.priority || task.priority === query.priority)
    .sort((first, second) => {
      const firstValue = query.sortBy === 'title'
        ? first.title.toLowerCase()
        : query.sortBy === 'priority'
          ? priorityRank[first.priority]
          : first.createdDate
      const secondValue = query.sortBy === 'title'
        ? second.title.toLowerCase()
        : query.sortBy === 'priority'
          ? priorityRank[second.priority]
          : second.createdDate
      const comparison = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0
      return query.sortOrder === 'asc' ? comparison : -comparison
    })

  return {
    success: true,
    message: 'Static tasks loaded',
    meta: { page, limit, total: filtered.length },
    data: filtered.slice((page - 1) * limit, page * limit),
  }
}

export function createStaticTask(input: CreateTaskInput) {
  const task: Task = { ...input, id: nextId(), createdDate: new Date().toISOString() }
  tasks = [task, ...tasks]
  return task
}

export function updateStaticTask(id: number | string, input: UpdateTaskInput) {
  let updatedTask: Task | undefined
  tasks = tasks.map((task) => {
    if (String(task.id) !== String(id)) return task
    updatedTask = { ...task, ...input }
    return updatedTask
  })
  return updatedTask
}

export function deleteStaticTask(id: number | string) {
  tasks = tasks.filter((task) => String(task.id) !== String(id))
}

export function moveStaticTask(id: number | string, status: Task['status'], targetPosition: number) {
  const task = tasks.find((item) => String(item.id) === String(id))
  if (!task) return
  tasks = tasks.filter((item) => String(item.id) !== String(id))
  const movedTask = { ...task, status }
  const statusTasks = tasks.filter((item) => item.status === status)
  const insertAt = tasks.findIndex((item) => item.status === status)
  const position = insertAt < 0 ? tasks.length : insertAt + Math.min(targetPosition, statusTasks.length)
  tasks.splice(position, 0, movedTask)
}

export function getStaticDashboardData(): DashboardApiResponse['data'] {
  const statusCounts = {
    Pending: tasks.filter((task) => task.status === 'Pending').length,
    In_Progress: tasks.filter((task) => task.status === 'InProgress').length,
    Completed: tasks.filter((task) => task.status === 'Completed').length,
  }
  const priorityCounts = {
    Low: tasks.filter((task) => task.priority === 'Low').length,
    Medium: tasks.filter((task) => task.priority === 'Medium').length,
    High: tasks.filter((task) => task.priority === 'High').length,
  }

  return {
    totalTasks: tasks.length,
    statusCounts,
    priorityCounts,
    recentTasks: tasks.slice(0, 5).map((task) => ({
      id: Number(task.id),
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status === 'InProgress' ? 'In_Progress' : task.status,
      createdAt: task.createdDate,
      updatedAt: task.createdDate,
    })),
  }
}