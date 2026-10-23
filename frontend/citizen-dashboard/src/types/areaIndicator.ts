export interface AreaIndicator {
  areaId: string
  indicatorId: string
  demoValue: number
  rawMetric?: number | null
  unit?: string
  benchmarkMin?: number
  benchmarkMax?: number
  calculatedAt?: string
}
