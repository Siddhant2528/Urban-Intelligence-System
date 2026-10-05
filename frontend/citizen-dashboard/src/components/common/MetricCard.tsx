import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface MetricCardProps {
  label: string
  value: ReactNode
  detail?: ReactNode
  icon?: LucideIcon
}

export function MetricCard({ detail, icon: Icon, label, value }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold leading-tight text-ink">{value}</p>
        </div>
        {Icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
          </span>
        )}
      </div>
      {detail && <div className="mt-3 text-sm text-muted">{detail}</div>}
    </Card>
  )
}