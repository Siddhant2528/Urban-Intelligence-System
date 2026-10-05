export interface TabItem {
  value: string
  label: string
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  label: string
}

export function Tabs({ items, label, onValueChange, value }: TabsProps) {
  return (
    <div aria-label={label} className="flex flex-wrap gap-1 border-b border-line" role="tablist">
      {items.map((item) => {
        const selected = item.value === value

        return (
          <button
            aria-selected={selected}
            className={`min-h-10 border-b-2 px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-brand text-brand' : 'border-transparent text-muted hover:border-brand/40 hover:text-ink'} active:bg-brand-soft motion-reduce:transition-none`}
            disabled={item.disabled}
            key={item.value}
            onClick={() => onValueChange(item.value)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}