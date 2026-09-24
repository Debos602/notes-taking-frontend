import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  DashboardApiResponse,
  Status,
} from '../types'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

const toApiStatus = (status: Status) => (status === 'InProgress' ? 'In Progress' : status)

export interface TaskListResponse {
  success: boolean
  message: string
  meta: { page: number; limit: number; total: number }
  data: Task[]
}

export interface TaskListQuery {
  page?: number
  limit?: number
  search?: string
  status?: Status
  priority?: 'Low' | 'Medium' | 'High'
  sortBy?: 'createdAt' | 'title' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Is the backend running?', 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (data && (data.message || data.error || JSON.stringify(data))) ||
      `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  return data as T
}

export const api = {
  getTasks: (query: TaskListQuery = {}) => {
    const params = new URLSearchParams({
      page: String(query.page ?? 1),
      limit: String(query.limit ?? 10),
    })

    if (query.search?.trim()) params.set('search', query.search.trim())
    if (query.status) params.set('status', toApiStatus(query.status))
    if (query.priority) params.set('priority', query.priority)
    if (query.sortBy) params.set('sortBy', query.sortBy)
    if (query.sortOrder) params.set('sortOrder', query.sortOrder)

    return request<TaskListResponse>(`${API_URL}/v1/tasks?${params.toString()}`)
  },
  getTask: (id: number | string) => request<Task>(`${API_URL}/v1/tasks/${id}`),
  createTask: (input: CreateTaskInput) =>
    request<Task>(`${API_URL}/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTask: (id: number | string, input: UpdateTaskInput) =>
    request<Task>(`${API_URL}/v1/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...input,
        ...(input.status ? { status: toApiStatus(input.status) } : {}),
      }),
    }),
  moveTask: (id: number | string, payload: { targetStatus: Status; targetPosition: number }) =>
    request<Task>(`${API_URL}/v1/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({
        targetStatus: toApiStatus(payload.targetStatus),
        targetPosition: payload.targetPosition,
      }),
    }),
  deleteTask: (id: number | string) =>
    request<void>(`${API_URL}/v1/tasks/${id}`, { method: 'DELETE' }),
  getDashboardData: () => request<DashboardApiResponse>(`${API_URL}/v1/tasks/dashboard`),
}
