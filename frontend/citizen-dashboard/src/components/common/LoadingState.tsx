import { LoaderCircle } from 'lucide-react'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div aria-live="polite" className="flex items-center gap-2 text-sm text-muted" role="status">
      <LoaderCircle aria-hidden="true" className="animate-spin text-brand motion-reduce:animate-none" size={18} />
      <span>{label}</span>
    </div>
  )
}