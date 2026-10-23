import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ButtonLink, Card, SectionHeader, Select } from '../components/common'
import { AreaUisSpotlight, PairedIndicatorScores, LogicalComparisonSummary } from '../components/comparison'
import { useApiData } from '../context/ApiDataContext'

function CompareAreasPage() {
  const { data } = useApiData()
  const [areaAId, setAreaAId] = useState('')
  const [areaBId, setAreaBId] = useState('')

  useEffect(() => {
    if (data.areas.length >= 2 && !areaAId && !areaBId) {
      setAreaAId(data.areas[0].id)
      setAreaBId(data.areas[1].id)
    }
  }, [data.areas, areaAId, areaBId])

  const areaA = data.areas.find((area) => area.id === areaAId)
  const areaB = data.areas.find((area) => area.id === areaBId)
  const areaAAnalysis = data.areaAnalysis.find((item) => item.areaId === areaAId)
  const areaBAnalysis = data.areaAnalysis.find((item) => item.areaId === areaBId)

  const getDemoValue = (areaId: string, indicatorId: string) =>
    data.areaIndicators.find(
      (item) => item.areaId === areaId && item.indicatorId === indicatorId,
    )?.demoValue ?? null

  const indicatorRows = data.indicators.map((indicator) => ({
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
            {data.areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </Select>
          <Select
            label="Area B"
            onChange={(event) => setAreaBId(event.target.value)}
            value={areaBId}
          >
            {data.areas.map((area) => (
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
          isBackendData={data.dataStatus === 'live'}
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
            isBackendData={data.dataStatus === 'live'}
          />
        </div>
      </section>
    </div>
  )
}

export default CompareAreasPage
