import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  SearchInput,
  SectionHeader,
  Select,
} from '../components/common'
import { demoData } from '../data/demoData'

function AreaSelectionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const visibleAreas = demoData.areas.filter((area) =>
    area.name.toLocaleLowerCase().includes(normalizedQuery),
  )
  const selectedArea = visibleAreas.find((area) => area.id === selectedAreaId)

  return (
    <div className="mx-auto w-full max-w-7xl px-page py-10 sm:py-12">
      <div>
        <ButtonLink
          className="mb-4"
          leadingIcon={<ArrowLeft aria-hidden="true" size={18} />}
          to="/city"
          variant="ghost"
        >
          Back to City
        </ButtonLink>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            id="area-selection-heading"
            level={1}
            title="Select an area"
            description="Choose a demo area to open its analysis."
          />
          <Badge className="w-fit" tone="warning">DEMO AREAS</Badge>
        </div>
      </div>

      <section aria-labelledby="area-selection-heading" className="mt-8">
        <div className="grid gap-4 rounded-card border border-line bg-surface p-4 shadow-card sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto] sm:items-end sm:p-5">
          <SearchInput
            label="Search areas"
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setSelectedAreaId('')
            }}
            placeholder="Search by area name"
            value={searchQuery}
          />
          <Select
            disabled={visibleAreas.length === 0}
            label="Select area"
            onChange={(event) => setSelectedAreaId(event.target.value)}
            value={selectedAreaId}
          >
            <option value="">Choose an area</option>
            {visibleAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </Select>
          {selectedArea ? (
            <ButtonLink
              className="w-full sm:w-auto"
              leadingIcon={<ArrowRight aria-hidden="true" size={18} />}
              to={`/area/${selectedArea.id}`}
            >
              Open Area Analysis
            </ButtonLink>
          ) : (
            <Button className="w-full sm:w-auto" disabled type="button">
              Open Area Analysis
            </Button>
          )}
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Available areas</h2>
            <p className="text-sm text-muted">
              {visibleAreas.length} {visibleAreas.length === 1 ? 'area' : 'areas'}
            </p>
          </div>
          {visibleAreas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleAreas.map((area) => (
                <Link
                  className="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  key={area.id}
                  to={`/area/${area.id}`}
                >
                  <Card className="flex min-h-28 items-center justify-between gap-4" interactive>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">
                        Demo area
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-ink">{area.name}</h3>
                    </div>
                    <ArrowRight
                      aria-hidden="true"
                      className="shrink-0 text-brand transition-transform group-hover:translate-x-1"
                      size={20}
                    />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card padding="none">
              <EmptyState
                title="No areas found"
                description="Try another search to see the available demo areas."
              />
            </Card>
          )}
        </div>
      </section>

      <section aria-labelledby="compare-areas-heading" className="mt-12 border-t border-line pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            id="compare-areas-heading"
            level={2}
            title="Compare areas"
            description="Compare two areas using UIS and indicator performance."
          />
          <ButtonLink
            className="w-full sm:w-auto"
            leadingIcon={<ArrowRight aria-hidden="true" size={18} />}
            to="/compare"
          >
            Compare Areas
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}

export default AreaSelectionPage