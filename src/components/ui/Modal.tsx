import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm border-2 border-[#E0D7E7] bg-[#FAF8FB] p-6 shadow-xl dark:border-[#332140] dark:bg-[#1B1023]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold text-[#2A1A3D] dark:text-[#EEE6F4]">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-sm p-1 text-[#6B5C7A] hover:bg-[#F1E9F5] dark:text-[#93839F] dark:hover:bg-[#2A1938]" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
