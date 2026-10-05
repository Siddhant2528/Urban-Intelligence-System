export const indicatorCategories = [
  'Environment',
  'Healthcare',
  'Education',
  'Safety',
  'Transport',
  'Infrastructure',
  'Accessibility',
] as const

export type IndicatorCategory = (typeof indicatorCategories)[number]

export interface Indicator {
  id: string
  category: IndicatorCategory
}