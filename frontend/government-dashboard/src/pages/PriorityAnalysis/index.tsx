import { useMemo, useState } from "react";
import MapBase, { type MapMarker } from "../../maps/MapBase";
import { areas, allAreaUIS, buildPriorities } from "../../services/mockData";

// For priorities, HIGH is bad: red = urgent, orange = medium, green = low
function urgencyColor(priority: number) {
  if (priority >= 30) return "#dc2626";
  if (priority >= 15) return "#d97706";
  return "#16a34a";
}

export default function PriorityAnalysis() {
  // Which filters are picked right now ("all" means no filter)
  const [areaId, setAreaId] = useState("all");
  const [category, setCategory] = useState("all");

  // All priorities, with a rank number (1 = most urgent) added
  const ranked = useMemo(
    () =>
      buildPriorities(allAreaUIS()).map((p, i) => ({ ...p, rank: i + 1 })),
    [],
  );

  // The category names for the drop-down
  const categories = useMemo(
    () => [...new Set(ranked.map((p) => p.indicator))],
    [ranked],
  );

  // Apply the filters
  const rows = useMemo(
    () =>
      ranked.filter(
        (p) =>
          (areaId === "all" || p.areaId === areaId) &&
          (category === "all" || p.indicator === category),
      ),
    [ranked, areaId, category],
  );

  // One dot per area, coloured by its most urgent row (after filters)
  const markers: MapMarker[] = useMemo(() => {
    const worst = new Map<string, (typeof rows)[number]>();
    for (const p of rows) {
      const old = worst.get(p.areaId);
      if (!old || p.priority > old.priority) worst.set(p.areaId, p);
    }
    return [...worst.values()].map((p) => {
      const place = areas.find((a) => a.id === p.areaId)!;
      return {
        id: p.areaId,
        name: p.areaName,
        lat: place.lat,
        lng: place.lng,
        color: urgencyColor(p.priority),
        label: `${p.indicator}, priority ${p.priority}`,
        radius: 14,
      };
    });
  }, [rows]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Priority analysis</h1>

      {/* 1. Filters */}
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="mb-1 block text-sm text-slate-500">Area</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Map */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Where is help needed most?</h2>
        <MapBase markers={markers} height={320} />
        <p className="mt-2 text-xs text-slate-500">
          Each dot shows the most urgent item in that area. Red is urgent,
          orange is medium, green is low.
        </p>
      </section>

      {/* 3. Full table */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">
          All priorities ({rows.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Now</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Gap</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">People</th>
                <th className="py-2 pr-4">Context</th>
                <th className="py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={`${p.areaId}-${p.indicator}`}
                  className="border-t border-slate-100"
                >
                  <td className="py-2 pr-4 text-slate-500">{p.rank}</td>
                  <td className="py-2 pr-4">{p.areaName}</td>
                  <td className="py-2 pr-4">{p.indicator}</td>
                  <td className="py-2 pr-4">{p.currentScore}</td>
                  <td className="py-2 pr-4">{p.target}</td>
                  <td className="py-2 pr-4">{p.gap}</td>
                  <td className="py-2 pr-4">{p.severity}</td>
                  <td className="py-2 pr-4">{p.populationImpact}</td>
                  <td className="py-2 pr-4">{p.contextualFactor}</td>
                  <td
                    className="py-2 font-semibold"
                    style={{ color: urgencyColor(p.priority) }}
                  >
                    {p.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">Nothing matches.</p>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Priority is always shown with the factors behind it. Demo data, not
          official statistics.
        </p>
      </section>
    </div>
  );
}
