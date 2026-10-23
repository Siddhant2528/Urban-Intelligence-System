import { Sparkles } from 'lucide-react'
import { Badge } from '../common'

interface AreaUisHeroCardProps {
  areaName: string
  uisScore: number
  scale?: number
  isBackendData?: boolean
}

export function AreaUisHeroCard({
  areaName,
  uisScore,
  scale = 100,
  isBackendData = false,
}: AreaUisHeroCardProps) {
  // SVG Radial Gauge Calculation (r=48, circumference ~ 301.59)
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, uisScore)) / scale) * circumference

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-brand/40 bg-gradient-to-br from-surface via-surface to-brand-soft/30 p-6 sm:p-7 shadow-raised">
      {/* Decorative background aura */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3 border-b border-line/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white shadow-xs">
              <Sparkles size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">PRIMARY OVERALL SCORE</span>
          </div>
          <h3 className="mt-1 text-xl font-bold text-ink">
            {areaName} Urban Intensity Score (UIS)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="warning">{isBackendData ? 'ESTIMATED INPUTS' : 'DEMO DATA'}</Badge>
        </div>
      </div>

      <div className="relative mt-6 grid gap-6 sm:grid-cols-[auto_1fr] items-center">
        {/* Large Circular Radial Gauge */}
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center mx-auto sm:mx-0">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#areaUisGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="areaUisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black tabular-nums tracking-tight text-ink">
              {uisScore.toFixed(1)}
            </span>
            <span className="text-[11px] font-semibold text-muted">/ {scale} UIS</span>
          </div>
        </div>

        {/* Detailed Insights & Benchmarks */}
        <div className="space-y-3.5">
          <p className="text-xs sm:text-sm leading-relaxed text-muted">
            The composite Urban Intensity Score summarizes the available civic indicators. {isBackendData
              ? 'Some missing measurements currently use illustrative estimates and are not verified official statistics.'
              : 'These demonstration values are illustrative and are not verified official statistics.'}
          </p>

          {/* Progress bar visual */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-medium text-muted">
              <span>Score Scale</span>
              <span className="font-bold text-ink">{((uisScore / scale) * 100).toFixed(0)}% of Max Benchmark</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-600 to-brand transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, uisScore))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
