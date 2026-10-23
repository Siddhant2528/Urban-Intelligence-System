import { ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router-dom'
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  MetricCard,
  SectionHeader,
} from '../components/common'
import { demoData } from '../data/demoData'
import { useApiData } from '../context/ApiDataContext'

function IndicatorDetailPage() {
  const { id, indicatorId } = useParams<{ id: string; indicatorId: string }>()
  const { data } = useApiData()

  const allowDemoFallback = data.dataStatus === 'demo'
  const area = data.areas.find((item) => item.id === id) ?? (allowDemoFallback ? demoData.areas.find((item) => item.id === id) : undefined)
  const indicator = data.indicators.find((item) => item.id === indicatorId) ?? (allowDemoFallback ? demoData.indicators.find((item) => item.id === indicatorId) : undefined)
  const details = demoData.indicatorDetails.find((item) => item.indicatorId === indicatorId)
  const score = data.areaIndicators.find(
    (item) => item.areaId === id && item.indicatorId === indicatorId,
  ) ?? (allowDemoFallback ? demoData.areaIndicators.find(
    (item) => item.areaId === id && item.indicatorId === indicatorId,
  ) : undefined)

  if (!area || !indicator || !details || !score) {
    return (
      <div className="mx-auto w-full max-w-5xl px-page py-10">
        <ButtonLink leadingIcon={<ArrowLeft aria-hidden="true" size={18} />} to="/areas" variant="ghost">
          Back to Areas
        </ButtonLink>
        <div className="mt-6 rounded-card border border-line bg-surface shadow-card">
          <EmptyState
            title="Indicator details not found"
            description="Choose an indicator from an available ward to view its details."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-page py-8 sm:py-10">
      <ButtonLink
        leadingIcon={<ArrowLeft aria-hidden="true" size={18} />}
        to={`/area/${area.id}`}
        variant="ghost"
      >
        Back to {area.name}
      </ButtonLink>

      <section aria-labelledby="indicator-title" className="mt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            id="indicator-title"
            level={1}
            title={indicator.category}
            description={`${area.name} · Indicator Details`}
          />
          <MetricCard
            detail={<Badge tone="warning">{allowDemoFallback ? 'DEMO VALUE' : 'ESTIMATED INPUTS'}</Badge>}
            label="Indicator score"
            value={
              <>
                {score.demoValue}
                <span className="ml-1 text-base font-medium text-muted">/ 100</span>
              </>
            }
          />
        </div>
      </section>

      <section aria-labelledby="description-title" className="mt-10">
        <SectionHeader id="description-title" level={2} title="Description" />
        <Card className="mt-4">
            <p className="text-sm leading-6 text-muted">
              {allowDemoFallback
                ? details.demoDescription
                : `Backend-calculated ${indicator.category.toLowerCase()} score for ${area.name}. Missing source measurements may use illustrative estimates; the score is not an official municipal statistic.`}
            </p>
        </Card>
      </section>

      <section aria-labelledby="breakdown-title" className="mt-10">
        <SectionHeader id="breakdown-title" level={2} title="Component breakdown" />
        <Card className="mt-4" padding="none">
          {details.componentBreakdown.length > 0 ? (
            <ul className="divide-y divide-line">
              {details.componentBreakdown.map((component) => (
                <li className="flex items-center justify-between gap-4 px-5 py-4" key={component.label}>
                  <span className="text-sm text-ink">{component.label}</span>
                  <span className="text-sm font-medium tabular-nums text-muted">
                    {component.demoValue}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No component breakdown supplied"
              description="The backend does not currently provide a component-level breakdown for this indicator."
            />
          )}
        </Card>
      </section>

      <section aria-labelledby="raw-data-title" className="mt-10">
        <SectionHeader id="raw-data-title" level={2} title="Raw metric & reference" />
        <Card className="mt-4 p-0">
          <dl className="divide-y divide-line">
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm font-medium text-muted">Raw metric</dt>
              <dd className="text-sm font-semibold tabular-nums text-ink">
                {score.rawMetric ?? details.demoRawValue ?? 'Unavailable'}
              </dd>
            </div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm font-medium text-muted">Unit</dt>
              <dd className="text-sm text-ink">{score.unit || details.demoUnit}</dd>
            </div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm font-medium text-muted">Reference / benchmark</dt>
              <dd className="text-sm text-ink">
                {score.benchmarkMin != null && score.benchmarkMax != null
                  ? `${score.benchmarkMin}–${score.benchmarkMax}`
                  : details.demoReference}
              </dd>
            </div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm font-medium text-muted">Data source</dt>
              <dd className="text-sm text-ink">
                {allowDemoFallback ? details.demoDataSource : 'UIS backend; some source measurements are illustrative estimates.'}
              </dd>
            </div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm font-medium text-muted">Last updated</dt>
              <dd className="text-sm text-ink">
                {score.calculatedAt ? new Date(score.calculatedAt).toLocaleString() : details.demoLastUpdated}
              </dd>
            </div>
          </dl>
        </Card>
      </section>

    </div>
  )
}

export default IndicatorDetailPage
