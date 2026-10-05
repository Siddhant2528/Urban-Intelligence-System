export interface IndicatorBreakdownDemo {
  label: string
  demoValue: number
}

export interface IndicatorDetailDemo {
  indicatorId: string
  demoDescription: string
  demoRawValue: number
  demoUnit: string
  demoReference: string
  demoDataSource: string
  demoLastUpdated: string
  componentBreakdown: IndicatorBreakdownDemo[]
}