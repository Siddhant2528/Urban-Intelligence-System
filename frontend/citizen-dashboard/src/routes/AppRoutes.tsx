import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AboutPage from '../pages/AboutPage'
import AreaAnalysisPage from '../pages/AreaAnalysisPage'
import CityOverviewPage from '../pages/CityOverviewPage'
import HomePage from '../pages/HomePage'
import IndicatorDetailPage from '../pages/IndicatorDetailPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<CityOverviewPage />} path="city" />
          <Route element={<AreaAnalysisPage />} path="area/:id" />
          <Route element={<IndicatorDetailPage />} path="area/:id/indicator/:indicatorId" />
          <Route element={<AboutPage />} path="about" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes