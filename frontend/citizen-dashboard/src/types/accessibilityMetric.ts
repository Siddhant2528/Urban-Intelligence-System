export const accessibilityCategories = [
  'Healthcare',
  'Education',
  'Transport',
  'Safety',
  'Essential Services',
] as const

export type AccessibilityCategory = (typeof accessibilityCategories)[number]

export interface AccessibilityMetric {
  areaId: string
  category: AccessibilityCategory
  demoValue: number
}