import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'

interface ErrorStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function ErrorState({ action, description, title }: ErrorStateProps) {
  return (
    <div aria-live="assertive" className="flex flex-col items-center px-6 py-10 text-center" role="alert">
      <CircleAlert aria-hidden="true" className="text-danger" size={24} strokeWidth={1.7} />
      <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}