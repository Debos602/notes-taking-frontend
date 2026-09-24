import { Pencil, Trash2 } from 'lucide-react'
import { useDrag } from 'react-dnd'
import type { Task } from '../types'
import { formatDate } from '../lib/utils'
import { PriorityBadge, StatusBadge } from './ui/Badge'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  draggable?: boolean
  onDragStart?: (task: Task) => void
  onDragEnd?: () => void
  isDragging?: boolean
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  draggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: TaskCardProps) {
  const [{ isDragging: dragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: () => {
      onDragStart?.(task)
      return { task }
    },
    canDrag: draggable,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: () => onDragEnd?.(),
  }), [draggable, onDragEnd, onDragStart, task])

  return (
    <div
      ref={(node) => {
        ;(drag as unknown as (element: HTMLDivElement | null) => void)(node)
      }}
      className={`group flex flex-col gap-3 rounded-xl border border-secondary-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-secondary-800 dark:bg-secondary-900 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging || dragging ? 'opacity-60 ring-2 ring-primary-200 dark:ring-primary-500/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 font-semibold text-secondary-900 wrap-break-word dark:text-secondary-100">
          {task.title}
        </h3>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded p-1.5 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-100"
            aria-label={`Edit ${task.title}`}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded p-1.5 text-secondary-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            aria-label={`Delete ${task.title}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {task.description ? (
        <p className="text-sm text-secondary-600 wrap-break-word dark:text-secondary-300">
          {task.description}
        </p>
      ) : (
        <p className="text-sm italic text-secondary-400 dark:text-secondary-500">No description provided.</p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        <span className="text-xs text-secondary-400 dark:text-secondary-500">
          <span className="hidden sm:inline">Created </span>
          {formatDate(task.createdDate)}
        </span>
      </div>
    </div>
  )
}
