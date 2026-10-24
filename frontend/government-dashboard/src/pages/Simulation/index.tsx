import { useMemo, useState } from "react";
import {
  areas,
  allAreaUIS,
  buildAreaUIS,
  buildCityUIS,
} from "../../services/mockData";
import { round2 } from "../../utils/uis";

// Traffic-light colours: green = good, orange = okay, red = needs help
function colorFor(score: number) {
  if (score >= 70) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#dc2626";
}

// Shows "+3.2" in green, "-1" in red, or "no change"
function Change({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-500">no change</span>;
  return (
    <span style={{ color: value > 0 ? "#16a34a" : "#dc2626" }}>
      {value > 0 ? "+" : ""}
      {value}
    </span>
  );
}

export default function Simulation() {
  // What the person picked
  const [areaId, setAreaId] = useState(areas[0].id);
  const [indicatorId, setIndicatorId] = useState("health");
  const [improvement, setImprovement] = useState(10);

  // The list of categories for the drop-down
  const categories = useMemo(
    () =>
      buildAreaUIS(areas[0].id).indicators.map((i) => ({
        id: i.indicatorId,
        name: i.category,
      })),
    [],
  );

  // Work out "before" and "after"
  const result = useMemo(() => {
    const before = buildAreaUIS(areaId);
    const current = before.indicators.find(
      (i) => i.indicatorId === indicatorId,
    )!.score;

    // A score can never go above 100
    const newScore = Math.min(100, current + improvement);
    const override = { [areaId]: { [indicatorId]: newScore } };

    return {
      current,
      newScore,
      before,
      after: buildAreaUIS(areaId, { [indicatorId]: newScore }),
      cityBefore: buildCityUIS(allAreaUIS()).score,
      cityAfter: buildCityUIS(allAreaUIS(override)).score,
    };
  }, [areaId, indicatorId, improvement]);

  const categoryName =
    categories.find((c) => c.id === indicatorId)?.name ?? "";
  const areaChange = round2(result.after.score - result.before.score);
  const cityChange = round2(result.cityAfter - result.cityBefore);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Simulation</h1>
      <p className="text-sm text-slate-600">
        Pick an area and a category, then raise its score to see what would
        change. Nothing is saved.
      </p>

      {/* 1. The controls */}
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="mb-1 block text-sm text-slate-500">Area</label>
            <select
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
          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Category to improve
            </label>
            <select
              value={indicatorId}
              onChange={(e) => setIndicatorId(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-500">
            Improvement: <span className="font-semibold">+{improvement}</span>{" "}
            points
          </label>
          <input
            type="range"
            min={0}
            max={30}
            value={improvement}
            onChange={(e) => setImprovement(Number(e.target.value))}
            className="w-full max-w-md"
          />
          <p className="mt-1 text-xs text-slate-500">
            {categoryName} in {result.before.areaName}: {result.current} →{" "}
            {result.newScore}
            {result.newScore === 100 && " (the top: scores stop at 100)"}
          </p>
        </div>
      </section>

      {/* 2. Before and after */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            {result.before.areaName} score
          </p>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-2xl text-slate-400">
              {result.before.score}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className="text-5xl font-bold"
              style={{ color: colorFor(result.after.score) }}
            >
              {result.after.score}
            </span>
          </div>
          <p className="mt-2 text-sm">
            <Change value={areaChange} /> points
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Whole city score</p>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-2xl text-slate-400">
              {result.cityBefore}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className="text-5xl font-bold"
              style={{ color: colorFor(result.cityAfter) }}
            >
              {result.cityAfter}
            </span>
          </div>
          <p className="mt-2 text-sm">
            <Change value={cityChange} /> points
          </p>
        </section>
      </div>

      <p className="text-sm text-slate-700">
        People in this area:{" "}
        <span className="font-semibold">
          {result.before.population.toLocaleString()}
        </span>
      </p>

      {/* 3. Honest notes */}
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="mb-2 font-semibold">Please remember</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            The change is applied directly to the category score. It does not
            say how much money or time it takes.
          </li>
          <li>Other categories are kept the same.</li>
          <li>
            The city score is weighted by population, so a big area moves it
            more.
          </li>
          <li>Demo data, not official statistics.</li>
        </ul>
      </section>
    </div>
  );
}