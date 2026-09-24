import gsap from 'gsap'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { TaskForm } from '../components/TaskForm'
import { DeleteConfirmation } from '../components/DeleteConfirmation'
import { Modal } from '../components/ui/Modal'
import { toast } from '../components/ui/Toast'
import { TaskList } from '../components/TaskList'
import { api } from '../lib/api'
import type { Priority, Status, Task, TaskFormValues } from '../types'

const normalizeTask = (task: any): Task => ({
  id: task.id,
  title: task.title,
  description: task.description ?? '',
  priority: task.priority,
  status: task.status === 'In_Progress' ? 'InProgress' : task.status,
  createdDate: task.createdAt ?? task.createdDate ?? new Date().toISOString(),
})

const pageSize = 10

// Palette — matches the Header/Sidebar/Dashboard "drafting board" theme.
const PAPER = 'bg-[#FAF8FB] dark:bg-[#1B1023]'
const LINE = 'border-[#E0D7E7] dark:border-[#332140]'
const INK = 'text-[#2A1A3D] dark:text-[#EEE6F4]'
const INK_SOFT = 'text-[#6B5C7A] dark:text-[#93839F]'
const ACCENT = '#7C2AE8'
const ACCENT_SOFT = 'bg-[#F1E9F5] dark:bg-[#2A1938]'
const ACCENT_TEXT = 'text-[#7C2AE8] dark:text-[#A868F0]'

const statusStyles: Record<Status, string> = {
  Pending: 'border-[#B98D2E] text-[#B98D2E] dark:border-[#D9A94A] dark:text-[#D9A94A]',
  InProgress: 'border-[#7C2AE8] text-[#7C2AE8] dark:border-[#A868F0] dark:text-[#A868F0]',
  Completed: 'border-[#3F8F6D] text-[#3F8F6D] dark:border-[#5FAF8D] dark:text-[#5FAF8D]',
}

