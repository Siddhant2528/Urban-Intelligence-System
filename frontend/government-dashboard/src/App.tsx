import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CityOverview from "./pages/CityOverview";
import CitizenDashboard from "./pages/CitizenDashboard";
import AreaAnalysis from "./pages/AreaAnalysis";
import AreaComparison from "./pages/AreaComparison";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import PriorityAnalysis from "./pages/PriorityAnalysis";
import Simulation from "./pages/Simulation";
import Reports from "./pages/Reports";

// TODO (Dev B): wrap the /government routes in a role-based guard once auth exists.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CityOverview />} />
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/area/:id" element={<AreaAnalysis />} />
        <Route path="/compare" element={<AreaComparison />} />
        <Route path="/government" element={<GovernmentDashboard />} />
        <Route path="/government/priorities" element={<PriorityAnalysis />} />
        <Route path="/government/simulation" element={<Simulation />} />
        <Route path="/government/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
