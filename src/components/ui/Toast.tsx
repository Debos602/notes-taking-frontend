import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

let toastCount = 0
const listeners: Array<(t: Toast) => void> = []

export function toast(message: string, type: ToastType = 'info') {
  const id = ++toastCount
  const t: Toast = { id, message, type }
  listeners.forEach((l) => l(t))
  setTimeout(() => {
    listeners.forEach((l) =>
      l({ id, message: '', type } as Toast),
    )
  }, 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) =>
        t.message ? [...prev, t] : prev.filter((x) => x.id !== t.id),
      )
    }
    listeners.push(listener)
    return () => {
      const idx = listeners.indexOf(listener)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, remove }
}

export function ToastContainer() {
  const { toasts, remove } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ring-1"
          style={{
            backgroundColor:
              t.type === 'success'
                ? '#dcfce8'
                : t.type === 'error'
                  ? '#fee2e2'
                  : '#e0f2fe',
            color:
              t.type === 'success'
                ? '#166534'
                : t.type === 'error'
                  ? '#991b1b'
                  : '#0c4a6e',
            borderColor:
              t.type === 'success'
                ? '#86efac'
                : t.type === 'error'
                  ? '#fca5a5'
                  : '#7dd3fc',
          }}
        >
          <div className="mt-0.5 flex-shrink-0">
            {t.type === 'success' && (
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            )}
            {t.type === 'error' && (
              <XCircle className="h-5 w-5" aria-hidden="true" />
            )}
            {t.type === 'info' && (
              <Info className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <span className="max-w-[calc(100vw-2rem)] break-words sm:max-w-xs">{t.message}</span>
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="ml-2 self-start text-xs underline opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