export default function TasksPage() {
  const tasksPageRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [sortField, setSortField] = useState<'createdDate' | 'title' | 'priority'>('createdDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [draggingTaskId, setDraggingTaskId] = useState<number | string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', page, appliedSearch, statusFilter, priorityFilter, sortField, sortDirection],
    queryFn: () => api.getTasks({
      page,
      limit: pageSize,
      search: appliedSearch,
      status: statusFilter === 'All' ? undefined : statusFilter,
      priority: priorityFilter === 'All' ? undefined : priorityFilter,
      sortBy: sortField === 'createdDate' ? 'createdAt' : sortField,
      sortOrder: sortDirection,
    }),
  })

  const tasks = useMemo(() => (data?.data ?? []).map(normalizeTask), [data])

  const totalTasks = data?.meta.total ?? tasks.length
  const totalPages = Math.max(1, Math.ceil(totalTasks / pageSize))
  const paginatedTasks = tasks

  const hasActiveFilters = appliedSearch !== '' || statusFilter !== 'All' || priorityFilter !== 'All'

  const statusCounts = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] ?? 0) + 1
        return acc
      },
      {} as Record<Status, number>,
    )
  }, [tasks])

  const handleSortDirection = () => {
    setPage(1)
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(search)
  }

  const handleCreateTask = async (values: TaskFormValues) => {
    setIsCreating(true)
    try {
      await api.createTask({
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status ?? 'Pending',
      })
      setSearch('')
      setAppliedSearch('')
      setStatusFilter('All')
      setPriorityFilter('All')
      setSortField('createdDate')
      setSortDirection('desc')
      setPage(1)
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' })
      setIsCreateModalOpen(false)
      toast('Task created successfully.', 'success')
    } catch (createError) {
      toast(createError instanceof Error ? createError.message : 'Failed to create task.', 'error')
      throw createError
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      await api.deleteTask(taskToDelete.id)
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' })
      if (tasks.length === 1 && page > 1) setPage((currentPage) => currentPage - 1)
      setTaskToDelete(null)
      toast('Task deleted successfully.', 'success')
    } catch (deleteError) {
      toast(deleteError instanceof Error ? deleteError.message : 'Failed to delete task.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateTask = async (values: TaskFormValues, id?: string | number) => {
    if (id === undefined) return

    setIsUpdating(true)
    try {
      await api.updateTask(id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status ?? 'Pending',
      })
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' })
      setTaskToEdit(null)
      toast('Task updated successfully.', 'success')
    } catch (updateError) {
      toast(updateError instanceof Error ? updateError.message : 'Failed to update task.', 'error')
      throw updateError
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDropToStatus = async (
    taskId: number | string,
    status: Status,
    targetPosition: number,
  ) => {
    try {
      await api.moveTask(taskId, {
        targetStatus: status,
        targetPosition,
      })
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    } finally {
      setDraggingTaskId(null)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setAppliedSearch('')
    setStatusFilter('All')
    setPriorityFilter('All')
    setSortField('createdDate')
    setSortDirection('desc')
    setPage(1)
  }

  useLayoutEffect(() => {
    if (isLoading || isError || !tasksPageRef.current) return

    const context = gsap.context(() => {
      gsap.from('[data-tasks-animate]', {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.1,
        clearProps: 'transform,opacity',
      })
    }, tasksPageRef)

    return () => context.revert()
  }, [appliedSearch, isError, isLoading, page, priorityFilter, sortDirection, sortField, statusFilter])

  return (
    <div ref={tasksPageRef} className="space-y-6">
      {/* Header */}
      <section data-tasks-animate className={`overflow-hidden rounded-sm border-2 ${LINE} ${PAPER}`}>
        <div className={`flex flex-col gap-5 border-b-2 ${LINE} p-6 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-sm border-2 ${LINE} ${ACCENT_SOFT}`}>
              <ClipboardList className={`h-5 w-5 ${ACCENT_TEXT}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold leading-tight tracking-[-0.01em] ${INK}`}>
                Team task board
              </h2>
              <p className={`mt-1 font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
                plan, track, and move work across the board
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className={`flex items-center gap-2 rounded-sm border-2 ${LINE} px-3.5 py-1.5 font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
              <CheckCircle2 className="h-4 w-4" />
              {tasks.length} of {totalTasks} task{totalTasks !== 1 ? 's' : ''}
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-[#7C2AE8] bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#6B22C9] hover:bg-[#6B22C9]"
            >
              <Plus className="h-4 w-4" />
              Create task
            </button>
          </div>
        </div>

        {/* Status summary strip */}
        {tasks.length > 0 && (
          <div className="flex flex-wrap gap-2 px-6 py-4">
            {(Object.keys(statusStyles) as Status[]).map((status) => (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 rounded-sm border-2 px-3 py-1 font-mono text-[11px] tracking-wide ${statusStyles[status]}`}
              >
                {status === 'InProgress' ? 'In progress' : status}
                <span className="font-semibold">{statusCounts[status] ?? 0}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Filters */}
      <section data-tasks-animate className={`rounded-sm border-2 ${LINE} ${PAPER} p-5`}>
        <div className={`mb-3 flex items-center gap-2 font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
          <Filter className="h-4 w-4" />
          filter &amp; sort
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search tasks</span>
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${INK_SOFT}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input pl-9"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Search
            </button>
          </label>

          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value as 'All' | Status)
              }}
              className="input"
            >
              <option value="All">All status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filter by priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPage(1)
                setPriorityFilter(e.target.value as 'All' | Priority)
              }}
              className="input"
            >
              <option value="All">All priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Sort by</span>
            <select
              value={sortField}
              onChange={(e) => {
                setPage(1)
                setSortField(e.target.value as 'createdDate' | 'title' | 'priority')
              }}
              className="input"
            >
              <option value="createdDate">Sort by date</option>
              <option value="title">Sort by title</option>
              <option value="priority">Sort by priority</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleSortDirection}
            className="btn btn-secondary btn-md"
            aria-label={sortDirection === 'asc' ? 'Sort ascending, click to sort descending' : 'Sort descending, click to sort ascending'}
            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </button>
        </div>

        {hasActiveFilters && (
          <div className={`mt-3 flex items-center justify-between border-t-2 ${LINE} pt-3`}>
            <p className={`font-mono text-[11px] tracking-wide ${INK_SOFT}`}>Filters are active</p>
            <button
              type="button"
              onClick={clearFilters}
              className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium tracking-wide hover:underline ${ACCENT_TEXT}`}
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Content */}
      {isError ? (
        <div data-tasks-animate className="flex items-start gap-3 rounded-sm border-2 border-[#B23A5C] bg-[#FBEFF2] p-4 text-[#8A2645] dark:border-[#D9628C] dark:bg-[#2A1420] dark:text-[#F0AFC4]">
          <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center border-2 border-[#B23A5C] dark:border-[#D9628C]">
            <X className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">Couldn&apos;t load tasks</p>
            <p className="font-mono text-sm opacity-90">{(error as Error)?.message || 'Failed to load tasks.'}</p>
          </div>
        </div>
      ) : !isLoading && tasks.length === 0 ? (
        <div data-tasks-animate className={`flex flex-col items-center gap-3 rounded-sm border-2 border-dashed ${LINE} ${PAPER} px-6 py-14 text-center`}>
          <div className={`flex h-12 w-12 items-center justify-center border-2 ${LINE} ${INK_SOFT}`}>
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className={`font-medium ${INK}`}>
              {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
            </p>
            <p className={`mt-1 font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
              {hasActiveFilters ? 'Try adjusting your search or filters.' : 'New tasks will show up here.'}
            </p>
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm mt-1">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div data-tasks-animate>
            <TaskList
              tasks={paginatedTasks}
              isLoading={isLoading}
              onEdit={setTaskToEdit}
              onDelete={setTaskToDelete}
              draggable
              onDragStart={(task) => setDraggingTaskId(task.id)}
              onDragEnd={() => setDraggingTaskId(null)}
              onDropOnStatus={(sourceTask, status, targetPosition) =>
                handleDropToStatus(sourceTask.id, status, targetPosition)
              }
              draggingTaskId={draggingTaskId}
            />
          </div>

          {totalTasks > 0 && (
            <div data-tasks-animate className={`flex flex-col items-center justify-between gap-3 rounded-sm border-2 ${LINE} ${PAPER} p-4 sm:flex-row`}>
              <p className={`font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
                Page <span className={`font-medium ${INK}`}>{page}</span> of{' '}
                <span className={`font-medium ${INK}`}>{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <Modal title="Create task" onClose={() => !isCreating && setIsCreateModalOpen(false)}>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isCreating}
          />
        </Modal>
      )}

      {taskToDelete && (
        <DeleteConfirmation
          task={taskToDelete}
          onConfirm={handleDeleteTask}
          onCancel={() => !isDeleting && setTaskToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {taskToEdit && (
        <Modal title="Edit task" onClose={() => !isUpdating && setTaskToEdit(null)}>
          <TaskForm
            initial={taskToEdit}
            onSubmit={handleUpdateTask}
            onCancel={() => setTaskToEdit(null)}
            isLoading={isUpdating}
          />
        </Modal>
      )}
    </div>
  )
}