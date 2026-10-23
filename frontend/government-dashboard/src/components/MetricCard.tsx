import {
  Activity,
  Accessibility,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  MapPinned,
  Pencil,
  UsersRound,
} from 'lucide-react'
import { useState, useEffect, type ComponentType } from 'react'

const icons: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  score: ChartNoAxesCombined,
  areas: MapPinned,
  reviews: Activity,
  infrastructure: Building2,
  projects: BriefcaseBusiness,
  coverage: UsersRound,
  accessibility: Accessibility,
}

export type MetricCardProps = {
  label: string
  value: string
  suffix: string
  note: string
  tone: string
  icon: string
  editable?: boolean
  numericValue?: number
  onValueChange?: (val: number) => void
}

export function MetricCard({
  label,
  value,
  suffix,
  note,
  tone,
  icon,
  editable,
  numericValue,
  onValueChange,
}: MetricCardProps) {
  const Icon = icons[icon] ?? ChartNoAxesCombined
  const [tempValue, setTempValue] = useState<string>(
    numericValue !== undefined ? String(numericValue) : value.replace(/[^0-9.]/g, '')
  )
  const [isFocused, setIsFocused] = useState<boolean>(false)

  useEffect(() => {
    if (numericValue !== undefined) {
      setTempValue(String(numericValue))
    }
  }, [numericValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setTempValue(raw)
    const parsed = parseFloat(raw)
    if (!isNaN(parsed) && parsed > 0 && onValueChange) {
      onValueChange(parsed)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseFloat(tempValue)
    if (isNaN(parsed) || parsed <= 0) {
      const fallback = numericValue ?? 182
      setTempValue(String(fallback))
      if (onValueChange) onValueChange(fallback)
    }
  }

  // Dynamic width matching character length snuggly
  const charCount = Math.max(1, tempValue.length)

  return (
    <article className={`metric-card metric-${tone} ${editable ? 'metric-card-editable' : ''}`}>
      <div className="metric-card-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon">
          <Icon size={17} strokeWidth={2} />
        </span>
      </div>
      <div className="metric-number">
        {editable ? (
          <div
            className={`metric-interactive-budget ${isFocused ? 'is-focused' : ''}`}
            title="Click or type to change Total Budget (in ₹ Cr)"
          >
            <span className="metric-currency-symbol">₹</span>
            <input
              type="number"
              min={1}
              max={10000}
              step={1}
              value={tempValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              style={{ width: `${charCount * 15 + 4}px` }}
              className="metric-budget-input"
              aria-label="Enter Total Budget in Crores"
            />
            <span className="metric-budget-suffix">{suffix.trim()}</span>
            <Pencil size={11} className="metric-pencil-icon" />
          </div>
        ) : (
          <>
            <strong>{value}</strong>
            <span>{suffix}</span>
          </>
        )}
      </div>
      <div className="metric-foot">
        <span className="metric-note">{note}</span>
      </div>
    </article>
  )
}
