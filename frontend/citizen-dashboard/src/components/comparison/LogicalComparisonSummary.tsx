import {
  Sparkles,
  AlertTriangle,
  Compass,
  HeartPulse,
  BusFront,
  ShieldCheck,
  Factory,
  Droplets,
  GraduationCap,
  TreePine,
  Briefcase,
  TrafficCone,
  Landmark,
  Building,
  CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getAreaCivicProfile } from '../../utils/areaComparisonInsights'

const SUMMARY_PALETTE = {
  green: '#4F7D32',
  yellow: '#FFD16A',
  amber: '#F5B52E',
  red: '#D9361E',
} as const

interface LogicalComparisonSummaryProps {
  areaAId: string
  areaAName: string
  areaBId: string
  areaBName: string
}

function resolveInsightIcon(title: string): LucideIcon {
  const t = title.toLowerCase()
  if (t.includes('health') || t.includes('medical') || t.includes('hospital') || t.includes('sanatorium') || t.includes('clinic')) return HeartPulse
  if (t.includes('safe') || t.includes('police') || t.includes('surveillance')) return ShieldCheck
  if (t.includes('transit') || t.includes('transport') || t.includes('highway') || t.includes('freight') || t.includes('mobility')) return BusFront
  if (t.includes('drainage') || t.includes('water') || t.includes('utility')) return Droplets
  if (t.includes('emission') || t.includes('air') || t.includes('industrial') || t.includes('manufacturing')) return Factory
  if (t.includes('school') || t.includes('academic') || t.includes('education') || t.includes('college')) return GraduationCap
  if (t.includes('green') || t.includes('canopy') || t.includes('nature') || t.includes('sanctuary') || t.includes('tree')) return TreePine
  if (t.includes('employ') || t.includes('commercial') || t.includes('market') || t.includes('business')) return Briefcase
  if (t.includes('traffic') || t.includes('congestion') || t.includes('bottleneck') || t.includes('road')) return TrafficCone
  if (t.includes('heritage') || t.includes('culture') || t.includes('religious') || t.includes('pilgrim')) return Landmark
  if (t.includes('access') || t.includes('planned') || t.includes('residential') || t.includes('sector')) return Building
  return Sparkles
}

function getDomainCategoryTag(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('health') || t.includes('medical') || t.includes('hospital')) return 'Healthcare & Medical'
  if (t.includes('safe') || t.includes('police')) return 'Public Safety'
  if (t.includes('transit') || t.includes('transport') || t.includes('highway') || t.includes('freight')) return 'Mobility & Transit'
  if (t.includes('drainage') || t.includes('water') || t.includes('utility')) return 'Civic Infrastructure'
  if (t.includes('emission') || t.includes('air') || t.includes('industrial')) return 'Environment & Industry'
  if (t.includes('school') || t.includes('academic') || t.includes('education')) return 'Education & Academics'
  if (t.includes('green') || t.includes('canopy') || t.includes('nature')) return 'Environment & Ecology'
  if (t.includes('employ') || t.includes('commercial') || t.includes('market')) return 'Economy & Commerce'
  if (t.includes('traffic') || t.includes('congestion') || t.includes('road')) return 'Traffic & Connectivity'
  if (t.includes('heritage') || t.includes('culture') || t.includes('religious')) return 'Heritage & Culture'
  return 'Urban Planning'
}

