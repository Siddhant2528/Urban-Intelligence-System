import {
  Accessibility,
  BusFront,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getHeatmapScoreColor, getHeatmapScoreGradient, CATEGORY_ACCENT_STYLES } from '../../utils/scoreColor'
import type { IndicatorCategory } from '../../types/indicator'

const indicatorIcons: Record<IndicatorCategory | string, LucideIcon> = {
  Environment: Leaf,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Safety: ShieldCheck,
  Transport: BusFront,
  Infrastructure: Landmark,
  Accessibility,
}

const indicatorDescriptions: Record<string, string> = {
  Environment: 'Air quality, green cover, and environmental health measures',
  Healthcare: 'Hospital density, bed availability, and medical service access',
  Education: 'School distribution, educational facilities, and learning access',
  Safety: 'Police coverage, safety index, and emergency readiness',
  Transport: 'Public transit nodes, bus routes, and mobility connectivity',
  Infrastructure: 'Civic utilities, road networks, and public infrastructure',
  Accessibility: 'Walking proximity to essential daily civic services',
}

export interface IndicatorComparisonItem {
  id: string
  label: string
  areaAValue: number | null
  areaBValue: number | null
}

interface PairedIndicatorScoresProps {
  areaAName: string
  areaBName: string
  rows: IndicatorComparisonItem[]
}

export function PairedIndicatorScores({
  areaAName,
  areaBName,
  rows,
}: PairedIndicatorScoresProps) {
  return (
    <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-2">
      {rows.map((row) => {
        const Icon = indicatorIcons[row.label] || TrendingUp
        const hasA = row.areaAValue !== null && Number.isFinite(row.areaAValue)
        const hasB = row.areaBValue !== null && Number.isFinite(row.areaBValue)
        const safeA = hasA ? Math.min(100, Math.max(0, row.areaAValue!)) : 0
        const safeB = hasB ? Math.min(100, Math.max(0, row.areaBValue!)) : 0

        const colorA = getHeatmapScoreColor(row.areaAValue)
        const colorB = getHeatmapScoreColor(row.areaBValue)
        const gradA = getHeatmapScoreGradient(row.areaAValue)
        const gradB = getHeatmapScoreGradient(row.areaBValue)
        const accent = CATEGORY_ACCENT_STYLES[row.label] || {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          glow: 'from-emerald-500/10 to-teal-500/5',
        }

        return (
          <div
            key={row.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            {/* Ambient category glow corner */}
            <div
              className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${accent.glow} blur-xl`}
            />

            <div>
              {/* Header */}
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accent.bg} ${accent.text} ${accent.border} shadow-xs transition-transform group-hover:scale-105`}
                >
                  <Icon size={19} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{row.label}</h4>
                  <p className="text-[11.5px] text-slate-500 truncate mt-0.5">
                    {indicatorDescriptions[row.label] || 'City indicator comparison metric'}
                  </p>
                </div>
              </div>

              {/* Dual Comparative Progress Bars */}
              <div className="mt-5 space-y-3.5">
                {/* Area A Bar */}
                <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100 transition-colors group-hover:bg-slate-50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: colorA }}
                      />
                      <span className="font-semibold text-slate-800 truncate text-xs">{areaAName}</span>
                    </div>
                    {/* Score display in crisp black */}
                    <span className="tabular-nums shrink-0">
                      {hasA ? (
                        <span className="text-slate-950 font-black text-sm">{row.areaAValue}</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">No Data</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                    {hasA && (
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${safeA}%`,
                          background: `linear-gradient(to right, ${gradA.from}, ${gradA.to})`,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Area B Bar */}
                <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100 transition-colors group-hover:bg-slate-50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: colorB }}
                      />
                      <span className="font-semibold text-slate-800 truncate text-xs">{areaBName}</span>
                    </div>
                    {/* Score display in crisp black */}
                    <span className="tabular-nums shrink-0">
                      {hasB ? (
                        <span className="text-slate-950 font-black text-sm">{row.areaBValue}</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">No Data</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                    {hasB && (
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${safeB}%`,
                          background: `linear-gradient(to right, ${gradB.from}, ${gradB.to})`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
