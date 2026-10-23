import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ children, className = '', id, label, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-ink" htmlFor={selectId}>
        {label}
      </label>
      <select
        className={`min-h-10 w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors duration-150 hover:border-brand/50 focus:border-brand focus:outline-2 focus:outline-offset-1 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${className}`}
        id={selectId}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}