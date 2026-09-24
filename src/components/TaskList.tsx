import type { Task } from '../types'
import { useDrop } from 'react-dnd'
import { EmptyState } from './ui/EmptyState'
import { TaskCard } from './TaskCard'
import { TaskBoardSkeleton } from './TaskBoardSkeleton'

// Palette — matches the Header/Sidebar/Dashboard/TasksPage "drafting board" theme.
const COLUMN_PAPER = 'bg-[#F3EEF6] dark:bg-[#170D1F]'
const LINE = 'border-[#E0D7E7] dark:border-[#332140]'
const INK = 'text-[#2A1A3D] dark:text-[#EEE6F4]'
const INK_SOFT = 'text-[#6B5C7A] dark:text-[#93839F]'
const ACCENT_BORDER = 'border-[#7C2AE8] dark:border-[#A868F0]'
const ACCENT_SOFT = 'bg-[#F1E9F5] dark:bg-[#2A1938]'
const ACCENT_TEXT = 'text-[#7C2AE8] dark:text-[#A868F0]'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  draggable?: boolean
  onDragStart?: (task: Task) => void
  onDragEnd?: () => void
  onDropOnStatus?: (sourceTask: Task, status: Task['status'], targetPosition: number) => void
  draggingTaskId?: number | string | null
}

export function TaskList({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDropOnStatus,
  draggingTaskId,
}: TaskListProps) {
  const statuses: Array<{ value: Task['status']; label: string; color: string }> = [
    { value: 'Pending', label: 'To do', color: 'bg-[#B98D2E] dark:bg-[#D9A94A]' },
    { value: 'InProgress', label: 'In progress', color: 'bg-[#7C2AE8] dark:bg-[#A868F0]' },
    { value: 'Completed', label: 'Done', color: 'bg-[#3F8F6D] dark:bg-[#5FAF8D]' },
  ]

  if (isLoading) {
    return <TaskBoardSkeleton />
  }

  if (!tasks.length) {
    return <EmptyState />
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status.value)

        return (
          <StatusColumn
            key={status.value}
            status={status}
            tasks={statusTasks}
            draggable={draggable}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDropOnStatus={onDropOnStatus}
            draggingTaskId={draggingTaskId}
          />
        )
      })}
    </div>
  )
}

function StatusColumn({
  status,
  tasks,
  draggable,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropOnStatus,
  draggingTaskId,
}: {
  status: { value: Task['status']; label: string; color: string }
  tasks: Task[]
  draggable: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onDragStart?: (task: Task) => void
  onDragEnd?: () => void
  onDropOnStatus?: (sourceTask: Task, status: Task['status'], targetPosition: number) => void
  draggingTaskId?: number | string | null
}) {
  const [{ isOver }, drop] = useDrop<any, any, { isOver: boolean }>(() => ({
    accept: 'TASK' as const,
    canDrop: () => draggable,
    drop: (item: { task: Task }, monitor) => {
      if (!monitor.didDrop()) onDropOnStatus?.(item.task, status.value, tasks.length)
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [draggable, onDropOnStatus, status.value, tasks.length])

  return (
    <section
      className={`min-h-80 rounded-sm border-2 p-3 transition-colors ${
        isOver ? `${ACCENT_BORDER} ${ACCENT_SOFT}` : `${LINE} ${COLUMN_PAPER}`
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rotate-45 ${status.color}`} />
          <h3 className={`text-sm font-semibold tracking-tight ${INK}`}>{status.label}</h3>
          <span className={`rounded-sm border-2 ${LINE} px-2 py-0.5 font-mono text-[11px] ${INK_SOFT}`}>
            {tasks.length}
          </span>
        </div>
        <span className={`font-mono text-[10px] tracking-wide ${INK_SOFT}`}>drop here</span>
      </div>

      <div className="space-y-3">
        {tasks.length ? tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggingTaskId === task.id}
          />
        )) : null}

        <div
          ref={(node) => {
            ;(drop as unknown as (element: HTMLDivElement | null) => void)(node)
          }}
          className={`flex min-h-24 items-center justify-center rounded-sm border-2 border-dashed px-4 text-center font-mono text-[11px] tracking-wide transition-colors ${
            isOver ? `${ACCENT_BORDER} ${ACCENT_SOFT} ${ACCENT_TEXT}` : `${LINE} ${INK_SOFT}`
          }`}
        >
          {tasks.length ? 'Drop task here' : 'Drop a task here'}
        </div>
      </div>
    </section>
  )
}