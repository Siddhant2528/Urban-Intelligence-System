import { Sparkles } from 'lucide-react'
import { Badge } from '../common'
import { getHeatmapScoreColor, getHeatmapScoreGradient } from '../../utils/scoreColor'

interface AreaUisSpotlightProps {
  areaAName: string
  areaAUis: number | null
  areaBName: string
  areaBUis: number | null
  scale?: number
}

export function AreaUisSpotlight({
  areaAName,
  areaAUis,
  areaBName,
  areaBUis,
  scale = 100,
}: AreaUisSpotlightProps) {
  // Radial calculation for SVG arc (r=42, circumference ~ 264)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeOffsetA = areaAUis !== null ? circumference - (Math.min(areaAUis, scale) / scale) * circumference : circumference
  const strokeOffsetB = areaBUis !== null ? circumference - (Math.min(areaBUis, scale) / scale) * circumference : circumference

  const colorA = getHeatmapScoreColor(areaAUis)
  const colorB = getHeatmapScoreColor(areaBUis)
  const gradA = getHeatmapScoreGradient(areaAUis)
  const gradB = getHeatmapScoreGradient(areaBUis)

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-800/20 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 p-5 sm:p-7 shadow-raised">
      {/* Decorative top accent glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-40 w-3/4 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 blur-2xl" />

      {/* Spotlight Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white shadow-sm">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Overall Area UIS Benchmark</h3>
              <span className="rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                PRIMARY METRIC
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Composite Urban Intensity Score comparison on a standardized 0–{scale} scale
            </p>
          </div>
        </div>
        <Badge tone="warning">DEMO BENCHMARK</Badge>
      </div>

      {/* Head to Head Area UIS Cards */}
      <div className="relative mt-6 grid gap-5 lg:grid-cols-[1fr_auto_1fr] items-center">
        {/* Area A Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md font-black text-xs text-white shadow-xs"
              style={{ backgroundColor: colorA }}
            >
              A
            </span>
            <h4 className="truncate text-base font-bold text-slate-900" title={areaAName}>
              {areaAName}
            </h4>
          </div>

          <div className="mt-4 flex items-center gap-4">
            {/* Circular Gauge */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#gradientUisA)"
                  strokeWidth="8.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffsetA}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="gradientUisA" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradA.from} />
                    <stop offset="100%" stopColor={gradA.to} />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score in Black */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black tabular-nums tracking-tight text-slate-950">
                  {areaAUis !== null ? areaAUis.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Score Scale</span>
                <span className="font-extrabold text-slate-950">{areaAUis ? `${((areaAUis / scale) * 100).toFixed(0)}%` : '0%'}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{
                    width: `${areaAUis ? Math.min(100, Math.max(0, areaAUis)) : 0}%`,
                    background: `linear-gradient(to right, ${gradA.from}, ${gradA.to})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center VS Bridge */}
        <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
            <span className="text-xs font-black tracking-wider text-slate-700">VS</span>
          </div>
        </div>

        {/* Area B Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md font-black text-xs text-white shadow-xs"
              style={{ backgroundColor: colorB }}
            >
              B
            </span>
            <h4 className="truncate text-base font-bold text-slate-900" title={areaBName}>
              {areaBName}
            </h4>
          </div>

          <div className="mt-4 flex items-center gap-4">
            {/* Circular Gauge */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#gradientUisB)"
                  strokeWidth="8.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffsetB}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="gradientUisB" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradB.from} />
                    <stop offset="100%" stopColor={gradB.to} />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score in Black */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black tabular-nums tracking-tight text-slate-950">
                  {areaBUis !== null ? areaBUis.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Score Scale</span>
                <span className="font-extrabold text-slate-950">{areaBUis ? `${((areaBUis / scale) * 100).toFixed(0)}%` : '0%'}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{
                    width: `${areaBUis ? Math.min(100, Math.max(0, areaBUis)) : 0}%`,
                    background: `linear-gradient(to right, ${gradB.from}, ${gradB.to})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
