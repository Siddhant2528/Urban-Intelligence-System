import { useMemo } from "react";
import {
  allAreaUIS,
  buildCityUIS,
  buildGaps,
  buildPriorities,
} from "../../services/mockData";

// Traffic-light colours: green = good, orange = okay, red = needs help
function colorFor(score: number) {
  if (score >= 70) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#dc2626";
}

// Turns a list of rows into a CSV file and downloads it
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const text = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + text], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  // Build everything once from the demo data
  const report = useMemo(() => {
    const areaList = allAreaUIS();
    return {
      areas: [...areaList].sort((a, b) => b.score - a.score),
      city: buildCityUIS(areaList),
      priorities: buildPriorities(areaList),
      gaps: [...buildGaps(areaList)].sort((a, b) => b.gap - a.gap),
    };
  }, []);

  const top10 = report.priorities.slice(0, 10);
  const today = new Date().toLocaleDateString();

  const downloadAreas = () =>
    downloadCsv("area-scores.csv", [
      ["Area", "Score", "Population", "Top strength", "Needs most help"],
      ...report.areas.map((a) => [
        a.areaName,
        a.score,
        a.population,
        a.topStrength,
        a.areaToImprove,
      ]),
    ]);

  const downloadPriorities = () =>
    downloadCsv("priorities.csv", [
      [
        "Rank",
        "Area",
        "Category",
        "Now",
        "Target",
        "Gap",
        "Severity",
        "People",
        "Context",
        "Priority",
      ],
      ...report.priorities.map((p, i) => [
        i + 1,
        p.areaName,
        p.indicator,
        p.currentScore,
        p.target,
        p.gap,
        p.severity,
        p.populationImpact,
        p.contextualFactor,
        p.priority,
      ]),
    ]);

  const downloadGaps = () =>
    downloadCsv("city-gaps.csv", [
      ["Category", "City average", "Target", "Gap"],
      ...report.gaps.map((g) => [
        g.indicator,
        g.averageScore,
        g.target,
        g.gap,
      ]),
    ]);

  const buttonStyle =
    "rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Report</h1>
          <p className="text-sm text-slate-500">
            Nashik urban index summary · {today}
          </p>
        </div>

        {/* These buttons are hidden when printing */}
        <div className="flex flex-wrap gap-2 print:hidden">
          <button onClick={downloadAreas} className={buttonStyle}>
            Download area scores
          </button>
          <button onClick={downloadPriorities} className={buttonStyle}>
            Download priorities
          </button>
          <button onClick={downloadGaps} className={buttonStyle}>
            Download gaps
          </button>
          <button
            onClick={() => window.print()}
            className="rounded bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
          >
            Print
          </button>
        </div>
      </div>

      {/* 1. City score */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Nashik city UIS score</p>
        <div className="mt-1 flex items-end gap-2">
          <span
            className="text-6xl font-bold"
            style={{ color: colorFor(report.city.score) }}
          >
            {report.city.score}
          </span>
          <span className="pb-2 text-slate-500">/ 100</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Method: {report.city.methodologyVersion}
          {report.city.isDemo && " · Demo data, not official statistics"}
        </p>
      </section>

      {/* 2. All areas */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Area scores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Population</th>
                <th className="py-2 pr-4">Top strength</th>
                <th className="py-2">Needs most help</th>
              </tr>
            </thead>
            <tbody>
              {report.areas.map((a) => (
                <tr key={a.areaId} className="border-t border-slate-100">
                  <td className="py-2 pr-4">{a.areaName}</td>
                  <td
                    className="py-2 pr-4 font-semibold"
                    style={{ color: colorFor(a.score) }}
                  >
                    {a.score}
                  </td>
                  <td className="py-2 pr-4">
                    {a.population.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{a.topStrength}</td>
                  <td className="py-2">{a.areaToImprove}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Top 10 priorities */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Top 10 priorities</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Now</th>
                <th className="py-2 pr-4">Gap</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">People</th>
                <th className="py-2 pr-4">Context</th>
                <th className="py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((p, i) => (
                <tr
                  key={`${p.areaId}-${p.indicator}`}
                  className="border-t border-slate-100"
                >
                  <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                  <td className="py-2 pr-4">{p.areaName}</td>
                  <td className="py-2 pr-4">{p.indicator}</td>
                  <td className="py-2 pr-4">{p.currentScore}</td>
                  <td className="py-2 pr-4">{p.gap}</td>
                  <td className="py-2 pr-4">{p.severity}</td>
                  <td className="py-2 pr-4">{p.populationImpact}</td>
                  <td className="py-2 pr-4">{p.contextualFactor}</td>
                  <td className="py-2 font-semibold">{p.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. City gaps */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">City gaps (average vs target)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">City average</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2">Gap</th>
              </tr>
            </thead>
            <tbody>
              {report.gaps.map((g) => (
                <tr key={g.indicator} className="border-t border-slate-100">
                  <td className="py-2 pr-4">{g.indicator}</td>
                  <td className="py-2 pr-4">{g.averageScore}</td>
                  <td className="py-2 pr-4">{g.target}</td>
                  <td className="py-2 font-semibold">{g.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Honest notes */}
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="mb-2 font-semibold">Please remember</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            These numbers are demo data, not official statistics. Do not
            publish them as real results.
          </li>
          <li>
            Priority is always shown with the factors behind it, so you can see
            why something ranks high.
          </li>
          <li>The target of 80 is a demo value and can be changed later.</li>
        </ul>
      </section>
    </div>
  );
}