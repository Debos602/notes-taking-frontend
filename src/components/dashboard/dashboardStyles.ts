export const PAPER = 'bg-[#FAF8FB] dark:bg-[#1B1023]'
export const LINE = 'border-[#E0D7E7] dark:border-[#332140]'
export const INK = 'text-[#2A1A3D] dark:text-[#EEE6F4]'
export const INK_SOFT = 'text-[#6B5C7A] dark:text-[#93839F]'
export const ACCENT = '#7C2AE8'
export const ACCENT_SOFT = 'bg-[#F1E9F5] dark:bg-[#2A1938]'
export const CARD = `rounded-sm border-2 ${LINE} ${PAPER}`

export const statusColors: Record<string, { light: string; dark: string }> = {
  Pending: { light: '#B98D2E', dark: '#D9A94A' },
  Completed: { light: '#3F8F6D', dark: '#5FAF8D' },
  'In progress': { light: ACCENT, dark: '#A868F0' },
}

export const priorityColors: Record<string, { light: string; dark: string }> = {
  Low: { light: '#9C8FAE', dark: '#B7A9C9' },
  Medium: { light: '#B98D2E', dark: '#D9A94A' },
  High: { light: '#B23A5C', dark: '#D9628C' },
}

export function formatStatus(status: string) {
  return status === 'In_Progress' ? 'In progress' : status
}
