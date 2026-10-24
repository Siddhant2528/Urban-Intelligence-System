import { NavLink, Outlet } from "react-router-dom";

const link = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 font-semibold">UIS Nashik</span>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={link}>City overview</NavLink>
            <NavLink to="/citizen" className={link}>Citizen</NavLink>
            <NavLink to="/compare" className={link}>Compare areas</NavLink>
            <span className="mx-2 w-px bg-slate-300" />
            <NavLink to="/government" end className={link}>Government</NavLink>
            <NavLink to="/government/priorities" className={link}>Priorities</NavLink>
            <NavLink to="/government/simulation" className={link}>Simulation</NavLink>
            <NavLink to="/government/reports" className={link}>Reports</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6"><Outlet /></main>
      {import.meta.env.VITE_USE_MOCK === "true" && (
        <footer className="px-4 pb-6 text-center text-xs text-slate-500">
          Demo data for development. Not official statistics.
        </footer>
      )}
    </div>
  );
}
