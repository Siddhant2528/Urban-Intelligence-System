/**
 * Data mappers: transform backend API shapes → frontend component types.
 *
 * Backend uses:  integer IDs, snake_case fields, lowercase facility types
 * Frontend uses: string slugs, camelCase fields, display-name facility categories
 */

import type { BackendArea, BackendFacility, BackendAccessibilityMetric, BackendIndicatorScore } from '../api/types'
import type { Area } from '../types/area'
import type { Facility, FacilityCategory } from '../types/facility'
import type { AccessibilityMetric, AccessibilityCategory } from '../types/accessibilityMetric'
import type { AreaIndicator } from '../types/areaIndicator'
import type { Indicator } from '../types/indicator'

// ── Area ID helpers ───────────────────────────────────────────────────────────

/** Convert a backend area name to a URL-safe slug. e.g. "Gangapur Road" → "gangapur-road" */
export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Build a lookup map: slug → integer backend ID */
export function buildSlugToIdMap(areas: BackendArea[]): Record<string, number> {
  return Object.fromEntries(areas.map((a) => [nameToSlug(a.name), a.id]))
}

/** Build a lookup map: integer backend ID → slug */
export function buildIdToSlugMap(areas: BackendArea[]): Record<number, string> {
  return Object.fromEntries(areas.map((a) => [a.id, nameToSlug(a.name)]))
}

// ── Backend Area → Frontend Area ──────────────────────────────────────────────

export function mapBackendArea(a: BackendArea): Area {
  return {
    id: nameToSlug(a.name),   // frontend still uses slug as ID for routing
    name: a.name,
  }
}

export function mapBackendAreas(areas: BackendArea[]): Area[] {
  return areas.map(mapBackendArea)
}

// ── Facility type mapping ─────────────────────────────────────────────────────

const FACILITY_TYPE_TO_CATEGORY: Record<string, FacilityCategory> = {
  hospital: 'Hospitals',
  school: 'Schools',
  police: 'Police Stations',
  transit_stop: 'Bus Stops',
  railway_station: 'Railway Stations',
  park: 'Parks',
}

export const CATEGORY_TO_FACILITY_TYPE: Record<FacilityCategory, string> = {
  Hospitals: 'hospital',
  Schools: 'school',
  'Police Stations': 'police',
  'Bus Stops': 'transit_stop',
  'Railway Stations': 'railway_station',
  Parks: 'park',
}

export function mapBackendFacility(f: BackendFacility, areaSlug: string): Facility {
  return {
    id: String(f.id),
    areaId: areaSlug,
    category: (FACILITY_TYPE_TO_CATEGORY[f.facility_type] ?? 'Hospitals') as FacilityCategory,
    demoCount: 1,    // each record is one facility; count by grouping on display
    name: f.name,
    details: `${f.category} in ${f.area_name ?? areaSlug}`,
    coordinates: f.coordinates,
  }
}

export function mapBackendFacilities(facilities: BackendFacility[], areaSlug: string): Facility[] {
  return facilities.map((f) => mapBackendFacility(f, areaSlug))
}

// ── Accessibility mapping ─────────────────────────────────────────────────────

const BACKEND_CATEGORY_TO_ACCESSIBILITY: Record<string, AccessibilityCategory> = {
  Hospital: 'Healthcare',
  School: 'Education',
  Transit_stop: 'Transport',
  Police: 'Safety',
}

export function mapBackendAccessibility(
  metrics: BackendAccessibilityMetric[],
  areaSlug: string,
): AccessibilityMetric[] {
  return metrics
    .map((m) => {
      const category = BACKEND_CATEGORY_TO_ACCESSIBILITY[m.category]
      if (!category) return null
      return {
        areaId: areaSlug,
        category,
        demoValue: Math.round(m.coverage_percentage),
      } as AccessibilityMetric
    })
    .filter((m): m is AccessibilityMetric => m !== null)
}

// ── Indicator score mapping ───────────────────────────────────────────────────

/**
 * Maps backend indicator scores for an area into the flat AreaIndicator shape
 * the frontend uses. Category string is normalised to match frontend indicatorId.
 */
export function mapBackendIndicatorScores(
  scores: BackendIndicatorScore[],
  areaSlug: string,
): AreaIndicator[] {
  return scores.map((s) => ({
    areaId: areaSlug,
    indicatorId: s.category.toLowerCase(),   // "Healthcare" → "healthcare"
    demoValue: Math.round(s.score),
    rawMetric: s.raw_metric,
    unit: s.unit,
    benchmarkMin: s.benchmark_min_used,
    benchmarkMax: s.benchmark_max_used,
    calculatedAt: s.calculated_at,
  }))
}

/**
 * Derive unique Indicator definitions from the scored list.
 * Used to replace the static hardcoded indicator list.
 */
export function mapBackendIndicatorDefinitions(
  scores: BackendIndicatorScore[],
): Indicator[] {
  const seen = new Set<string>()
  return scores
    .filter((s) => {
      const key = s.category.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((s) => ({
      id: s.category.toLowerCase(),
      category: s.category as Indicator['category'],
    }))
}

// ── Derive top-strength / area-to-improve from scores ────────────────────────

export function deriveTopStrength(scores: BackendIndicatorScore[]): string {
  if (!scores.length) return ''
  return [...scores].sort((a, b) => b.score - a.score)[0].category.toLowerCase()
}

export function deriveAreaToImprove(scores: BackendIndicatorScore[]): string {
  if (!scores.length) return ''
  return [...scores].sort((a, b) => a.score - b.score)[0].category.toLowerCase()
}
