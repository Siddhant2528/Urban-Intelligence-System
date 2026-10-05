interface ProgressBarProps {
  value: number
  max?: number
  label: string
}

export function ProgressBar({ label, max = 100, value }: ProgressBarProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0
  const percentage = (safeValue / safeMax) * 100

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular-nums text-muted">{Math.round(percentage)}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}