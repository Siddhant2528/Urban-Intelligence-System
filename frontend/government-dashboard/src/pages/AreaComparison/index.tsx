import { useMemo, useState } from "react";
import { areas, buildAreaUIS } from "../../services/mockData";

// Traffic-light colours: green = good, orange = okay, red = needs help
function colorFor(score: number) {
  if (score >= 70) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#dc2626";
}

// A small drop-down used twice (for area A and area B)
function Picker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-300 bg-white px-3 py-2"
      >
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// One thin coloured bar
function Bar({ score }: { score: number }) {
  return (
    <div className="h-2 rounded bg-slate-100">
      <div
        className="h-2 rounded"
        style={{ width: `${score}%`, backgroundColor: colorFor(score) }}
      />
    </div>
  );
}

export default function AreaComparison() {
  // The two areas picked right now
  const [idA, setIdA] = useState(areas[0].id);
  const [idB, setIdB] = useState(areas[1].id);

  // Build the full report for each
  const a = useMemo(() => buildAreaUIS(idA), [idA]);
  const b = useMemo(() => buildAreaUIS(idB), [idB]);

  // Overall difference between the two
  const diff = Math.round((a.score - b.score) * 100) / 100;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Compare areas</h1>

      {/* 1. The two pickers */}
      <div className="flex flex-wrap gap-6">
        <Picker label="First area" value={idA} onChange={setIdA} />
        <Picker label="Second area" value={idB} onChange={setIdB} />
      </div>

      {idA === idB && (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You picked the same area twice. Choose two different areas to see a
          real comparison.
        </p>
      )}

      {/* 2. The two big scores */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[a, b].map((x) => (
          <section
            key={x.areaId}
            className="rounded-lg border border-slate-200 bg-white p-6"
          >
            <p className="text-sm text-slate-500">{x.areaName}</p>
            <div className="mt-1 flex items-end gap-2">
              <span
                className="text-5xl font-bold"
                style={{ color: colorFor(x.score) }}
              >
                {x.score}
              </span>
              <span className="pb-1 text-slate-500">/ 100</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Population: {x.population.toLocaleString()}
            </p>
          </section>
        ))}
      </div>

      {/* 3. Who is ahead overall */}
      <p className="text-sm text-slate-700">
        {diff === 0
          ? "Both areas have the same overall score."
          : `${diff > 0 ? a.areaName : b.areaName} is ahead overall by ${Math.abs(diff)} points.`}
      </p>

      {/* 4. Category by category */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Category by category</h2>
        <ul className="space-y-6">
          {a.indicators.map((ind, i) => {
            const other = b.indicators[i];
            const gap = Math.round((ind.score - other.score) * 100) / 100;
            return (
              <li key={ind.indicatorId}>
                <p className="mb-2 text-sm font-medium">{ind.category}</p>

                <div className="mb-1 flex justify-between text-xs">
                  <span>{a.areaName}</span>
                  <span className="font-semibold">{ind.score}</span>
                </div>
                <Bar score={ind.score} />

                <div className="mb-1 mt-2 flex justify-between text-xs">
                  <span>{b.areaName}</span>
                  <span className="font-semibold">{other.score}</span>
                </div>
                <Bar score={other.score} />

                <p className="mt-1 text-xs text-slate-500">
                  {gap === 0
                    ? "Tie"
                    : `${gap > 0 ? a.areaName : b.areaName} leads by ${Math.abs(gap)}`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {a.isDemo && (
        <p className="text-xs text-slate-500">
          Demo data, not official statistics.
        </p>
      )}
    </div>
  );
}