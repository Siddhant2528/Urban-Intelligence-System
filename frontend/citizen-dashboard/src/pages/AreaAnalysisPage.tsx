import { useState } from 'react'
import {
  ArrowLeft,
  BusFront,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  Target,
  TrainFront,
  TrendingUp,
  TreePine,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { AreaLocationMap } from '../components/area/AreaLocationMap'
import { AreaFacilitiesMap, CATEGORY_ICONS, CATEGORY_COLORS } from '../components/area/AreaFacilitiesMap'
import { AreaUisHeroCard } from '../components/area/AreaUisHeroCard'
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  SectionHeader,
} from '../components/common'
import { demoData } from '../data/demoData'
import { facilityCategories, type FacilityCategory } from '../types/facility'
import {
  classifyDevelopmentProfile,
  developmentIndicatorIds,
} from '../utils/developmentProfileClassification'

function AreaAnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const [activeFacilityCategory, setActiveFacilityCategory] = useState<FacilityCategory | 'all'>('all')
  const area = demoData.areas.find((demoArea) => demoArea.id === id)
  const analysis = demoData.areaAnalysis.find((demoAnalysis) => demoAnalysis.areaId === id)

  if (!area || !analysis) {
    return (
      <div className="mx-auto w-full max-w-5xl px-page py-12">
        <ButtonLink leadingIcon={<ArrowLeft aria-hidden="true" size={18} />} to="/city" variant="ghost">
          Back to City
        </ButtonLink>
        <div className="mt-8 rounded-card border border-line bg-surface shadow-card">
          <EmptyState
            title="Area not found"
            description="Choose an area from the city overview to view its demonstration analysis."
          />
        </div>
      </div>
    )
  }

  const indicatorPerformance = demoData.indicators.map((indicator) => ({
    indicator,
    performance: demoData.areaIndicators.find(
      (item) => item.areaId === area.id && item.indicatorId === indicator.id,
    ),
  }))
  const developmentScores = Object.fromEntries(
    developmentIndicatorIds.map((indicatorId) => [
      indicatorId,
      demoData.areaIndicators.find(
        (item) => item.areaId === area.id && item.indicatorId === indicatorId,
      )?.demoValue ?? null,
    ]),
  )
  const developmentClassification = classifyDevelopmentProfile(developmentScores)
  const developmentProfileExplanation = (() => {
    switch (developmentClassification.profileName) {
      case 'Insufficient Data for Classification': {
        const unavailable = developmentClassification.indicators
          .filter((indicator) => indicator.score === null)
          .map((indicator) => indicator.label)
        return `A profile is unavailable because scores are missing or invalid for ${unavailable.join(', ')}.`
      }
      case 'Emerging Urban Area':
        return 'Most available indicator scores are in the Weak band.'
      case 'Infrastructure-Developing Area':
        return 'Infrastructure and Transport are both in the Weak band.'
      case 'Environmentally Stressed Urban Area':
        return 'Environment is in the Weak band, while most other indicators are Moderate or Strong.'
      case 'Well-Developed Urban Area':
        return 'Most indicators are Strong, and none are in the Weak band.'
      case 'Developing Urban Area':
        return 'Scores are mixed or mostly Moderate, so individual indicators may be worth a closer look.'
    }
  })()
  const getIndicatorRankDescription = (score: number, rankDirection: 'highest' | 'lowest') => {
    const rank = 1 + scoredIndicators.filter(({ value }) =>
      rankDirection === 'highest' ? value > score : value < score,
    ).length
    if (rank === 1) return rankDirection === 'highest' ? 'the highest' : 'the lowest'
    if (rank === 2) return rankDirection === 'highest' ? 'the second-highest' : 'the second-lowest'
    return rankDirection === 'highest' ? `ranked ${rank}th highest` : `ranked ${rank}th lowest`
  }
  const scoredIndicators = indicatorPerformance.flatMap(({ indicator, performance }) =>
    typeof performance?.demoValue === 'number' &&
    Number.isFinite(performance.demoValue) &&
    performance.demoValue >= 0 &&
    performance.demoValue <= 100
      ? [{ indicator, value: performance.demoValue }]
      : [],
  )
  const areaHighlights = [...scoredIndicators].sort((a, b) => b.value - a.value).slice(0, 2)
  const areasToExplore = [...scoredIndicators].sort((a, b) => a.value - b.value).slice(0, 2)
  const areaFacilities = demoData.facilities.filter((facility) => facility.areaId === area.id)
  const filteredAreaFacilities = areaFacilities.filter(
    (facility) => activeFacilityCategory === 'all' || facility.category === activeFacilityCategory,
  )
  const availableFacilityCategories = facilityCategories.filter((category) =>
    areaFacilities.some((facility) => facility.category === category),
  )

  // Dynamically calculate counts according to mapped facilities data
  const facilityAccessCards = [
    { category: 'Hospitals', Icon: HeartPulse },
    { category: 'Schools', Icon: GraduationCap },
    { category: 'Police Stations', Icon: ShieldCheck },
    { category: 'Bus Stops', Icon: BusFront },
    { category: 'Railway Stations', Icon: TrainFront },
    { category: 'Parks', Icon: TreePine },
  ].map((facility) => ({
    ...facility,
    demoCount: areaFacilities.filter((item) => item.category === facility.category).length,
  }))
  const visibleFacilityAccessCards = facilityAccessCards.filter(
    (facility) => facility.demoCount > 0 && (activeFacilityCategory === 'all' || facility.category === activeFacilityCategory),
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-page py-8 sm:py-10">
      <ButtonLink leadingIcon={<ArrowLeft aria-hidden="true" size={18} />} to="/city" variant="ghost">
        Back to City
      </ButtonLink>

      <section aria-labelledby="area-title" className="mt-6">
        <SectionHeader id="area-title" level={1} title={area.name} description="Area Analysis" />
      </section>

      {/* 1. Area Location Showcase Map (Location Only) */}
      <section aria-label={`${area.name} location map`} className="mt-8">
        <AreaLocationMap
          areaId={area.id}
          areaName={area.name}
        />
      </section>

      {/* 2. Standout Area UIS Spotlight */}
      <section aria-labelledby="area-summary-title" className="mt-10 space-y-4">
        <SectionHeader id="area-summary-title" level={2} title="Area Summary & UIS Benchmark" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
          <AreaUisHeroCard
            areaName={area.name}
            uisScore={analysis.uisDemoValue}
            scale={analysis.uisScale}
          />
          <Card className="flex flex-col justify-between border-line">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">CLASSIFIED PROFILE</p>
              <h3 className="mt-2 text-lg font-bold text-ink">{developmentClassification.profileName}</h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-6 text-muted">{developmentProfileExplanation}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-line/60">
              <span className="text-[11px] text-muted">
                Profile category determined from 7 indicator distribution bands.
              </span>
            </div>
          </Card>
        </div>
      </section>

      <section aria-label="Indicator highlights and areas to explore" className="mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2">
              <TrendingUp aria-hidden="true" className="text-success" size={20} />
              <h2 className="text-lg font-semibold text-ink">What stands out in this area?</h2>
            </div>
            {areaHighlights.length ? (
              <div className="mt-4 space-y-4">
                {areaHighlights.map(({ indicator, value }) => (
                  <div key={indicator.id}>
                    <h3 className="text-sm font-semibold text-ink">{indicator.category} shows a {value >= 70 ? 'strong' : 'relative'} score</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {indicator.category} scores {value}%, {getIndicatorRankDescription(value, 'highest')} among the seven indicators.
                    </p>
                  </div>
                ))}
                <p className="border-t border-line pt-3 text-xs leading-5 text-muted">These relative scores do not confirm service quality.</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Indicator scores are unavailable.</p>
            )}
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <Target aria-hidden="true" className="text-warning" size={20} />
              <h2 className="text-lg font-semibold text-ink">What could be improved?</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted">Lower relative scores suggest areas for review; they do not identify the cause.</p>
            {areasToExplore.length ? (
              <div className="mt-4 space-y-4">
                {areasToExplore.map(({ indicator, value }) => (
                  <div key={indicator.id}>
                    <h3 className="text-sm font-semibold text-ink">{indicator.category} needs closer assessment</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {indicator.category} scores {value}%, {getIndicatorRankDescription(value, 'lowest')} among the seven indicators.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Indicator scores are unavailable.</p>
            )}
          </Card>
        </div>
      </section>

      <section aria-labelledby="indicator-performance-title" className="mt-12">
        <SectionHeader
          id="indicator-performance-title"
          level={2}
          title="Indicator Performance"
          description="All seven scores are shown. Open an indicator for its available explanation and reference."
        />
        <div className="mt-5 divide-y divide-line rounded-card border border-line bg-surface shadow-card">
          {indicatorPerformance.map(({ indicator }) => {
              const classifiedIndicator = developmentClassification.indicators.find(
                (item) => item.id === indicator.id,
              )
              const band = classifiedIndicator?.band
              const badgeTone = band === 'Strong'
                ? 'success'
                : band === 'Moderate'
                  ? 'warning'
                  : band === 'Weak'
                    ? 'danger'
                    : 'neutral'
              return (
                <div className="px-4 py-3 sm:px-5" key={indicator.id}>
                  <div className="flex min-h-10 items-center gap-2 sm:gap-4">
                    <span className="min-w-0 flex-1 text-sm font-medium text-ink">{indicator.category}</span>
                    <Badge className="shrink-0" tone={badgeTone}>{band ?? 'No score'}</Badge>
                    <span className="w-20 text-right text-sm font-semibold tabular-nums text-ink">
                      {classifiedIndicator?.score === null || classifiedIndicator?.score === undefined
                        ? 'Not available'
                        : `${classifiedIndicator.score} / 100`}
                    </span>
                  </div>
                </div>
              )
          })}
        </div>
      </section>

      {/* 2. Facilities Overview Section */}
      <section aria-labelledby="facilities-title" className="mt-12">
        <SectionHeader
          id="facilities-title"
          level={2}
          title="Facilities Overview"
          description="Calculated category counts and interactive map showcasing all facilities in this area."
        />
        <div className="mt-6 space-y-6">
          {/* Facility Summary Cards (Calculated from Data) */}
          <div aria-label={`${area.name} facility counts`} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFacilityAccessCards.map(({ category, Icon, demoCount }) => (
              <Card
                className={`flex items-center gap-3 border-line p-3.5 cursor-pointer transition-all ${
                  activeFacilityCategory === category ? 'ring-2 ring-brand border-transparent bg-brand-soft/20 shadow-sm' : 'hover:border-slate-300'
                }`}
                key={category}
                onClick={() => setActiveFacilityCategory(activeFacilityCategory === category ? 'all' : category as FacilityCategory)}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{category}</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-ink">
                    {demoCount}
                  </p>
                  <p className="text-xs text-muted">Facilities plotted in {area.name}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Interactive Facilities Map Card (All Facilities Visible & Filterable) */}
          <AreaFacilitiesMap
            areaId={area.id}
            areaName={area.name}
            facilities={areaFacilities}
            activeCategory={activeFacilityCategory}
            onCategoryChange={setActiveFacilityCategory}
          />

          {/* Category Filter Pills */}
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Filter by category</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                aria-pressed={activeFacilityCategory === 'all'}
                className={`min-h-9 rounded-control border px-3.5 text-xs font-semibold transition-all ${
                  activeFacilityCategory === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-line bg-surface text-muted hover:text-ink'
                }`}
                onClick={() => setActiveFacilityCategory('all')}
                type="button"
              >
                All categories ({areaFacilities.length})
              </button>
              {availableFacilityCategories.map((category) => {
                const count = areaFacilities.filter((f) => f.category === category).length
                const isSelected = activeFacilityCategory === category
                const color = CATEGORY_COLORS[category]
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`min-h-9 flex items-center gap-1.5 rounded-control border px-3.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'text-white shadow-sm'
                        : 'border-line bg-surface text-muted hover:text-ink'
                    }`}
                    style={{
                      backgroundColor: isSelected ? color : undefined,
                      borderColor: isSelected ? color : undefined,
                    }}
                    key={category}
                    onClick={() => setActiveFacilityCategory(category)}
                    type="button"
                  >
                    <span>{CATEGORY_ICONS[category]}</span>
                    <span>{category}</span>
                    <span className={isSelected ? 'text-white/80' : 'text-slate-400'}>({count})</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* Mapped Facilities Detailed List */}
          <div>
            <Card className="overflow-hidden" padding="none">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-slate-50/50 px-4 py-3 sm:px-6">
                <div>
                  <h3 className="text-sm font-bold text-ink">Mapped Facilities in {area.name}</h3>
                  <p className="text-xs text-muted">Showing {filteredAreaFacilities.length} facilities corresponding to the map above</p>
                </div>
                <Badge className="bg-slate-100 text-slate-700 font-semibold text-xs">
                  {filteredAreaFacilities.length} {activeFacilityCategory === 'all' ? 'Total' : activeFacilityCategory}
                </Badge>
              </div>
              <div className="divide-y divide-line max-h-96 overflow-y-auto p-2">
                {filteredAreaFacilities.map((facility) => {
                  const color = CATEGORY_COLORS[facility.category] || '#64748b'
                  const icon = CATEGORY_ICONS[facility.category] || '📍'
                  return (
                    <div
                      key={facility.id}
                      className="flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-xs"
                          style={{
                            background: `${color}15`,
                            border: `1.5px solid ${color}40`,
                          }}
                        >
                          {icon}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-ink">{facility.name}</p>
                          <p className="text-xs text-muted">{facility.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                          }}
                        >
                          {facility.category}
                        </span>
                        {facility.coordinates && (
                          <p className="mt-1 text-[11px] text-muted tabular-nums">
                            GPS: {facility.coordinates.lat.toFixed(4)}, {facility.coordinates.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section aria-labelledby="data-sources-title" className="mt-12">
        <SectionHeader id="data-sources-title" level={2} title="Data & Sources" />
        <Card className="mt-4">
          <p className="text-sm leading-6 text-muted">
            Scores, facility totals, and map visuals on this page are illustrative demo data, not verified real-world information.
          </p>
        </Card>
      </section>
    </div>
  )
}

export default AreaAnalysisPage