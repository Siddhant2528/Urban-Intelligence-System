/**
 * ApiDataContext
 * Fetches all core data from the backend on app load and provides it via context.
 * Acts as a drop-in replacement for the static demoData import across all pages.
 *
 * Usage:
 *   const { data, loading, error } = useApiData()
 *   data.areas, data.cityOverview, data.areaAnalysis, etc.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { areasApi } from '../api/areas'
import { cityApi } from '../api/city'
import { indicatorsApi } from '../api/indicators'
import {
  buildSlugToIdMap,
  mapBackendAreas,
  mapBackendIndicatorScores,
  deriveTopStrength,
  deriveAreaToImprove,
} from '../utils/mappers'
import type { Area } from '../types/area'
import type { AreaAnalysisDemo } from '../types/areaAnalysis'
import type { Indicator } from '../types/indicator'
import type { AreaIndicator } from '../types/areaIndicator'
import type { CityOverviewDemo } from '../types/cityOverview'
import type { BackendArea, BackendIndicatorScore } from '../api/types'

// ── Context shape ─────────────────────────────────────────────────────────────

export interface ApiDataset {
  dataStatus: 'live' | 'loading' | 'error' | 'demo'
  cityOverview: CityOverviewDemo
  areas: Area[]
  /** slug → backend integer ID — used when calling per-area API endpoints */
  slugToId: Record<string, number>
  areaAnalysis: AreaAnalysisDemo[]
  indicators: Indicator[]
  areaIndicators: AreaIndicator[]
}

interface ApiDataContextValue {
  data: ApiDataset
  loading: boolean
  error: string | null
  /** Call this to re-fetch (e.g. after backend recalculation) */
  refresh: () => void
}

const EMPTY: ApiDataset = {
  dataStatus: 'loading',
  cityOverview: { name: 'Loading…', uisDemoValue: 0, uisScale: 100 },
  areas: [],
  slugToId: {},
  areaAnalysis: [],
  indicators: [],
  areaIndicators: [],
}

const ApiDataContext = createContext<ApiDataContextValue>({
  data: EMPTY,
  loading: true,
  error: null,
  refresh: () => {},
})

// ── Provider ──────────────────────────────────────────────────────────────────

export function ApiDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ApiDataset>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        // Fetch areas + city UIS in parallel
        const [areasRes, cityUIS] = await Promise.all([
          areasApi.list(),
          cityApi.getUIS().catch(() => null),
        ])

        const backendAreas: BackendArea[] = areasRes.areas.filter(
          (area) => area.population_source === 'Nashik Municipal Corporation',
        )
        if (backendAreas.length === 0) {
          throw new Error('The backend returned no Nashik municipal wards.')
        }
        const slugToId = buildSlugToIdMap(backendAreas)
        const areas = mapBackendAreas(backendAreas)

        // Fetch indicator scores for every area in parallel
        const indicatorResults = await Promise.all(
          backendAreas.map((a) =>
            indicatorsApi
              .getAreaScores(a.id)
              .then((r) => ({ areaId: a.id, areaName: a.name, scores: r.scores }))
              .catch(() => ({ areaId: a.id, areaName: a.name, scores: [] as BackendIndicatorScore[] })),
          ),
        )

        // Build AreaIndicator[] (flat list used by chart components)
        const areaIndicators: AreaIndicator[] = indicatorResults.flatMap(({ areaName, scores }) => {
          const slug = areaName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          return mapBackendIndicatorScores(scores, slug)
        })

        // Build AreaAnalysisDemo[] — one entry per area
        const areaAnalysis: AreaAnalysisDemo[] = []
        for (const { areaId, areaName, scores } of indicatorResults) {
          const slug = areaName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          // Fetch per-area UIS (best effort)
          const uis = await areasApi.getUIS(areaId).catch(() => null)
          areaAnalysis.push({
            areaId: slug,
            uisDemoValue: uis?.score ?? 0,
            uisScale: 100,
            topStrengthIndicatorId: deriveTopStrength(scores),
            areaToImproveIndicatorId: deriveAreaToImprove(scores),
          })
        }

        // Derive unique indicators list from first area's scores
        const firstScores = indicatorResults[0]?.scores ?? []
        const seenCats = new Set<string>()
        const indicators: Indicator[] = firstScores
          .filter((s) => {
            const k = s.category.toLowerCase()
            if (seenCats.has(k)) return false
            seenCats.add(k)
            return true
          })
          .map((s) => ({
            id: s.category.toLowerCase(),
            category: s.category as Indicator['category'],
          }))

        if (cancelled) return

        setData({
          dataStatus: 'live',
          cityOverview: {
            name: 'Nashik',
            uisDemoValue: cityUIS?.score ?? 0,
            uisScale: 100,
          },
          areas,
          slugToId,
          areaAnalysis,
          indicators,
          areaIndicators,
        })
      } catch (err) {
        if (cancelled) return
        console.error('[ApiDataProvider] Failed to load data:', err)
        setError('Could not connect to the UIS backend. Showing demo data.')
        // Fall through to demo data import as graceful degradation
        const { demoData } = await import('../data/demoData')
        setData({ ...demoData, dataStatus: 'demo', slugToId: {} })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [tick])

  return (
    <ApiDataContext.Provider value={{ data, loading, error, refresh: () => setTick((t) => t + 1) }}>
      {children}
    </ApiDataContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useApiData() {
  return useContext(ApiDataContext)
}
