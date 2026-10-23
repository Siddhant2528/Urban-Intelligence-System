import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Accessibility,
  BusFront,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge, Card, SectionHeader, Select } from '../components/common'
import CityMapCard from '../components/city/CityMapCard'
import { AreaUisSpotlight, PairedIndicatorScores, LogicalComparisonSummary } from '../components/comparison'
import { useApiData } from '../context/ApiDataContext'
import type { IndicatorCategory } from '../types/indicator'

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
  const location = useLocation()
  const { data } = useApiData()
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

  const areaA = data.areas.find((area) => area.id === areaAId)
  const areaB = data.areas.find((area) => area.id === areaBId)
  const areaAAnalysis = data.areaAnalysis.find((item) => item.areaId === areaAId)
  const areaBAnalysis = data.areaAnalysis.find((item) => item.areaId === areaBId)
  const areaAUIS = areaAAnalysis?.uisDemoValue ?? null
  const areaBUIS = areaBAnalysis?.uisDemoValue ?? null

  const getDemoValue = (areaId: string, indicatorId: string) =>
    data.areaIndicators.find(
      (item) => item.areaId === areaId && item.indicatorId === indicatorId,
    )?.demoValue ?? null

  const hasSelectedComparisonAreas = Boolean(areaAId && areaBId && areaAId !== areaBId)

  const indicatorRows = data.indicators.map((indicator) => ({
    id: indicator.id,
    label: indicator.category,
    areaAValue: getDemoValue(areaAId, indicator.id),
    areaBValue: getDemoValue(areaBId, indicator.id),
  }))


  return (
    <div className="mx-auto w-full max-w-7xl px-page py-10 sm:py-12">
      <section aria-labelledby="city-heading" className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          id="city-heading"
          level={1}
          title={data.cityOverview.name}
          description="City Overview"
        />
        <Card
          className="w-full transition-[border-color,box-shadow] duration-150 hover:border-brand/40 hover:shadow-raised sm:w-64"
          padding="compact"
          title={data.dataStatus === 'live'
            ? 'Backend-calculated UIS; some underlying measurements are illustrative estimates'
            : 'Demonstration City UIS value out of 100'}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">City UIS</p>
            <Badge tone="warning">
              {data.dataStatus === 'live' ? 'ESTIMATED INPUTS' : 'DEMO DATA'}
            </Badge>
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">
            {data.cityOverview.uisDemoValue.toFixed(1)}
            <span className="ml-1 text-base font-medium text-muted">
              / {data.cityOverview.uisScale}
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
          {data.indicators.map(({ category, id }) => {
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

      <section aria-labelledby="city-compare-heading" className="mt-12">
        <SectionHeader
          id="city-compare-heading"
          level={2}
          title="Compare city areas"
          description="Select two available wards to compare their UIS and indicator performance side by side."
        />

        <Card className="mt-6 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Area A" onChange={(event) => setAreaAId(event.target.value)} value={areaAId}>
              <option value="">Choose an area</option>
              {data.areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </Select>
            <Select label="Area B" onChange={(event) => setAreaBId(event.target.value)} value={areaBId}>
              <option value="">Choose an area</option>
              {data.areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </Select>
          </div>
        </Card>

        {!hasSelectedComparisonAreas ? (
          <div className="mt-6 rounded-card border border-dashed border-line bg-canvas/60 px-4 py-10 text-center text-sm text-muted">
            Select two different wards to view their city comparison analysis.
          </div>
        ) : (
          <>
            {/* 1. Dedicated Area UIS Spotlight */}
            <section aria-label="Overall Area UIS Comparison" className="mt-8">
              <AreaUisSpotlight
                areaAName={areaA?.name ?? 'Area A'}
                areaAUis={areaAUIS}
                areaBName={areaB?.name ?? 'Area B'}
                areaBUis={areaBUIS}
                scale={areaAAnalysis?.uisScale ?? 100}
              isBackendData={data.dataStatus === 'live'}
              />
            </section>

            {/* 2. Redesigned Paired Area Scores & Indicators */}
            <section aria-labelledby="paired-scores-title" className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <SectionHeader
                  id="paired-scores-title"
                  level={3}
                  title="Paired Area Scores & Indicators"
                  description="Side-by-side indicator analysis comparing both selected areas on the 0–100 scale."
                />
              </div>

              <PairedIndicatorScores
                areaAName={areaA?.name ?? 'Area A'}
                areaBName={areaB?.name ?? 'Area B'}
                rows={indicatorRows}
              />
            </section>

            {/* 3. Logical Civic Comparison Summary & Underlying Causes */}
            <section aria-labelledby="comparison-summary-title" className="mt-12">
              <SectionHeader
                id="comparison-summary-title"
                level={3}
                title="Comparison Summary & Underlying Causes"
                description="Contextual civic explanations for why indicators are strong or constrained in each area."
              />
              <div className="mt-5">
                <LogicalComparisonSummary
                  areaAId={areaAId}
                  areaAName={areaA?.name ?? 'Area A'}
                  areaBId={areaBId}
                  areaBName={areaB?.name ?? 'Area B'}
                  isBackendData={data.dataStatus === 'live'}
                />
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  )
}

export default CityOverviewPage
