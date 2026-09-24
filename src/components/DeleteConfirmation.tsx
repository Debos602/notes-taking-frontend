import type { Task } from '../types'
import { Modal } from './ui/Modal'

interface DeleteConfirmationProps {
  task: Task
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export function DeleteConfirmation({
  task,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationProps) {
  return (
    <Modal title="Delete task" onClose={onCancel}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9V3.632a1 1 0 011.555-.832l7.5 4.5a1 1 0 01.445.832V12m-9 0h-6"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.456 5.904L3 7.999v12a2 2 0 002 2h12a2 2 0 002-2V7.999l-2.456-2.095"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold">"{task.title}"</span>? This action
            cannot be undone.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-secondary-200 pt-4 sm:flex-row sm:justify-end sm:gap-3 dark:border-secondary-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="rounded-md border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-100 dark:border-secondary-600 dark:text-secondary-200 dark:hover:bg-secondary-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting && (
            <svg
              className="-ml-1 h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          Delete
        </button>
      </div>
    </Modal>
  )
}
