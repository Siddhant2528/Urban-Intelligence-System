import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BusFront,
  GraduationCap,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Target,
  TrainFront,
  TrendingUp,
  TreePine,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import cidcoMap from '../assets/images/Maps/CIDCO.png'
import deolaliMap from '../assets/images/Maps/Deolali.png'
import dwarkaMap from '../assets/images/Maps/Dwarka.png'
import gangapurMap from '../assets/images/Maps/Gangapur.png'
import panchavatiMap from '../assets/images/Maps/Panchavati.png'
import satpurMap from '../assets/images/Maps/Satpur.png'
import googleMapsPin from '../assets/images/google-maps.png'
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  SectionHeader,
} from '../components/common'
import { demoData } from '../data/demoData'
import { facilityCategories, type Facility, type FacilityCategory } from '../types/facility'
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
  const areaMapImages: Record<string, string> = {
    cidco: cidcoMap,
    panchavati: panchavatiMap,
    satpur: satpurMap,
    gangapur: gangapurMap,
    dwarka: dwarkaMap,
    deolali: deolaliMap,
  }
  const areaMapImage = areaMapImages[area.id] ?? cidcoMap
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  useEffect(() => {
    setSelectedFacilityId(null)
  }, [area.id, activeFacilityCategory])
  const areaFacilities = demoData.facilities.filter((facility) => facility.areaId === area.id)
  const filteredAreaFacilities = areaFacilities.filter(
    (facility) => activeFacilityCategory === 'all' || facility.category === activeFacilityCategory,
  )
  const mappedFacilityMarkers = filteredAreaFacilities.filter(
    (facility) =>
      typeof facility.coordinates?.lat === 'number' &&
      typeof facility.coordinates?.lng === 'number' &&
      Number.isFinite(facility.coordinates.lat) &&
      Number.isFinite(facility.coordinates.lng),
  )
  const selectedFacility =
    mappedFacilityMarkers.find((facility) => facility.id === selectedFacilityId) ?? null
  const markerBounds = mappedFacilityMarkers.reduce(
    (bounds, facility) => {
      const lat = facility.coordinates?.lat ?? 0
      const lng = facility.coordinates?.lng ?? 0

      return {
        minLat: Math.min(bounds.minLat, lat),
        maxLat: Math.max(bounds.maxLat, lat),
        minLng: Math.min(bounds.minLng, lng),
        maxLng: Math.max(bounds.maxLng, lng),
      }
    },
    { minLat: Number.POSITIVE_INFINITY, maxLat: Number.NEGATIVE_INFINITY, minLng: Number.POSITIVE_INFINITY, maxLng: Number.NEGATIVE_INFINITY },
  )
  const markerPosition = (facility: Facility) => {
    const lat = facility.coordinates?.lat ?? 0
    const lng = facility.coordinates?.lng ?? 0
    const latRange = markerBounds.maxLat - markerBounds.minLat || 1
    const lngRange = markerBounds.maxLng - markerBounds.minLng || 1

    return {
      left: 7 + ((lng - markerBounds.minLng) / lngRange) * 86,
      top: 7 + ((markerBounds.maxLat - lat) / latRange) * 86,
    }
  }
  const selectedFacilityPosition = selectedFacility ? markerPosition(selectedFacility) : null
  const availableFacilityCategories = facilityCategories.filter((category) =>
    areaFacilities.some((facility) => facility.category === category),
  )
  const facilityAccessCards = [
    { category: 'Hospitals', Icon: HeartPulse },
    { category: 'Schools', Icon: GraduationCap },
    { category: 'Police Stations', Icon: ShieldCheck },
    { category: 'Bus Stops', Icon: BusFront },
    { category: 'Railway Stations', Icon: TrainFront },
    { category: 'Parks', Icon: TreePine },
  ].map((facility) => ({
    ...facility,
    demoCount: areaFacilities.find((item) => item.category === facility.category)?.demoCount ?? null,
  }))
  const visibleFacilityAccessCards = facilityAccessCards.filter(
    (facility) => activeFacilityCategory === 'all' || facility.category === activeFacilityCategory,
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-page py-8 sm:py-10">
      <ButtonLink leadingIcon={<ArrowLeft aria-hidden="true" size={18} />} to="/city" variant="ghost">
        Back to City
      </ButtonLink>

      <section aria-labelledby="area-title" className="mt-6">
        <SectionHeader id="area-title" level={1} title={area.name} description="Area Analysis" />
      </section>

      <section aria-label={`${area.name} map`} className="mt-8">
        <Card className="overflow-hidden p-0" padding="none">
          <div className="relative h-[22rem] w-full overflow-hidden bg-[#dfe3dc] sm:h-[24rem]">
            <img
              alt={`${area.name} demo map`}
              className="h-full w-full object-cover"
              src={areaMapImage}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/40 via-black/10 to-transparent px-4 py-3 text-white sm:px-5">
              <div className="flex items-center gap-2">
                <MapPin aria-hidden="true" size={18} />
                <span className="text-sm font-semibold">{area.name}</span>
              </div>
              <Badge tone="warning">DEMO MAP</Badge>
            </div>
          </div>
        </Card>
      </section>

      <section aria-labelledby="area-summary-title" className="mt-10">
        <SectionHeader id="area-summary-title" level={2} title="Area Summary" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)]">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted">Area UIS</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">
                  {analysis.uisDemoValue.toFixed(1)}<span className="ml-1 text-base font-medium text-muted">/ {analysis.uisScale}</span>
                </p>
              </div>
              <Badge tone="warning">DEMO</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              This is the existing overall demo score. Its calculation method is not documented in this prototype, so it is shown as provided and is not recalculated from the indicators.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-muted">Development profile</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{developmentClassification.profileName}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{developmentProfileExplanation}</p>
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

      <section aria-labelledby="facilities-title" className="mt-12">
        <SectionHeader
          id="facilities-title"
          level={2}
          title="Facilities Overview"
          description="Category counts are illustrative demo values, not verified totals or proof of access or coverage."
        />
        <div className="mt-4 grid gap-5">
            <div aria-label={`${area.name} demo facility counts`} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFacilityAccessCards.map(({ category, Icon, demoCount }) => (
                <Card className="flex items-center gap-3 border-line p-3" key={category}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{category}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-ink">
                      {demoCount ?? 'No demo count'}
                    </p>
                    <p className="text-xs text-muted">Illustrative total in {area.name}</p>
                  </div>
                </Card>
              ))}
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Facility category</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  aria-pressed={activeFacilityCategory === 'all'}
                  className={`min-h-9 rounded-control border px-3 text-sm font-medium ${activeFacilityCategory === 'all' ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:text-ink'}`}
                  onClick={() => setActiveFacilityCategory('all')}
                  type="button"
                >
                  All categories
                </button>
                {availableFacilityCategories.map((category) => (
                  <button
                    aria-pressed={activeFacilityCategory === category}
                    className={`min-h-9 rounded-control border px-3 text-sm font-medium ${activeFacilityCategory === category ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:text-ink'}`}
                    key={category}
                    onClick={() => setActiveFacilityCategory(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <Card className="overflow-hidden p-0" padding="none">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <h3 className="text-sm font-semibold text-ink">Facilities Map</h3>
                  <Badge tone="warning">ILLUSTRATIVE MAP</Badge>
                </div>
                <div className="relative h-72 bg-canvas sm:h-[24rem]">
                  <img
                    alt={`${area.name} illustrative area map; facility locations are shown as demo markers`}
                    className="h-full w-full object-cover"
                    src={areaMapImage}
                  />
                  {mappedFacilityMarkers.length > 0 ? (
                    <>
                      {mappedFacilityMarkers.map((facility, index) => {
                        const position = markerPosition(facility)
                        const isSelected = selectedFacilityId === facility.id

                        return (
                          <button
                            aria-label={`${facility.name ?? `${facility.category} ${index + 1}`} on map`}
                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                            key={facility.id}
                            onClick={() => setSelectedFacilityId(isSelected ? null : facility.id)}
                            style={{ left: `${position.left}%`, top: `${position.top}%` }}
                            type="button"
                          >
                            <img
                              alt=""
                              className="h-8 w-8 object-contain drop-shadow-md"
                              src={googleMapsPin}
                            />
                          </button>
                        )
                      })}
                      {selectedFacility && selectedFacilityPosition ? (
                        <div
                          className="absolute z-20 w-[min(14rem,calc(100%-1rem))] rounded-xl border border-line bg-white/95 p-3 shadow-card backdrop-blur-sm"
                          style={{
                            left: `clamp(0.5rem, calc(${selectedFacilityPosition.left}% - 7rem), calc(100% - 15rem))`,
                            top: selectedFacilityPosition.top < 35
                              ? `calc(${selectedFacilityPosition.top}% + 1rem)`
                              : `${selectedFacilityPosition.top}%`,
                            transform: selectedFacilityPosition.top < 35
                              ? undefined
                              : 'translateY(calc(-100% - 1rem))',
                          }}
                        >
                          <p className="text-sm font-semibold text-ink">{selectedFacility.name ?? `${selectedFacility.category} ${mappedFacilityMarkers.indexOf(selectedFacility) + 1}`}</p>
                          <p className="mt-1 text-xs font-medium text-brand">{selectedFacility.category}</p>
                          {selectedFacility.details ? (
                            <p className="mt-1 text-xs leading-5 text-muted">{selectedFacility.details}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-10 text-white">
                      <p className="text-sm font-semibold">{area.name}</p>
                      <p className="mt-1 text-xs">
                        Facility-level location data is unavailable for this demo, so no markers are shown for this selection.
                      </p>
                    </div>
                  )}
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