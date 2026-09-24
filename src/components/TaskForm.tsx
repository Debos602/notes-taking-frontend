import { useState } from 'react'
import { AlertCircle, FileText, Flag, ListChecks, Loader2, Type } from 'lucide-react'
import type { Task, TaskFormValues } from '../types'
import { priorityOptions, statusOptions, taskFormSchema, zodToErrors } from '../lib/utils'

interface TaskFormProps {
  initial?: Task | null
  onSubmit: (values: TaskFormValues, id?: string | number) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const emptyValues: TaskFormValues = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
}

// Palette — matches the Header/Sidebar/Dashboard/Tasks "drafting board" theme.
const INK = 'text-[#2A1A3D] dark:text-[#EEE6F4]'
const INK_SOFT = 'text-[#6B5C7A] dark:text-[#93839F]'
const LINE = 'border-[#E0D7E7] dark:border-[#332140]'
const ACCENT_SOFT = 'bg-[#F1E9F5] dark:bg-[#2A1938]'
const ERROR = 'text-[#B23A5C] dark:text-[#D9628C]'
const ERROR_BORDER = 'border-[#B23A5C] focus:border-[#B23A5C] dark:border-[#D9628C] dark:focus:border-[#D9628C]'

const priorityDot: Record<string, string> = {
  High: 'bg-[#B23A5C] dark:bg-[#D9628C]',
  Medium: 'bg-[#B98D2E] dark:bg-[#D9A94A]',
  Low: 'bg-[#9C8FAE] dark:bg-[#B7A9C9]',
}

const descriptionLimit = 500

export function TaskForm({
  initial = null,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const isEdit = initial !== null
  const [values, setValues] = useState<TaskFormValues>(
    initial
      ? {
          title: initial.title,
          description: initial.description ?? '',
          priority: initial.priority,
          status: initial.status,
        }
      : emptyValues,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = taskFormSchema.safeParse(values)
    if (!result.success) {
      setErrors(zodToErrors(result.error))
      return
    }
    setErrors({})
    try {
      await onSubmit(result.data, initial?.id)
    } catch {
      /* errors surfaced via toast in parent */
    }
  }

  const inputBase = `mt-1.5 block w-full rounded-sm border-2 bg-[#FAF8FB] px-3 py-2 text-sm ${INK} transition-colors placeholder:text-[#93839F] focus:outline-none focus:border-[#7C2AE8] disabled:cursor-not-allowed disabled:bg-[#F3EEF6] disabled:text-[#93839F] dark:bg-[#1B1023] dark:focus:border-[#A868F0] dark:disabled:bg-[#170D1F]`

  const borderFor = (field: string) => (errors[field] ? ERROR_BORDER : LINE)

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div>
        <label htmlFor="title" className={`flex items-center gap-1.5 text-sm font-medium ${INK}`}>
          <Type className={`h-3.5 w-3.5 ${INK_SOFT}`} />
          Title <span className={ERROR}>*</span>
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={values.title}
          onChange={handleChange}
          disabled={isLoading}
          className={`${inputBase} ${borderFor('title')}`}
          placeholder="e.g. Draft Q3 launch checklist"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className={`mt-1.5 flex items-center gap-1 font-mono text-[12px] tracking-wide ${ERROR}`}>
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="description" className={`flex items-center gap-1.5 text-sm font-medium ${INK}`}>
            <FileText className={`h-3.5 w-3.5 ${INK_SOFT}`} />
            Description
          </label>
          <span className={`font-mono text-[11px] tracking-wide ${INK_SOFT}`}>
            {values.description?.length ?? 0}/{descriptionLimit}
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          maxLength={descriptionLimit}
          className={`${inputBase} ${borderFor('description')} resize-none`}
          placeholder="Optional details about this task..."
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'desc-error' : undefined}
        />
        {errors.description && (
          <p id="desc-error" className={`mt-1.5 flex items-center gap-1 font-mono text-[12px] tracking-wide ${ERROR}`}>
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className={`flex items-center gap-1.5 text-sm font-medium ${INK}`}>
            <Flag className={`h-3.5 w-3.5 ${INK_SOFT}`} />
            Priority <span className={ERROR}>*</span>
          </label>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 ${priorityDot[values.priority] ?? 'bg-[#93839F]'}`}
            />
            <select
              id="priority"
              name="priority"
              value={values.priority}
              onChange={handleChange}
              disabled={isLoading}
              className={`${inputBase} ${borderFor('priority')} pl-7`}
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="status" className={`flex items-center gap-1.5 text-sm font-medium ${INK}`}>
              <ListChecks className={`h-3.5 w-3.5 ${INK_SOFT}`} />
              Status
            </label>
            <select
              id="status"
              name="status"
              value={values.status}
              onChange={handleChange}
              disabled={isLoading}
              className={`${inputBase} ${borderFor('status')}`}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'InProgress' ? 'In Progress' : s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`flex flex-col gap-3 border-t-2 ${LINE} pt-4 sm:flex-row sm:justify-end sm:gap-3`}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`rounded-sm border-2 ${LINE} px-4 py-2 text-sm font-medium ${INK} transition-colors hover:${ACCENT_SOFT} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-[#7C2AE8] bg-[#7C2AE8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B22C9] hover:border-[#6B22C9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 className="-ml-1 h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}