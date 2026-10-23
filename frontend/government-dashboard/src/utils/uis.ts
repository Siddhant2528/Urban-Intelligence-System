// Deterministic helpers. In production these calculations live in the backend (algorithms/).
export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

export function standardize(x: number, min: number, max: number, direction: "positive" | "negative") {
  const s = direction === "positive" ? (100 * (x - min)) / (max - min) : (100 * (max - x)) / (max - min);
  return clamp(s);
}

export const round2 = (v: number) => Math.round(v * 100) / 100;

export const scoreBand = (score: number) => (score >= 75 ? "good" : score >= 50 ? "fair" : "poor");

export const bandColor: Record<string, string> = { good: "#2f7d5b", fair: "#c9921b", poor: "#b5483a" };
