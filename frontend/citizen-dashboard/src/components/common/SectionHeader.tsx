import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  level?: 1 | 2 | 3
  id?: string
}

const headingTags = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
} as const

const headingSizes = {
  1: 'text-3xl',
  2: 'text-2xl',
  3: 'text-lg',
} as const

export function SectionHeader({
  action,
  description,
  id,
  level = 1,
  title,
}: SectionHeaderProps) {
  const Heading = headingTags[level]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Heading className={`${headingSizes[level]} font-semibold leading-tight text-ink`} id={id}>
          {title}
        </Heading>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}