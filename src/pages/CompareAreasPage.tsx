import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ButtonLink, Card, SectionHeader, Select } from '../components/common'
import { AreaUisSpotlight, PairedIndicatorScores, LogicalComparisonSummary } from '../components/comparison'
import { demoData } from '../data/demoData'

function CompareAreasPage() {
  const [areaAId, setAreaAId] = useState(demoData.areas[0]?.id ?? '')
  const [areaBId, setAreaBId] = useState(demoData.areas[1]?.id ?? '')
  const areaA = demoData.areas.find((area) => area.id === areaAId)
  const areaB = demoData.areas.find((area) => area.id === areaBId)
  const areaAAnalysis = demoData.areaAnalysis.find((item) => item.areaId === areaAId)
  const areaBAnalysis = demoData.areaAnalysis.find((item) => item.areaId === areaBId)

  const getDemoValue = (areaId: string, indicatorId: string) =>
    demoData.areaIndicators.find(
      (item) => item.areaId === areaId && item.indicatorId === indicatorId,
    )?.demoValue ?? null

  const indicatorRows = demoData.indicators.map((indicator) => ({
    id: indicator.id,
    label: indicator.category,
    areaAValue: getDemoValue(areaAId, indicator.id),
    areaBValue: getDemoValue(areaBId, indicator.id),
  }))

  return (
    <div className="mx-auto w-full max-w-7xl px-page py-10 sm:py-12">
      <ButtonLink
        className="mb-5"
        leadingIcon={<ArrowLeft aria-hidden="true" size={18} />}
        to="/areas"
        variant="ghost"
      >
        Back to Areas
      </ButtonLink>
      <SectionHeader
        level={1}
        title="Compare areas"
        description="View area indicators side by side with logical civic context and underlying factors."
      />

      {/* Select Area Pair Section */}
      <section aria-label="Choose areas to compare" className="mt-8">
        <Card className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Area A"
            onChange={(event) => setAreaAId(event.target.value)}
            value={areaAId}
          >
            {demoData.areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </Select>
          <Select
            label="Area B"
            onChange={(event) => setAreaBId(event.target.value)}
            value={areaBId}
          >
            {demoData.areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </Select>
        </Card>
      </section>

      {/* 1. Dedicated Area UIS Spotlight (Stands Out Prominently) */}
      <section aria-label="Overall Area UIS Comparison" className="mt-8">
        <AreaUisSpotlight
          areaAName={areaA?.name ?? 'Area A'}
          areaAUis={areaAAnalysis?.uisDemoValue ?? null}
          areaBName={areaB?.name ?? 'Area B'}
          areaBUis={areaBAnalysis?.uisDemoValue ?? null}
          scale={areaAAnalysis?.uisScale ?? 100}
        />
      </section>

      {/* 2. Redesigned Paired Area Indicator Scores */}
      <section aria-labelledby="comparison-table-title" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <SectionHeader
            id="comparison-table-title"
            level={2}
            title="Paired Area Scores & Indicators"
            description="Explore head-to-head performance across all 7 civic indicators."
          />
        </div>

        <PairedIndicatorScores
          areaAName={areaA?.name ?? 'Area A'}
          areaBName={areaB?.name ?? 'Area B'}
          rows={indicatorRows}
        />
      </section>

      {/* 3. Logical Civic Comparison Summary */}
      <section aria-labelledby="comparison-summary-title" className="mt-12">
        <SectionHeader
          id="comparison-summary-title"
          level={2}
          title="Comparison Summary & Underlying Causes"
          description="Contextual civic explanations for why indicators are strong or constrained in each area."
        />
        <div className="mt-5">
          <LogicalComparisonSummary
            areaAId={areaAId}
            areaAName={areaA?.name ?? 'Area A'}
            areaBId={areaBId}
            areaBName={areaB?.name ?? 'Area B'}
          />
        </div>
      </section>
    </div>
  )
}

export default CompareAreasPage