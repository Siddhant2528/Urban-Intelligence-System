import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AboutPage from '../pages/AboutPage'
import AreaAnalysisPage from '../pages/AreaAnalysisPage'
import CityOverviewPage from '../pages/CityOverviewPage'
import HomePage from '../pages/HomePage'
import IndicatorDetailPage from '../pages/IndicatorDetailPage'

function AreaAnalysisRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate replace to={id ? `/area/${id}` : '/area/cidco'} />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<CityOverviewPage />} path="city" />
          <Route element={<AreaAnalysisPage />} path="area/:id" />
          <Route element={<AreaAnalysisRedirect />} path="area-analysis" />
          <Route element={<AreaAnalysisRedirect />} path="area-analysis/:id" />
          <Route element={<IndicatorDetailPage />} path="area/:id/indicator/:indicatorId" />
          <Route element={<AboutPage />} path="about" />
          <Route element={<Navigate replace to="/city" />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes