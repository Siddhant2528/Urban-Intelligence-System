import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Accessibility,
  BusFront,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge, ButtonLink, Card, SectionHeader, Select } from '../components/common'
import CityMapCard from '../components/city/CityMapCard'
import { demoData } from '../data/demoData'
import type { IndicatorCategory } from '../types/indicator'

interface ComparisonScoreBarProps {
  areaName: string
  indicatorName: string
  value: number | null
  color: string
}

function ComparisonScoreBar({ areaName, color, indicatorName, value }: ComparisonScoreBarProps) {
  const hasValue = value !== null && Number.isFinite(value)
  const safeValue = hasValue ? Math.min(Math.max(value, 0), 100) : 0

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
      <span className="truncate text-xs font-medium text-muted" title={areaName}>{areaName}</span>
      <span className="text-right text-sm font-semibold tabular-nums text-ink">
        {hasValue ? `${value} / 100` : 'No data'}
      </span>
      <div
        aria-label={`${areaName} ${indicatorName}${hasValue ? `: ${value} out of 100` : ': no data available'}`}
        aria-valuemax={hasValue ? 100 : undefined}
        aria-valuemin={hasValue ? 0 : undefined}
        aria-valuenow={hasValue ? safeValue : undefined}
        aria-valuetext={hasValue ? `${value} out of 100` : 'No data available'}
        className="col-span-2 h-2.5 overflow-hidden rounded-full bg-line"
        role={hasValue ? 'progressbar' : undefined}
      >
        {hasValue && (
          <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${safeValue}%`, backgroundColor: color }} />
        )}
      </div>
    </div>
  )
}

const indicatorIcons: Record<IndicatorCategory, LucideIcon> = {
  Environment: Leaf,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Safety: ShieldCheck,
  Transport: BusFront,
  Infrastructure: Landmark,
  Accessibility,
}

function CityOverviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery] = useState('')
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [areaAId, setAreaAId] = useState('')
  const [areaBId, setAreaBId] = useState('')

  useEffect(() => {
    const hash = location.hash

    if (!hash) {
      return
    }

    const target = document.getElementById(hash.slice(1))

    if (!target) {
      return
    }

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const visibleAreas = demoData.areas.filter((area) =>
    area.name.toLocaleLowerCase().includes(normalizedQuery),
  )
  const selectedArea = demoData.areas.find((area) => area.id === selectedAreaId)
  const areaA = demoData.areas.find((area) => area.id === areaAId)
  const areaB = demoData.areas.find((area) => area.id === areaBId)
  const areaAAnalysis = demoData.areaAnalysis.find((item) => item.areaId === areaAId)
  const areaBAnalysis = demoData.areaAnalysis.find((item) => item.areaId === areaBId)
  const areaAUIS = areaAAnalysis?.uisDemoValue ?? null
  const areaBUIS = areaBAnalysis?.uisDemoValue ?? null
  const areaAProfile = demoData.developmentProfiles.find((item) => item.areaId === areaAId)
  const areaBProfile = demoData.developmentProfiles.find((item) => item.areaId === areaBId)

  const getDemoValue = (areaId: string, indicatorId: string) =>
    demoData.areaIndicators.find(
      (item) => item.areaId === areaId && item.indicatorId === indicatorId,
    )?.demoValue ?? null

  const hasSelectedComparisonAreas = Boolean(areaAId && areaBId && areaAId !== areaBId)

  const comparisonRows = [
    {
      id: 'area-uis',
      label: 'Area UIS',
      areaAValue: areaAAnalysis?.uisDemoValue ?? null,
      areaBValue: areaBAnalysis?.uisDemoValue ?? null,
    },
    ...demoData.indicators.map((indicator) => ({
      id: indicator.id,
      label: indicator.category,
      areaAValue: getDemoValue(areaAId, indicator.id),
      areaBValue: getDemoValue(areaBId, indicator.id),
    })),
  ]
  const indicatorRows = comparisonRows.filter((row) => row.id !== 'area-uis')
  const pairedIndicatorRows = indicatorRows.filter(
    (row) => Number.isFinite(row.areaAValue) && Number.isFinite(row.areaBValue),
  )
  const areaAWins = pairedIndicatorRows.filter((row) => row.areaAValue! > row.areaBValue!)
  const areaBWins = pairedIndicatorRows.filter((row) => row.areaBValue! > row.areaAValue!)
  const tiedIndicators = pairedIndicatorRows.filter((row) => row.areaAValue === row.areaBValue)
  const missingIndicators = indicatorRows.filter(
    (row) => !Number.isFinite(row.areaAValue) || !Number.isFinite(row.areaBValue),
  )
  const biggestDifference = [...pairedIndicatorRows].sort(
    (left, right) => Math.abs(right.areaAValue! - right.areaBValue!) - Math.abs(left.areaAValue! - left.areaBValue!),
  )[0]
  const lowestScores = (areaValueKey: 'areaAValue' | 'areaBValue') => {
    const availableRows = indicatorRows.filter((row) => Number.isFinite(row[areaValueKey]))
    if (availableRows.length === 0) return []
    const lowestValue = Math.min(...availableRows.map((row) => row[areaValueKey]!))
    return availableRows.filter((row) => row[areaValueKey] === lowestValue)
  }
  const areaALowest = lowestScores('areaAValue')
  const areaBLowest = lowestScores('areaBValue')
  const formatIndicatorNames = (rows: typeof indicatorRows) => {
    const names = rows.map((row) => row.label)
    if (names.length < 2) return names[0] ?? ''
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
  const formatStrengthDetails = (
    rows: typeof indicatorRows,
    ownKey: 'areaAValue' | 'areaBValue',
    otherKey: 'areaAValue' | 'areaBValue',
  ) => rows.map((row) => `${row.label}: +${Math.abs(row[ownKey]! - row[otherKey]!)} points (${row[ownKey]} vs ${row[otherKey]})`)
  const formatDevelopmentContext = (
    profile: typeof areaAProfile,
    analysis: typeof areaAAnalysis,
  ) => {
    const topStrength = demoData.indicators.find(
      (indicator) => indicator.id === analysis?.topStrengthIndicatorId,
    )?.category
    const areaToImprove = demoData.indicators.find(
      (indicator) => indicator.id === analysis?.areaToImproveIndicatorId,
    )?.category
    const details = [
      profile?.demoLabel ? `demo profile: "${profile.demoLabel}"` : null,
      topStrength && areaToImprove
        ? `demo analysis lists ${topStrength} as a top strength and ${areaToImprove} as an area to improve`
        : topStrength
          ? `demo analysis lists ${topStrength} as a top strength`
          : areaToImprove
            ? `demo analysis lists ${areaToImprove} as an area to improve`
            : null,
    ].filter(Boolean)
    return details.length ? details.join('; ') : 'no demo development profile or analysis is available'
  }
  const areaADevelopmentContext = formatDevelopmentContext(areaAProfile, areaAAnalysis)
  const areaBDevelopmentContext = formatDevelopmentContext(areaBProfile, areaBAnalysis)
  const indicatorConclusion = pairedIndicatorRows.length === 0
    ? `${areaA?.name ?? 'Area A'} has ${areaADevelopmentContext}; ${areaB?.name ?? 'Area B'} has ${areaBDevelopmentContext}. There are no shared indicator scores to compare, so the available demo information does not support a relative performance conclusion.`
    : areaAWins.length === 0 && areaBWins.length === 0
      ? `${areaA?.name ?? 'Area A'} has ${areaADevelopmentContext}; ${areaB?.name ?? 'Area B'} has ${areaBDevelopmentContext}. Their scores are equal across all ${tiedIndicators.length} comparable indicators, so these demo signals do not indicate an overall better-developed area.`
      : areaAWins.length === areaBWins.length
        ? `Development context: ${areaA?.name ?? 'Area A'} has ${areaADevelopmentContext}; ${areaB?.name ?? 'Area B'} has ${areaBDevelopmentContext}. The indicator results are mixed, with each area leading in ${areaAWins.length} comparable indicators. Taken together, these demo signals show different strengths, not an overall ranking.`
        : `Development context: ${areaA?.name ?? 'Area A'} has ${areaADevelopmentContext}; ${areaB?.name ?? 'Area B'} has ${areaBDevelopmentContext}. ${areaAWins.length > areaBWins.length ? areaA?.name ?? 'Area A' : areaB?.name ?? 'Area B'} leads in more comparable indicator scores (${Math.max(areaAWins.length, areaBWins.length)} versus ${Math.min(areaAWins.length, areaBWins.length)}), while the other area still has relative strengths in its leading indicators. These demonstration profiles and scores do not establish that either area is universally better developed.`
  const areaUISComparison = typeof areaAUIS === 'number' && Number.isFinite(areaAUIS) &&
    typeof areaBUIS === 'number' && Number.isFinite(areaBUIS)
    ? areaAUIS === areaBUIS
      ? `The supplied Area UIS scores are tied at ${areaAUIS.toFixed(1)}.`
      : `${areaAUIS > areaBUIS ? areaA?.name ?? 'Area A' : areaB?.name ?? 'Area B'} has the higher supplied Area UIS (${areaAUIS.toFixed(1)} vs ${areaBUIS.toFixed(1)}), a difference of ${Math.abs(areaAUIS - areaBUIS).toFixed(1)} points.`
    : `Area UIS comparison is unavailable for ${[
        areaAUIS === null ? areaA?.name ?? 'Area A' : null,
        areaBUIS === null ? areaB?.name ?? 'Area B' : null,
      ].filter(Boolean).join(' and ')}.`
  const balancedConclusion = `${indicatorConclusion} ${areaUISComparison} The UIS calculation method is not documented in this prototype, so consider this supplied demo score alongside the individual indicator results.`
  const unavailableData = missingIndicators.map((row) => {
    const unavailableAreas = [
      row.areaAValue === null ? areaA?.name ?? 'Area A' : null,
      row.areaBValue === null ? areaB?.name ?? 'Area B' : null,
    ].filter(Boolean)
    return `${row.label}: no score for ${unavailableAreas.join(' and ')}`
  })

  return (
    <div className="mx-auto w-full max-w-7xl px-page py-10 sm:py-12">
      <section aria-labelledby="city-heading" className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          id="city-heading"
          level={1}
          title={demoData.cityOverview.name}
          description="City Overview"
        />
        <Card
          className="w-full transition-[border-color,box-shadow] duration-150 hover:border-brand/40 hover:shadow-raised sm:w-64"
          padding="compact"
          title="Demonstration City UIS value out of 100"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">City UIS</p>
            <Badge tone="warning">DEMO DATA</Badge>
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">
            {demoData.cityOverview.uisDemoValue.toFixed(1)}
            <span className="ml-1 text-base font-medium text-muted">
              / {demoData.cityOverview.uisScale}
            </span>
          </p>
        </Card>
      </section>

      <section aria-labelledby="indicators-heading" className="mt-12">
        <SectionHeader
          id="indicators-heading"
          level={2}
          title="Indicator overview"
          description="Explore the city through the seven approved indicator categories."
        />
        <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {demoData.indicators.map(({ category, id }) => {
            const Icon = indicatorIcons[category]

            return (
              <Card
                className="flex min-h-20 items-center gap-3 p-4 transition-[border-color,background-color] duration-150 hover:border-brand/40 hover:bg-brand-soft/20"
                key={id}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <h3 className="text-sm font-semibold leading-5 text-ink">{category}</h3>
              </Card>
            )
          })}
        </div>
      </section>

      <section aria-label="City map preview" className="mt-12">
        <CityMapCard />
      </section>

      <section aria-labelledby="areas-heading" className="mt-12">
        <SectionHeader
          id="areas-heading"
          level={2}
          title="Explore city areas"
          description="Click a demo area to open its analysis."
        />
        <Card className="relative isolate mt-6 overflow-hidden" id="city-area-visualization" padding="none">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-70"
            style={{
              backgroundImage: 'radial-gradient(#c8d8ce 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold text-ink">City area visualization</h3>
              <Badge>Illustrative demo</Badge>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Map-style demo visualization only. Markers are not real locations and do not show area boundaries.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visibleAreas.map((area) => {
                const isSelected = area.id === selectedAreaId

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`flex h-24 w-full items-center gap-2 rounded-control border px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isSelected ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface/90 text-ink hover:border-brand/50'}`}
                    key={area.id}
                    onClick={() => {
                      setSelectedAreaId(area.id)
                      navigate(`/area/${area.id}`)
                    }}
                    type="button"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white">
                      <MapPin aria-hidden="true" size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{area.name}</span>
                    </span>
                  </button>
                )
              })}
              {visibleAreas.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-muted">
                  No demo areas match that search.
                </p>
              )}
            </div>
          </div>
        </Card>

        {selectedArea && (
          <Card className="mt-6 overflow-hidden p-0" padding="none">
            <div className="relative h-[28rem] overflow-hidden bg-[#dfe3dc]">
              <div className="absolute inset-0 opacity-70" style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.45) 0, rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.45) 0, rgba(255,255,255,0.45) 1px, transparent 1px)',
                backgroundSize: '90px 90px',
              }} />
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/70" />
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/70" />
              <div className="absolute left-[10%] top-[6%] h-[72%] w-[72%] rounded-none border-[3px] border-dashed border-[#d83c3c] bg-transparent" />
              <div className="absolute left-[18%] top-[18%] h-[58%] w-[58%] rotate-12 border-[3px] border-dashed border-[#d83c3c] bg-transparent" />
              <div className="absolute left-[52%] top-[20%] h-[56%] w-[1px] -translate-x-1/2 bg-[#d83c3c]/80" />
              <div className="absolute left-[18%] top-[48%] h-[1px] w-[64%] bg-[#d83c3c]/80" />
              <div className="absolute left-[20%] top-[18%] flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm">
                <span className="grid size-6 place-items-center rounded-full bg-[#f5d3dc] text-[#b54268]">
                  <MapPin aria-hidden="true" size={14} />
                </span>
                <span className="text-sm font-semibold text-ink">{selectedArea.name}</span>
              </div>
              <div className="absolute left-[52%] top-[52%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[clamp(2.2rem,4vw,4rem)] font-semibold tracking-tight text-ink/85">
                {selectedArea.name}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Selected area</p>
                <p className="mt-1 text-lg font-semibold text-ink">{selectedArea.name}</p>
              </div>
              <ButtonLink to={`/area/${selectedArea.id}`}>
                Open Area Analysis
              </ButtonLink>
            </div>
          </Card>
        )}
      </section>

      <section aria-labelledby="city-compare-heading" className="mt-12">
        <SectionHeader
          id="city-compare-heading"
          level={2}
          title="Compare city areas"
          description="Select two demo areas and compare their UIS and indicator performance side by side."
        />

        <Card className="mt-6 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Area A" onChange={(event) => setAreaAId(event.target.value)} value={areaAId}>
              <option value="">Choose an area</option>
              {demoData.areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </Select>
            <Select label="Area B" onChange={(event) => setAreaBId(event.target.value)} value={areaBId}>
              <option value="">Choose an area</option>
              {demoData.areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </Select>
          </div>
        </Card>

        {!hasSelectedComparisonAreas ? (
          <div className="mt-6 rounded-card border border-dashed border-line bg-canvas/60 px-4 py-10 text-center text-sm text-muted">
            Select two different demo areas to view their city comparison analysis.
          </div>
        ) : (
          <>
            <section aria-labelledby="comparison-summary-title" className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-ink" id="comparison-summary-title">Comparison Summary</h3>
                  <p className="mt-1 text-sm text-muted">Generated from the selected areas’ available demonstration indicator scores.</p>
                </div>
                <Badge tone="warning">DEMO DATA</Badge>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Card>
                  <h4 className="text-base font-semibold text-ink">Relative strengths of {areaA?.name ?? 'Area A'}</h4>
                  <p className="mt-2 text-xs leading-5 text-muted">Development context (demo): {areaADevelopmentContext}.</p>
                  {areaAWins.length ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-muted">{formatIndicatorNames(areaAWins)} have higher scores in this example.</p>
                      <p className="mt-2 text-xs leading-5 text-muted">Score differences: {formatStrengthDetails(areaAWins, 'areaAValue', 'areaBValue').join('; ')}.</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted">No available indicator score is higher than {areaB?.name ?? 'Area B'}’s.</p>
                  )}
                </Card>
                <Card>
                  <h4 className="text-base font-semibold text-ink">Relative strengths of {areaB?.name ?? 'Area B'}</h4>
                  <p className="mt-2 text-xs leading-5 text-muted">Development context (demo): {areaBDevelopmentContext}.</p>
                  {areaBWins.length ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-muted">{formatIndicatorNames(areaBWins)} have higher scores in this example.</p>
                      <p className="mt-2 text-xs leading-5 text-muted">Score differences: {formatStrengthDetails(areaBWins, 'areaBValue', 'areaAValue').join('; ')}.</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted">No available indicator score is higher than {areaA?.name ?? 'Area A'}’s.</p>
                  )}
                </Card>
                <Card className="md:col-span-2">
                  <h4 className="text-base font-semibold text-ink">Main differences and possible review opportunities</h4>
                  {pairedIndicatorRows.length ? (
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {areaA?.name ?? 'Area A'} has higher scores in {areaAWins.length} of {pairedIndicatorRows.length} comparable indicators; {areaB?.name ?? 'Area B'} has higher scores in {areaBWins.length}; {tiedIndicators.length} are tied.
                      {biggestDifference && biggestDifference.areaAValue !== biggestDifference.areaBValue && (
                        <> The largest gap is {biggestDifference.label}: {areaA?.name ?? 'Area A'} scores {biggestDifference.areaAValue}, {areaB?.name ?? 'Area B'} scores {biggestDifference.areaBValue}, a difference of {Math.abs(biggestDifference.areaAValue! - biggestDifference.areaBValue!)} points.</>
                      )}
                      {' '}These indicator-specific differences do not establish that either area is universally better.
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted">There are no indicators with scores available for both selected areas, so relative differences cannot be determined.</p>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="rounded-control bg-canvas p-3 text-sm leading-6 text-muted">
                      {areaA?.name ?? 'Area A'}: {areaALowest.length
                        ? `lowest available indicator score is ${areaALowest.map((row) => `${row.label} (${row.areaAValue}/100)`).join(', ')}; this is a relative review opportunity, not a threshold-based finding.`
                        : 'no indicator scores are available to identify a relative review opportunity.'}
                    </p>
                    <p className="rounded-control bg-canvas p-3 text-sm leading-6 text-muted">
                      {areaB?.name ?? 'Area B'}: {areaBLowest.length
                        ? `lowest available indicator score is ${areaBLowest.map((row) => `${row.label} (${row.areaBValue}/100)`).join(', ')}; this is a relative review opportunity, not a threshold-based finding.`
                        : 'no indicator scores are available to identify a relative review opportunity.'}
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted">
                    {unavailableData.length
                      ? `Missing data: ${unavailableData.join('; ')}. Missing scores are not treated as zero. `
                      : 'No indicator scores are missing for these selected areas. '}
                    No documented indicator-specific improvement threshold is configured; opportunities are described only relative to each area’s available scores.
                  </p>
                  <div className="mt-4 border-t border-line pt-4">
                    <h5 className="text-sm font-semibold text-ink">Balanced conclusion</h5>
                    <p className="mt-2 text-sm leading-6 text-muted">{balancedConclusion}</p>
                  </div>
                </Card>
              </div>
            </section>

            <section aria-labelledby="paired-scores-title" className="mt-8">
              <SectionHeader
                id="paired-scores-title"
                level={3}
                title="Paired area scores"
                description="Compare the selected areas on the same 0–100 scale."
              />
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
                {comparisonRows.map((row) => (
                  <article className="px-4 py-4 sm:px-5" key={row.id}>
                    <h4 className="text-sm font-semibold text-ink">{row.label}</h4>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:gap-6">
                      <ComparisonScoreBar
                        areaName={areaA?.name ?? 'Area A'}
                        color="#176b53"
                        indicatorName={row.label}
                        value={row.areaAValue}
                      />
                      <ComparisonScoreBar
                        areaName={areaB?.name ?? 'Area B'}
                        color="#c58b35"
                        indicatorName={row.label}
                        value={row.areaBValue}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  )
}

export default CityOverviewPage