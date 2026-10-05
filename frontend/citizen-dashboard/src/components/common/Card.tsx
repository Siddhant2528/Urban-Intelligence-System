import type { HTMLAttributes } from 'react'

export type CardPadding = 'none' | 'compact' | 'default'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  interactive?: boolean
}

const paddings: Record<CardPadding, string> = {
  none: '',
  compact: 'p-4',
  default: 'p-5',
}

export function Card({
  className = '',
  interactive = false,
  padding = 'default',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card border border-line bg-surface shadow-card ${paddings[padding]} ${interactive ? 'transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-raised active:translate-y-px active:shadow-card motion-reduce:transform-none motion-reduce:transition-none' : ''} ${className}`}
      {...props}
    />
  )
}