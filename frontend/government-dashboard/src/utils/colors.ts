// Good scores: HIGH is good. Green = good, orange = okay, red = needs help
export function colorFor(score: number) {
  if (score >= 70) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#dc2626";
}

// Priorities: HIGH is bad. Red = urgent, orange = medium, green = low
export function urgencyColor(priority: number) {
  if (priority >= 30) return "#dc2626";
  if (priority >= 15) return "#d97706";
  return "#16a34a";
}