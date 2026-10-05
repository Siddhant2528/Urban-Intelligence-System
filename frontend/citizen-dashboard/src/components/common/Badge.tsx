import type { HTMLAttributes } from 'react'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

export function Badge({ className = '', tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-control px-2 text-xs font-medium ${tones[tone]} ${className}`}
      {...props}
    />
  )
}