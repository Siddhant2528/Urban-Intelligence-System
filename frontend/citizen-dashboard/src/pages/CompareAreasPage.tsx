import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Badge, ButtonLink, Card, SectionHeader, Select } from '../components/common'
import { demoData } from '../data/demoData'

interface ScoreBarProps {
  areaName: string
  indicatorName: string
  value: number | null
  color: string
}

function ScoreBar({ areaName, color, indicatorName, value }: ScoreBarProps) {
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

function CompareAreasPage() {
  const [areaAId, setAreaAId] = useState(demoData.areas[0]?.id ?? '')
  const [areaBId, setAreaBId] = useState(demoData.areas[1]?.id ?? '')
  const areaA = demoData.areas.find((area) => area.id === areaAId)
  const areaB = demoData.areas.find((area) => area.id === areaBId)
  const areaAAnalysis = demoData.areaAnalysis.find((item) => item.areaId === areaAId)
  const areaBAnalysis = demoData.areaAnalysis.find((item) => item.areaId === areaBId)
  const areaAProfile = demoData.developmentProfiles.find((item) => item.areaId === areaAId)
  const areaBProfile = demoData.developmentProfiles.find((item) => item.areaId === areaBId)

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
  const comparisonRows = [
    {
      id: 'area-uis',
      label: 'Area UIS',
      areaAValue: areaAAnalysis?.uisDemoValue ?? null,
      areaBValue: areaBAnalysis?.uisDemoValue ?? null,
    },
    ...indicatorRows,
  ]
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
  const balancedConclusion = pairedIndicatorRows.length === 0
    ? `The available data does not support a balanced comparison between ${areaA?.name ?? 'Area A'} and ${areaB?.name ?? 'Area B'} because they have no indicator scores in common.`
    : areaAWins.length === 0 && areaBWins.length === 0
      ? `The selected areas have equal scores across all ${tiedIndicators.length} comparable indicators. This comparison does not indicate an overall better area.`
      : areaAWins.length === areaBWins.length
        ? `The results are mixed: ${areaA?.name ?? 'Area A'} leads in ${areaAWins.length} indicators and ${areaB?.name ?? 'Area B'} leads in ${areaBWins.length}. The differences show indicator-specific strengths, not an overall ranking.`
        : `${areaAWins.length > areaBWins.length ? areaA?.name ?? 'Area A' : areaB?.name ?? 'Area B'} leads in more of the comparable indicators (${Math.max(areaAWins.length, areaBWins.length)} versus ${Math.min(areaAWins.length, areaBWins.length)}), while the other area has relative strengths in its leading indicators. These demo scores do not establish that either area is universally better.`

  const unavailableData = missingIndicators.map((row) => {
    const unavailableAreas = [
      row.areaAValue === null ? areaA?.name ?? 'Area A' : null,
      row.areaBValue === null ? areaB?.name ?? 'Area B' : null,
    ].filter(Boolean)
    return `${row.label}: no score for ${unavailableAreas.join(' and ')}`
  })

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
        description="View area indicators side by side. All values are demo data and are not rankings."
      />

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

      <section aria-labelledby="comparison-table-title" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            id="comparison-table-title"
            level={2}
            title="Indicator comparison"
            description="Paired scores are shown on the same 0–100 scale."
          />
          <Badge tone="warning">DEMO DATA</Badge>
        </div>
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
          {comparisonRows.map((row) => (
            <article className="px-4 py-4 sm:px-5" key={row.id}>
              <h3 className="text-sm font-semibold text-ink">{row.label}</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:gap-6">
                <ScoreBar
                  areaName={areaA?.name ?? 'Area A'}
                  color="#176b53"
                  indicatorName={row.label}
                  value={row.areaAValue}
                />
                <ScoreBar
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

      <section aria-labelledby="comparison-summary-title" className="mt-10">
        <SectionHeader
          id="comparison-summary-title"
          level={2}
          title="Comparison Summary"
          description="Generated from the available demonstration indicator scores for these selected areas."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-base font-semibold text-ink">Relative strengths of {areaA?.name ?? 'Area A'}</h3>
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
            <h3 className="text-base font-semibold text-ink">Relative strengths of {areaB?.name ?? 'Area B'}</h3>
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
            <h3 className="text-base font-semibold text-ink">Main differences and possible review opportunities</h3>
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
              No documented indicator-specific improvement threshold is configured; improvement opportunities are therefore described only relative to each area’s available scores.
            </p>
            <div className="mt-4 border-t border-line pt-4">
              <h4 className="text-sm font-semibold text-ink">Balanced conclusion</h4>
              <p className="mt-2 text-sm leading-6 text-muted">{balancedConclusion}</p>
            </div>
          </Card>
        </div>
      </section>

      <section aria-labelledby="profile-comparison-title" className="mt-10">
        <SectionHeader
          id="profile-comparison-title"
          level={2}
          title="Development profile comparison"
          description="Profile text is demonstration content and does not establish a ranking."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[{ area: areaA, profile: areaAProfile }, { area: areaB, profile: areaBProfile }].map(
            ({ area, profile }, index) => (
              <Card key={`area-profile-${index}`}>
                <p className="text-sm font-semibold text-ink">{area?.name ?? `Area ${index === 0 ? 'A' : 'B'}`}</p>
                {profile ? (
                  <>
                    <p className="mt-3 text-base font-medium text-ink">{profile.demoLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{profile.demoSummary}</p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted">No demo profile available.</p>
                )}
              </Card>
            ),
          )}
        </div>
      </section>

    </div>
  )
}

export default CompareAreasPage