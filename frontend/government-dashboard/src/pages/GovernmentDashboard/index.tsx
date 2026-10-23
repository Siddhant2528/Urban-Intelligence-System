import {
  BudgetPlan,
  GapAnalysis,
  ProjectsTable,
  QuickReports,
} from "../../components/GovernmentPanels";
import { Link } from "react-router-dom";
import MapBase, { type MapMarker } from "../../maps/MapBase";
import { useAsync } from "../../hooks/useAsync";
import { areas } from "../../services/mockData";
import { getGovernmentDashboard } from "../../services/api";
import { colorFor } from "../../utils/colors";

export default function GovernmentDashboard() {
  // Ask api.ts for the data (demo data or the real server)
  const { data, loading, error } = useAsync(getGovernmentDashboard);

  // 1. Loading
  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  // 2. Error
  if (error || !data) {
    return (
      <p className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        Could not load the dashboard{error ? `: ${error}` : ""}. Start the
        backend, or set VITE_USE_MOCK=true in your .env file and restart.
      </p>
    );
  }
        
  // Turn each area into a dot on the map
  const markers: MapMarker[] = data.city.areas.map((a) => {
    const geo = areas.find((x) => x.id === a.areaId)!;
    return {
      id: a.areaId,
      name: a.areaName,
      lat: geo.lat,
      lng: geo.lng,
      color: colorFor(a.score),
      label: `Area UIS ${a.score}`,
    };
  });

  const top = data.priorities.slice(0, 5);
  // Biggest gap first
  const gaps = [...data.gaps].sort((a, b) => b.gap - a.gap);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Government dashboard</h1>

      {/* City score */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          City UIS (population-weighted)
        </p>
        <div className="mt-1 flex items-end gap-2">
          <span
            className="text-6xl font-bold"
            style={{ color: colorFor(data.city.score) }}
          >
            {data.city.score}
          </span>
          <span className="pb-2 text-slate-500">/ 100</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Methodology {data.city.methodologyVersion}
          {data.city.isDemo && " · Demo data, not official statistics"}
        </p>
      </section>
{/* Gap analysis + budget */}
      <div className="grid gap-6 md:grid-cols-2">
        <GapAnalysis gaps={data.gaps} />
        <BudgetPlan />
      </div>

      {/* Projects + quick reports */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ProjectsTable />
        <QuickReports />
      </div>
      
      {/* Map + top priorities */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <MapBase markers={markers} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-semibold">Top priorities</h2>
            <Link
              to="/government/priorities"
              className="text-sm text-blue-700 underline"
            >
              See all
            </Link>
          </div>
          <ol className="space-y-3 text-sm">
            {top.map((p) => (
              <li key={`${p.areaId}-${p.indicator}`}>
                <div className="flex justify-between gap-3">
                  <span>
                    {p.areaName}: {p.indicator}
                  </span>
                  <span className="tabular-nums">
                    gap {p.gap}, priority{" "}
                    <span className="font-semibold">{p.priority}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Severity {p.severity} · People {p.populationImpact} · Context{" "}
                  {p.contextualFactor}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* City gaps */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">City gaps against target</h2>
        <ul className="space-y-4">
          {gaps.map((g) => (
            <li key={g.indicator}>
              <div className="flex justify-between text-sm">
                <span>{g.indicator}</span>
                <span className="tabular-nums">
                  <span className="font-semibold">{g.averageScore}</span>
                  <span className="text-slate-500">
                    {" "}
                    / {g.target} · gap {g.gap}
                  </span>
                </span>
              </div>
              <div className="relative mt-1 h-2 rounded bg-slate-100">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${g.averageScore}%`,
                    backgroundColor: colorFor(g.averageScore),
                  }}
                />
                {/* Thin line marking the target */}
                <div
                  className="absolute top-[-3px] h-[14px] w-px bg-slate-900"
                  style={{ left: `${g.target}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          The black line marks the target.
        </p>
      </section>
    </div>
  );
}