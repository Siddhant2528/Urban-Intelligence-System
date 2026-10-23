import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function SearchInput({
  className = '',
  id,
  label = 'Search',
  ...props
}: SearchInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-ink" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={18}
          strokeWidth={1.8}
        />
        <input
          className={`min-h-10 w-full rounded-control border border-line bg-surface py-2 pl-10 pr-3 text-sm text-ink placeholder:text-muted transition-colors duration-150 hover:border-brand/50 focus:border-brand focus:outline-2 focus:outline-offset-1 focus:outline-brand motion-reduce:transition-none ${className}`}
          id={inputId}
          type="search"
          {...props}
        />
      </div>
    </div>
  )
}