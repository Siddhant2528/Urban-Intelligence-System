import { Link } from "react-router-dom";
import type { CityGap } from "../types";
import {
  TOTAL_BUDGET_CR,
  budgetPlan,
  projects,
} from "../services/governmentExtras";

// A small coloured label such as "High"
function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}1a` }}
    >
      {text}
    </span>
  );
}

// Bigger gap = more help needed
function gapLevel(gap: number) {
  if (gap >= 25) return { text: "High", color: "#dc2626" };
  if (gap >= 15) return { text: "Medium", color: "#d97706" };
  return { text: "Low", color: "#16a34a" };
}

const box = "rounded-lg border border-slate-200 bg-white p-6";

/* ---------- 1. Infrastructure gap analysis ---------- */
export function GapAnalysis({ gaps }: { gaps: CityGap[] }) {
  const sorted = [...gaps].sort((a, b) => b.gap - a.gap);
  return (
    <section className={box}>
      <h2 className="mb-4 text-sm font-semibold uppercase text-blue-900">
        Infrastructure gap analysis
      </h2>
      <div className="mb-2 grid grid-cols-[1fr_2fr_auto] gap-3 text-xs text-slate-500">
        <span>Indicator</span>
        <span>Gap score</span>
        <span>Status</span>
      </div>
      <ul className="space-y-3">
        {sorted.map((g) => {
          const level = gapLevel(g.gap);
          return (
            <li
              key={g.indicator}
              className="grid grid-cols-[1fr_2fr_auto] items-center gap-3 text-sm"
            >
              <span>{g.indicator}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded bg-slate-100">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${Math.min(100, g.gap)}%`,
                      backgroundColor: level.color,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums">
                  {g.gap}
                </span>
              </div>
              <Badge text={level.text} color={level.color} />
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Gap = target (80) minus city average. High is 25 or more, Medium is 15
        or more.
      </p>
    </section>
  );
}

/* ---------- 2. Budget allocation plan ---------- */
export function BudgetPlan() {
  // Build the donut colours: "blue 0 35%, teal 35% 60%, ..."
  let start = 0;
  const slices = budgetPlan
    .map((b) => {
      const piece = `${b.color} ${start}% ${start + b.percent}%`;
      start += b.percent;
      return piece;
    })
    .join(", ");

  return (
    <section className={box}>
      <h2 className="mb-4 text-sm font-semibold uppercase text-blue-900">
        Budget allocation plan
      </h2>
      <div className="flex flex-wrap items-center gap-6">
        {/* The donut: a coloured circle with a white circle on top */}
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${slices})` }}
        >
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-xs text-slate-500">Total budget</span>
            <span className="text-lg font-bold">₹{TOTAL_BUDGET_CR} Cr</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm">
          {budgetPlan.map((b) => (
            <li key={b.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: b.color }}
              />
              <span className="w-24">{b.name}</span>
              <span className="tabular-nums text-slate-600">
                {b.percent}% (₹
                {((TOTAL_BUDGET_CR * b.percent) / 100).toFixed(1)} Cr)
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Demo numbers, not a real budget.
      </p>
    </section>
  );
}

/* ---------- 3. Recent / planned projects ---------- */
export function ProjectsTable() {
  const statusColor: Record<string, string> = {
    "In Progress": "#2563eb",
    Approved: "#16a34a",
    Planning: "#d97706",
  };
  return (
    <section className={box}>
      <h2 className="mb-4 text-sm font-semibold uppercase text-blue-900">
        Recent / planned projects
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="py-2 pr-3">Project</th>
              <th className="py-2 pr-3">Area</th>
              <th className="py-2 pr-3">Budget</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Impact on UIS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.name} className="border-t border-slate-100">
                <td className="py-2 pr-3">{p.name}</td>
                <td className="py-2 pr-3">{p.area}</td>
                <td className="py-2 pr-3 tabular-nums">₹{p.budgetCr} Cr</td>
                <td className="py-2 pr-3">
                  <Badge
                    text={p.status}
                    color={statusColor[p.status] ?? "#64748b"}
                  />
                </td>
                <td className="py-2 font-semibold tabular-nums text-green-700">
                  ▲ +{p.uisImpact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">Demo projects.</p>
    </section>
  );
}

/* ---------- 4. Quick reports ---------- */
export function QuickReports() {
  const reports = [
    "City overview report",
    "Infrastructure gap report",
    "Budget utilization report",
    "Projects progress report",
    "Investment impact report",
  ];
  return (
    <section className={box}>
      <h2 className="mb-4 text-sm font-semibold uppercase text-blue-900">
        Quick reports
      </h2>
      <ul className="space-y-2">
        {reports.map((r) => (
          <li
            key={r}
            className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 text-sm"
          >
            <span>{r}</span>
            <Link to="/government/reports" className="text-blue-700 underline">
              Open
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/government/reports"
        className="mt-4 block rounded bg-blue-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800"
      >
        Generate custom report
      </Link>
    </section>
  );
}