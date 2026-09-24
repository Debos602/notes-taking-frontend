export type Priority = 'Low' | 'Medium' | 'High'
export type Status = 'Pending' | 'InProgress' | 'Completed'
export type DashboardStatus = 'Pending' | 'Completed' | 'In_Progress'
export type DashboardPriority = 'Low' | 'Medium' | 'High'

export interface AuthUser {
  id: number | string
  name: string
  email: string
  interests?: string[]
}

export interface Task {
  id: number | string
  title: string
  description?: string | null
  priority: Priority
  status: Status
  createdDate: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority: Priority
  status: Status
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  status?: Status
}

// Form-এ ব্যবহারের জন্য — create ও edit দুই ক্ষেত্রেই কাজ করবে
export interface TaskFormValues {
  title: string
  description?: string
  priority: Priority
  status?: Status
}

export interface DashboardRecentTask {
  id: number
  title: string
  description: string
  priority: DashboardPriority
  status: DashboardStatus
  createdAt: string
  updatedAt: string
}

export interface DashboardApiResponse {
  success: boolean
  message: string
  data: {
    totalTasks: number
    statusCounts: Record<DashboardStatus, number>
    priorityCounts: Record<DashboardPriority, number>
    recentTasks: DashboardRecentTask[]
  }
}