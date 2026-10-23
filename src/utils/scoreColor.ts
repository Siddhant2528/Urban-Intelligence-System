/**
 * Standard Heatmap Intensity Scale (calibrated to City Map):
 * - 0–39   : Very Low   -> Red (#ef4444)
 * - 40–49  : Low        -> Orange (#f97316)
 * - 50–69  : Moderate   -> Yellow/Amber (#eab308)
 * - 70–84  : High       -> Light Green (#22c55e)
 * - 85–100 : Very High  -> Dark Green (#15803d)
 */

export function getHeatmapScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return '#94a3b8' // Slate gray
  }
  if (score < 40) return '#ef4444' // Red
  if (score < 50) return '#f97316' // Orange
  if (score < 70) return '#eab308' // Yellow
  if (score < 85) return '#22c55e' // Light Green
  return '#15803d'                 // Dark Green
}

export function getHeatmapScoreGradient(score: number | null | undefined): { from: string; to: string } {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return { from: '#cbd5e1', to: '#94a3b8' }
  }
  if (score < 40) return { from: '#f87171', to: '#ef4444' } // Red
  if (score < 50) return { from: '#fb923c', to: '#f97316' } // Orange
  if (score < 70) return { from: '#fde047', to: '#eab308' } // Yellow
  if (score < 85) return { from: '#4ade80', to: '#22c55e' } // Light Green
  return { from: '#22c55e', to: '#15803d' }                 // Dark Green
}

export const CATEGORY_ACCENT_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Environment: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    glow: 'from-emerald-500/10 to-teal-500/5',
  },
  Healthcare: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    glow: 'from-rose-500/10 to-pink-500/5',
  },
  Education: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700',
    border: 'border-indigo-200/80',
    glow: 'from-indigo-500/10 to-violet-500/5',
  },
  Safety: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    border: 'border-blue-200/80',
    glow: 'from-blue-500/10 to-sky-500/5',
  },
  Transport: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    glow: 'from-amber-500/10 to-orange-500/5',
  },
  Infrastructure: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-700',
    border: 'border-slate-200/80',
    glow: 'from-slate-500/10 to-zinc-500/5',
  },
  Accessibility: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-700',
    border: 'border-teal-200/80',
    glow: 'from-teal-500/10 to-cyan-500/5',
  },
}
