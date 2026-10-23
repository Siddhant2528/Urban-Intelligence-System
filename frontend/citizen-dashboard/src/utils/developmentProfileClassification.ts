export const developmentIndicatorIds = [
  'environment',
  'healthcare',
  'education',
  'safety',
  'transport',
  'infrastructure',
  'accessibility',
] as const

export type DevelopmentIndicatorId = (typeof developmentIndicatorIds)[number]
export type IndicatorBand = 'Strong' | 'Moderate' | 'Weak'
export type DevelopmentProfileName =
  | 'Well-Developed Urban Area'
  | 'Developing Urban Area'
  | 'Emerging Urban Area'
  | 'Infrastructure-Developing Area'
  | 'Environmentally Stressed Urban Area'
  | 'Insufficient Data for Classification'

export interface ClassifiedIndicator {
  id: DevelopmentIndicatorId
  label: string
  score: number | null
  band: IndicatorBand | null
}

export interface DevelopmentProfileClassification {
  profileName: DevelopmentProfileName
  reason: string
  counts: Record<IndicatorBand, number>
  indicators: ClassifiedIndicator[]
}

export type DevelopmentIndicatorScores = Partial<
  Record<DevelopmentIndicatorId, number | null | undefined>
>

export const developmentProfilePriority: DevelopmentProfileName[] = [
  'Insufficient Data for Classification',
  'Emerging Urban Area',
  'Infrastructure-Developing Area',
  'Environmentally Stressed Urban Area',
  'Well-Developed Urban Area',
  'Developing Urban Area',
]

const indicatorLabels: Record<DevelopmentIndicatorId, string> = {
  environment: 'Environment',
  healthcare: 'Healthcare',
  education: 'Education',
  safety: 'Safety',
  transport: 'Transport',
  infrastructure: 'Infrastructure',
  accessibility: 'Accessibility',
}

function getBand(score: number): IndicatorBand {
  if (score >= 70) return 'Strong'
  if (score >= 40) return 'Moderate'
  return 'Weak'
}

export function classifyDevelopmentProfile(
  scores: DevelopmentIndicatorScores,
): DevelopmentProfileClassification {
  const indicators = developmentIndicatorIds.map((id) => {
    const value = scores[id]
    const isValid = typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    return {
      id,
      label: indicatorLabels[id],
      score: isValid ? value : null,
      band: isValid ? getBand(value) : null,
    }
  })
  const counts: Record<IndicatorBand, number> = {
    Strong: indicators.filter((indicator) => indicator.band === 'Strong').length,
    Moderate: indicators.filter((indicator) => indicator.band === 'Moderate').length,
    Weak: indicators.filter((indicator) => indicator.band === 'Weak').length,
  }
  const unavailable = indicators.filter((indicator) => indicator.band === null)
  const weakLabels = indicators
    .filter((indicator) => indicator.band === 'Weak')
    .map((indicator) => indicator.label)
  const pattern = `${counts.Strong} Strong, ${counts.Moderate} Moderate, ${counts.Weak} Weak`
  const gapNote = weakLabels.length
    ? ` Weak-band gaps: ${weakLabels.join(', ')}.`
    : ' No indicators are in the Weak band.'

  if (unavailable.length > 0) {
    const unavailableLabels = unavailable.map((indicator) => indicator.label)
    return {
      profileName: 'Insufficient Data for Classification',
      reason: `Classification requires valid 0–100 scores for all seven indicators. Unavailable or out-of-range scores: ${unavailableLabels.join(', ')}. Available pattern: ${pattern}.${gapNote}`,
      counts,
      indicators,
    }
  }

  const environment = indicators.find((indicator) => indicator.id === 'environment')!
  const transport = indicators.find((indicator) => indicator.id === 'transport')!
  const infrastructure = indicators.find((indicator) => indicator.id === 'infrastructure')!
  const nonWeakEnvironmentNeighbors = indicators.filter(
    (indicator) => indicator.id !== 'environment' && indicator.band !== 'Weak',
  ).length

  if (counts.Weak >= 4) {
    return {
      profileName: 'Emerging Urban Area',
      reason: `${pattern}; at least four of seven indicators are Weak, meeting the majority-weak rule.${gapNote}`,
      counts,
      indicators,
    }
  }

  if (infrastructure.band === 'Weak' && transport.band === 'Weak') {
    return {
      profileName: 'Infrastructure-Developing Area',
      reason: `${pattern}; Infrastructure and Transport are both Weak. This specialized profile takes priority over the Environmentally Stressed rule when both match.${gapNote}`,
      counts,
      indicators,
    }
  }

  if (environment.band === 'Weak' && nonWeakEnvironmentNeighbors >= 4) {
    return {
      profileName: 'Environmentally Stressed Urban Area',
      reason: `${pattern}; Environment is Weak while ${nonWeakEnvironmentNeighbors} of the other six indicators are Moderate or Strong.${gapNote}`,
      counts,
      indicators,
    }
  }

  if (counts.Strong >= 4 && counts.Weak === 0) {
    return {
      profileName: 'Well-Developed Urban Area',
      reason: `${pattern}; at least four indicators are Strong and there are no Weak-band gaps.${gapNote}`,
      counts,
      indicators,
    }
  }

  return {
    profileName: 'Developing Urban Area',
    reason: `${pattern}; the pattern is moderate or uneven and does not meet a higher-priority specialized profile rule.${gapNote}`,
    counts,
    indicators,
  }
}