export function LogicalComparisonSummary({
  areaAId,
  areaAName,
  areaBId,
  areaBName,
}: LogicalComparisonSummaryProps) {
  const profileA = getAreaCivicProfile(areaAId, areaAName)
  const profileB = getAreaCivicProfile(areaBId, areaBName)

  return (
    <div className="space-y-8">
      {/* ── 1. CIVIC ADVANTAGES SECTION (#4F7D32 Green) ───────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg shadow-2xs"
            style={{ backgroundColor: `${SUMMARY_PALETTE.green}20`, color: SUMMARY_PALETTE.green }}
          >
            <CheckCircle2 size={16} />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Civic Strengths & Key Advantages
            </h3>
            <p className="text-xs text-slate-500">Documented urban assets, zoning advantages, and strong services</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Area A Civic Advantages Column */}
          <div className="space-y-3.5">
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: SUMMARY_PALETTE.green }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-black text-white"
                style={{ backgroundColor: SUMMARY_PALETTE.green }}
              >
                A
              </span>
              <span>{areaAName} Civic Advantages</span>
            </div>
            <div className="grid gap-3">
              {profileA.keyStrengths.map((item, idx) => {
                const Icon = resolveInsightIcon(item.title)
                const category = item.category || getDomainCategoryTag(item.title)
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#4F7D32]/50 hover:shadow-sm"
                    style={{ borderTop: `3.5px solid ${SUMMARY_PALETTE.green}` }}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs"
                        style={{
                          backgroundColor: `${SUMMARY_PALETTE.green}15`,
                          color: SUMMARY_PALETTE.green,
                          border: `1px solid ${SUMMARY_PALETTE.green}30`,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                          <span
                            className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                            style={{
                              backgroundColor: `${SUMMARY_PALETTE.green}12`,
                              color: SUMMARY_PALETTE.green,
                            }}
                          >
                            {item.indicator ? `${item.indicator} • ${category}` : category}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Area B Civic Advantages Column */}
          <div className="space-y-3.5">
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: SUMMARY_PALETTE.green }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-black text-white"
                style={{ backgroundColor: SUMMARY_PALETTE.green }}
              >
                B
              </span>
              <span>{areaBName} Civic Advantages</span>
            </div>
            <div className="grid gap-3">
              {profileB.keyStrengths.map((item, idx) => {
                const Icon = resolveInsightIcon(item.title)
                const category = item.category || getDomainCategoryTag(item.title)
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#4F7D32]/50 hover:shadow-sm"
                    style={{ borderTop: `3.5px solid ${SUMMARY_PALETTE.green}` }}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs"
                        style={{
                          backgroundColor: `${SUMMARY_PALETTE.green}15`,
                          color: SUMMARY_PALETTE.green,
                          border: `1px solid ${SUMMARY_PALETTE.green}30`,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                          <span
                            className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                            style={{
                              backgroundColor: `${SUMMARY_PALETTE.green}12`,
                              color: SUMMARY_PALETTE.green,
                            }}
                          >
                            {item.indicator ? `${item.indicator} • ${category}` : category}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CIVIC CONSTRAINTS & UNDERLYING REVIEW FACTORS (#F5B52E Amber & #FFD16A Yellow & #D9361E Red) ───────────────────── */}
      <div>
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg shadow-2xs"
            style={{ backgroundColor: `${SUMMARY_PALETTE.amber}25`, color: SUMMARY_PALETTE.amber }}
          >
            <AlertTriangle size={16} />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Civic Constraints & Underlying Review Factors
            </h3>
            <p className="text-xs text-slate-500">Root cause explanations for lower or constrained indicators</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Area A Constraints Column */}
          <div className="space-y-3.5">
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#b45309' }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-black text-white"
                style={{ backgroundColor: SUMMARY_PALETTE.amber }}
              >
                A
              </span>
              <span>{areaAName} Consideration Factors</span>
            </div>
            <div className="grid gap-3">
              {profileA.keyChallenges.map((item, idx) => {
                const Icon = resolveInsightIcon(item.title)
                const category = item.category || getDomainCategoryTag(item.title)
                const isCritical =
                  (item.score !== undefined && item.score < 40) ||
                  item.title.toLowerCase().includes('emission') ||
                  item.title.toLowerCase().includes('congestion') ||
                  item.title.toLowerCase().includes('traffic')
                const accentColor = isCritical ? SUMMARY_PALETTE.red : SUMMARY_PALETTE.amber
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#F5B52E]/60 hover:shadow-sm"
                    style={{ borderTop: `3.5px solid ${accentColor}` }}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs"
                        style={{
                          backgroundColor: `${SUMMARY_PALETTE.yellow}35`,
                          color: isCritical ? SUMMARY_PALETTE.red : '#b45309',
                          border: `1px solid ${accentColor}40`,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                          <span
                            className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                            style={{
                              backgroundColor: isCritical
                                ? `${SUMMARY_PALETTE.red}12`
                                : `${SUMMARY_PALETTE.yellow}40`,
                              color: isCritical ? SUMMARY_PALETTE.red : '#92400e',
                              border: `1px solid ${accentColor}30`,
                            }}
                          >
                            {item.indicator ? `${item.indicator} • ${category}` : category}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Area B Constraints Column */}
          <div className="space-y-3.5">
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#b45309' }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-black text-white"
                style={{ backgroundColor: SUMMARY_PALETTE.amber }}
              >
                B
              </span>
              <span>{areaBName} Consideration Factors</span>
            </div>
            <div className="grid gap-3">
              {profileB.keyChallenges.map((item, idx) => {
                const Icon = resolveInsightIcon(item.title)
                const category = item.category || getDomainCategoryTag(item.title)
                const isCritical =
                  (item.score !== undefined && item.score < 40) ||
                  item.title.toLowerCase().includes('emission') ||
                  item.title.toLowerCase().includes('congestion') ||
                  item.title.toLowerCase().includes('traffic')
                const accentColor = isCritical ? SUMMARY_PALETTE.red : SUMMARY_PALETTE.amber
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#F5B52E]/60 hover:shadow-sm"
                    style={{ borderTop: `3.5px solid ${accentColor}` }}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs"
                        style={{
                          backgroundColor: `${SUMMARY_PALETTE.yellow}35`,
                          color: isCritical ? SUMMARY_PALETTE.red : '#b45309',
                          border: `1px solid ${accentColor}40`,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                          <span
                            className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                            style={{
                              backgroundColor: isCritical
                                ? `${SUMMARY_PALETTE.red}12`
                                : `${SUMMARY_PALETTE.yellow}40`,
                              color: isCritical ? SUMMARY_PALETTE.red : '#92400e',
                              border: `1px solid ${accentColor}30`,
                            }}
                          >
                            {item.indicator ? `${item.indicator} • ${category}` : category}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. STRATEGIC URBAN SYNTHESIS (Clean Elevated Card) ────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-sm"
        style={{
          borderColor: `${SUMMARY_PALETTE.green}35`,
          background: `linear-gradient(135deg, rgba(255,255,255,0.98), ${SUMMARY_PALETTE.yellow}15, ${SUMMARY_PALETTE.green}08)`,
        }}
      >
        <div className="flex items-start gap-3.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs"
            style={{
              backgroundColor: `${SUMMARY_PALETTE.green}18`,
              color: SUMMARY_PALETTE.green,
              border: `1.5px solid ${SUMMARY_PALETTE.green}30`,
            }}
          >
            <Compass size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Functional Urban Synthesis
              </h4>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: `${SUMMARY_PALETTE.green}15`,
                  color: SUMMARY_PALETTE.green,
                }}
              >
                HOLISTIC VIEW
              </span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
              <strong className="font-bold text-slate-900">{areaAName}</strong> ({profileA.civicSummary}) and{' '}
              <strong className="font-bold text-slate-900">{areaBName}</strong> ({profileB.civicSummary}) fulfill distinct, complementary roles in Nashik’s broader urban fabric. Differences across indicators reflect specific zoning purposes, infrastructure age, and local geography rather than simple comparative superiority.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
