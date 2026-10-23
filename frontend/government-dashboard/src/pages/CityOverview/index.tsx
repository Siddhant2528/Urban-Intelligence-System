import { useMemo, useState } from "react";
import { areas, buildAreaUIS } from "../../services/mockData";

// Traffic-light colours: green = good, orange = okay, red = needs help
function colorFor(score: number) {
  if (score >= 70) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#dc2626";
}

export default function CitizenDashboard() {
  // Which area is picked right now
  const [areaId, setAreaId] = useState(areas[0].id);

  // Build the full report for that area
  const data = useMemo(() => buildAreaUIS(areaId), [areaId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Citizen dashboard</h1>

      {/* 1. The area picker */}
      <div>
        <label htmlFor="area" className="mb-1 block text-sm text-slate-500">
          Choose your area
        </label>
        <select
          id="area"
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-2"
        >
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Score hero */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">{data.areaName} UIS score</p>
        <div className="mt-1 flex items-end gap-2">
          <span
            className="text-6xl font-bold"
            style={{ color: colorFor(data.score) }}
          >
            {data.score}
          </span>
          <span className="pb-2 text-slate-500">/ 100</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Population: {data.population.toLocaleString()} · Method:{" "}
          {data.methodologyVersion}
          {data.isDemo && " · Demo data, not official statistics"}
        </p>
      </section>

      {/* 3. Best and weakest */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">Top strength</p>
          <p className="text-xl font-semibold text-green-900">
            {data.topStrength}
          </p>
        </section>
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">Needs the most help</p>
          <p className="text-xl font-semibold text-red-900">
            {data.areaToImprove}
          </p>
        </section>
      </div>

      {/* 4. One bar per category */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Scores by category</h2>
        <ul className="space-y-4">
          {data.indicators.map((i) => (
            <li key={i.indicatorId}>
              <div className="flex justify-between text-sm">
                <span>{i.category}</span>
                <span className="font-semibold">{i.score}</span>
              </div>
              <div className="mt-1 h-2 rounded bg-slate-100">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${i.score}%`,
                    backgroundColor: colorFor(i.score),
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Counts for {Math.round(i.weight * 100)}% of the total score
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}