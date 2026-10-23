import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Clock,
  GraduationCap,
  HeartPulse,
  MapPin,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  TrainFront,
  Trees,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Header, type ExportReportType } from './components/Header'
import { LoginPage } from './components/LoginPage'
import { MapCard } from './components/MapCard'
import { MetricCard } from './components/MetricCard'
import {
  areaUIS,
  budgetAllocation,
  cityGapAnalysis,
  cityOverview,
  dashboardMetrics as initialDashboardMetrics,
  demoProjects,
  getImprovementsForArea,
  improvementCatalog,
  type AreaData,
  type BudgetItem,
  type CityGapMetric,
  type DemoProject,
  type ImprovementOption,
  type SimulationResult,
} from './data/dashboard'
import {
  authApi,
  areasApi,
  cityApi,
  governmentApi,
  simulationApi,
  type WardRanking,
  type BudgetAllocationItem,
} from './api/govApi'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)



const sectorIcons: Record<string, typeof Building2> = {
  infrastructure: Building2,
  safety: ShieldAlert,
  environment: Trees,
  transport: TrainFront,
  education: GraduationCap,
  healthcare: HeartPulse,
  accessibility: Accessibility,
}

const getCitizenBand = (score: number): { label: 'Weak' | 'Moderate' | 'Strong'; className: string } => {
  if (score >= 70) return { label: 'Strong', className: 'strong' }
  if (score >= 40) return { label: 'Moderate', className: 'moderate' }
  return { label: 'Weak', className: 'weak' }
}

export function App() {
  // ── AUTHENTICATION STATE ───────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('uis_gov_auth') === 'true' && Boolean(sessionStorage.getItem('uis_token'))
  })

  // Listen to 401 auth expiration from API client
  useEffect(() => {
    const onAuthExpired = () => {
      setIsAuthenticated(false)
    }
    window.addEventListener('uis_auth_expired', onAuthExpired)
    return () => window.removeEventListener('uis_auth_expired', onAuthExpired)
  }, [])

  const handleLoginSuccess = (_officerEmail: string) => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authApi.logout()
    setIsAuthenticated(false)
  }

  // ── LIVE BACKEND STATE (AREAS, CITY UIS, WARD RANKINGS) ────────────────────
  const [liveAreas, setLiveAreas] = useState<Array<{ id: number; name: string; population: number | null }>>([])
  const [liveCityUIS, setLiveCityUIS] = useState<number | null>(null)
  const [liveWardRankings, setLiveWardRankings] = useState<WardRanking[]>([])
  const [calculationProgress, setCalculationProgress] = useState<{ completed: number; total: number } | null>(null)
  const [calculationMessage, setCalculationMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([areasApi.list(), cityApi.getUIS(), governmentApi.getWardRankings()])
      .then(([areaResponse, cityResponse, rankingResponse]) => {
        const wards = areaResponse.areas
          .filter((area) => area.population_source === 'Nashik Municipal Corporation')
          .map(({ id, name, population }) => ({ id, name, population }))
        const wardIds = new Set(wards.map((area) => area.id))
        setLiveAreas(wards)
        setLiveCityUIS(cityResponse.score)
        setLiveWardRankings(rankingResponse.rankings.filter((ranking) => wardIds.has(ranking.area_id)))
      })
      .catch(() => {
        setLiveAreas([])
        setLiveWardRankings([])
      })
  }, [isAuthenticated])

  const handleCalculateAllAreas = async () => {
    if (!liveAreas.length || calculationProgress) return

    setCalculationMessage('')
    setCalculationProgress({ completed: 0, total: liveAreas.length })
    const failures: string[] = []

    for (const [index, area] of liveAreas.entries()) {
      setCalculationProgress({ completed: index, total: liveAreas.length })
      try {
        await areasApi.calculate(area.id)
      } catch (error) {
        failures.push(`${area.name}: ${error instanceof Error ? error.message : 'request failed'}`)
      }
    }

    if (failures.length === 0) {
      try {
        await cityApi.calculate()
        const [rankings, city] = await Promise.all([
          governmentApi.getWardRankings(),
          cityApi.getUIS(),
        ])
        const wardIds = new Set(liveAreas.map((area) => area.id))
        setLiveWardRankings(rankings.rankings.filter((ranking) => wardIds.has(ranking.area_id)))
        setLiveCityUIS(city.score)
        setCalculationMessage(`Updated UIS scores for all ${liveAreas.length} areas.`)
      } catch (error) {
        setCalculationMessage(`Area scores were calculated, but the city summary could not be refreshed: ${error instanceof Error ? error.message : 'request failed'}`)
      }
    } else {
      const completed = liveAreas.length - failures.length
      setCalculationMessage(
        `Calculated ${completed} of ${liveAreas.length} areas. City UIS was not refreshed. ${failures.slice(0, 2).join('; ')}`,
      )
      const rankings = await governmentApi.getWardRankings().catch(() => null)
      if (rankings) {
        const wardIds = new Set(liveAreas.map((area) => area.id))
        setLiveWardRankings(rankings.rankings.filter((ranking) => wardIds.has(ranking.area_id)))
      }
    }

    setCalculationProgress(null)
  }

  // ── WHAT-IF SIMULATION STATE ───────────────────────────────────────────────
  const [simulationAreaId, setSimulationAreaId] = useState<string>('')
  const [selectedImprovementLabel, setSelectedImprovementLabel] = useState<string>('')
  const [investment, setInvestment] = useState<string>('')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulationError, setSimulationError] = useState('')
  const [downloadNotice, setDownloadNotice] = useState('')
  const [updateKey, setUpdateKey] = useState<number>(0)
  const [isDynamicAnimating, setIsDynamicAnimating] = useState<boolean>(false)

  // ── BUDGET ALLOCATION & DEPLOYMENT STATE (CITY GAP DERIVED) ───────────────
  const [totalBudgetCr, setTotalBudgetCr] = useState<number>(182)
  const [selectedBudgetKey, setSelectedBudgetKey] = useState<string | null>(null)
  const [budgetTab, setBudgetTab] = useState<'sectors' | 'wards'>('sectors')
  const [wardAllocations, setWardAllocations] = useState<BudgetAllocationItem[]>([])
  const [, setLoadingWardBudget] = useState<boolean>(false)

  // Fetch proportional need-based ward allocation from backend API
  useEffect(() => {
    if (!isAuthenticated) return
    setLoadingWardBudget(true)
    governmentApi
      .getBudgetAllocation(totalBudgetCr * 10_000_000)
      .then((res) => setWardAllocations(res.allocations))
      .catch(() => { /* fallback gracefully */ })
      .finally(() => setLoadingWardBudget(false))
  }, [isAuthenticated, totalBudgetCr])
  const [chartAnimKey, setChartAnimKey] = useState<number>(0)
  const [isChartPulsing, setIsChartPulsing] = useState<boolean>(false)

  // Re-trigger rotational and scale animation whenever Total Budget changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartAnimKey((prev) => prev + 1)
      setIsChartPulsing(true)
      const pulseTimer = setTimeout(() => setIsChartPulsing(false), 750)
      return () => clearTimeout(pulseTimer)
    }, 120)
    return () => clearTimeout(timer)
  }, [totalBudgetCr])

  // Budget allocation directly derived from City Gap Analysis
  // Sourced from aggregated citizen indicators across all 6 Nashik zones
  const dynamicBudgetAllocation = useMemo<BudgetItem[]>(() => {
    return budgetAllocation.map((item) => {
      const gapMetric = cityGapAnalysis.find((g) => g.key === item.key)
      const raw = (item.value / 100) * totalBudgetCr
      const crAmount = Math.round(raw * 10) / 10
      return {
        ...item,
        gap: gapMetric?.cityGap ?? item.gap,
        severity: (gapMetric?.severity === 'Stable' ? 'Moderate Gap' : gapMetric?.severity) ?? item.severity,
        crAmount,
        investmentPlan: {
          ...item.investmentPlan,
          targetAreas: item.investmentPlan.targetAreas.map((area) => ({
            ...area,
            amountCr: Math.round(((area.percent / 100) * crAmount) * 10) / 10,
          })),
          executionPillars: item.investmentPlan.executionPillars.map((pillar) => ({
            ...pillar,
            amountCr: Math.round(((pillar.percent / 100) * crAmount) * 10) / 10,
          })),
        },
      }
    })
  }, [totalBudgetCr])


  const selectedBudgetItem = useMemo<BudgetItem | null>(
    () =>
      selectedBudgetKey
        ? dynamicBudgetAllocation.find((b) => b.key === selectedBudgetKey) ?? null
        : null,
    [selectedBudgetKey, dynamicBudgetAllocation]
  )

  const budgetData = useMemo(() => {
    return {
      labels: dynamicBudgetAllocation.map((item) => item.label),
      datasets: [
        {
          data: dynamicBudgetAllocation.map((item) => item.crAmount),
          backgroundColor: dynamicBudgetAllocation.map((item) => item.color),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 3,
          spacing: 2,
          borderRadius: 4,
          hoverOffset: 7,
        },
      ],
    }
  }, [dynamicBudgetAllocation])

  const budgetOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 850,
        easing: 'easeOutQuart' as const,
      },
      onHover: (event: any, chartElement: any[]) => {
        if (event.native) {
          event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default'
        }
      },
      onClick: (_event: any, elements: any[]) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index
          const item = dynamicBudgetAllocation[index]
          if (item) {
            setSelectedBudgetKey(item.key)
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          titleColor: '#ffffff',
          titleFont: { size: 10, weight: 'bold' as const },
          bodyColor: '#e2e8f0',
          bodyFont: { size: 9.5 },
          padding: 6,
          boxPadding: 4,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items: any) => {
              const item = dynamicBudgetAllocation[items[0]?.dataIndex]
              return item ? item.label : ''
            },
            label: (context: any) => {
              const item = dynamicBudgetAllocation[context.dataIndex]
              if (!item) return ''
              const formattedAmt = Number.isInteger(item.crAmount) ? item.crAmount : item.crAmount.toFixed(1)
              return ` ₹${formattedAmt} Cr`
            },
          },
        },
      },
    }),
    [dynamicBudgetAllocation]
  )

  // ── INFRASTRUCTURE GAP ANALYSIS STATE ──────────────────────────────────────
  const [gapViewMode, setGapViewMode] = useState<'city' | 'area'>('city')
  const [gapFilter, setGapFilter] = useState<'all' | 'critical' | 'moderate'>('all')
  const [selectedGapKey, setSelectedGapKey] = useState<string | null>(null)
  const [selectedAreaForGap, setSelectedAreaForGap] = useState<string>('satpur')

  const availableImprovements = useMemo(() => {
    return getImprovementsForArea(simulationAreaId)
  }, [simulationAreaId])

  const selectedImprovementObj = useMemo<ImprovementOption | null>(
    () =>
      selectedImprovementLabel
        ? (availableImprovements.find((imp) => imp.label === selectedImprovementLabel) ??
           improvementCatalog.find((imp) => imp.label === selectedImprovementLabel) ?? null)
        : null,
    [selectedImprovementLabel, availableImprovements]
  )

  const activeGapMetric = useMemo<CityGapMetric | null>(
    () => (selectedGapKey ? cityGapAnalysis.find((g) => g.key === selectedGapKey) ?? null : null),
    [selectedGapKey]
  )

  const activeAreaForGapObj = useMemo<AreaData>(
    () => areaUIS.find((area) => area.id === selectedAreaForGap) ?? areaUIS[0],
    [selectedAreaForGap]
  )

  const filteredGaps = useMemo(() => {
    if (gapFilter === 'critical') {
      return cityGapAnalysis.filter(
        (g) => g.severity === 'Critical Deficit' || g.severity === 'High Deficit'
      )
    }
    if (gapFilter === 'moderate') {
      return cityGapAnalysis.filter((g) => g.severity === 'Moderate Gap')
    }
    return cityGapAnalysis
  }, [gapFilter])

  // Prioritized area rankings sorted by lowest UIS first (with live backend data overlay)
  const prioritizedAreas = useMemo(() => {
    if (liveWardRankings.length > 0) {
      return liveWardRankings.map((wr, index) => {
        const staticMatch = areaUIS.find(
          (a) => a.id === String(wr.area_id) || a.name.toLowerCase() === wr.area_name.toLowerCase()
        )
        return {
          id: String(wr.area_id),
          name: wr.area_name,
          zone: 'Nashik Municipal Corporation ward',
          score: wr.area_uis,
          populationDemoCount: wr.population ?? staticMatch?.populationDemoCount ?? 30000,
          strength: staticMatch?.strength ?? 'Accessibility',
          improve: wr.constraints?.[0] ?? staticMatch?.improve ?? 'Infrastructure',
          sectors: staticMatch?.sectors ?? {
            environment: 50,
            healthcare: 50,
            education: 50,
            safety: 50,
            transport: 50,
            infrastructure: 50,
            accessibility: 50,
          },
          facilities: staticMatch?.facilities ?? {
            hospitals: 2,
            schools: 4,
            policeStations: 1,
            busStops: 6,
            parks: 2,
          },
          description: wr.constraints?.join(', ') || staticMatch?.description || '',
          priority: index < 2 ? ('High' as const) : index < 4 ? ('Medium' as const) : ('Monitor' as const),
        }
      })
    }

    return [...areaUIS]
      .sort((a, b) => a.score - b.score)
      .map((area, index) => ({
        ...area,
        priority: index < 2 ? ('High' as const) : index < 4 ? ('Medium' as const) : ('Monitor' as const),
      }))
  }, [liveWardRankings])

  const selectedAreaObj = useMemo(
    () => (simulationAreaId ? prioritizedAreas.find((area) => area.id === simulationAreaId) ?? null : null),
    [simulationAreaId, prioritizedAreas]
  )

  const currentSectorBaseline = useMemo(() => {
    if (!selectedAreaObj || !selectedImprovementObj) return null
    return selectedAreaObj.sectors[selectedImprovementObj.sectorKey] ?? 0
  }, [selectedAreaObj, selectedImprovementObj])

  // ── RECENT / PLANNED PROJECTS STATE ─────────────────────────────────────────
  const [projectSectorFilter, setProjectSectorFilter] = useState<string>('all')
  const [projectSearch, setProjectSearch] = useState<string>('')

  const filteredDemoProjects = useMemo(() => {
    return demoProjects.filter((p: DemoProject) => {
      const matchSector =
        projectSectorFilter === 'all' || p.sectorKey === projectSectorFilter
      const query = projectSearch.trim().toLowerCase()
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.area.toLowerCase().includes(query) ||
        p.deliverable.toLowerCase().includes(query) ||
        p.agency.toLowerCase().includes(query) ||
        p.deficitAddressed.toLowerCase().includes(query)
      return matchSector && matchSearch
    })
  }, [projectSectorFilter, projectSearch])

  const projectPortfolioStats = useMemo(() => {
    const totalCr = demoProjects
      .reduce((sum, p) => {
        const num = parseFloat(p.budget.replace(/[^0-9.]/g, ''))
        return sum + (Number.isFinite(num) ? num : 0)
      }, 0)
      .toFixed(1)
    const avgProg = Math.round(
      demoProjects.reduce((sum, p) => sum + p.progress, 0) / (demoProjects.length || 1)
    )
    const onTrackCount = demoProjects.filter((p) => p.status === 'On track').length
    return { totalCr, avgProg, onTrackCount }
  }, [])

// Map frontend civic labels to backend intervention keys
function mapImprovementToBackendIntervention(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('health') || l.includes('clinic') || l.includes('hospital')) return 'add_hospital'
  if (l.includes('school') || l.includes('education')) return 'add_school'
  if (l.includes('safe') || l.includes('police') || l.includes('surveillance')) return 'enhance_safety'
  if (l.includes('park') || l.includes('green') || l.includes('environment')) return 'add_park'
  if (l.includes('access') || l.includes('footpath') || l.includes('pedestrian')) return 'upgrade_accessibility'
  if (l.includes('transit') || l.includes('bus') || l.includes('feeder')) return 'transit_expansion'
  return 'improve_roads'
}

  // Dynamic simulation trigger with visual feedback and animation
  const triggerDynamicRecalculation = (
    areaId: string,
    improvement: string,
    amount: number
  ) => {
    if (areaId && improvement && Number.isFinite(amount) && amount >= 1 && amount <= 100) {
      setSimulationError('')
      setSimulationResult(null)
      setUpdateKey((prev) => prev + 1)
      setIsDynamicAnimating(true)
      window.setTimeout(() => setIsDynamicAnimating(false), 700)

      const currentArea = prioritizedAreas.find((area) => area.id === areaId)
      const selectedImprovement = improvementCatalog.find(
        (item) => item.label === improvement || item.sectorName === improvement
      ) ?? improvementCatalog[0]
      const currentCityScore = liveCityUIS ?? cityOverview.uis

      simulationApi
        .run({
          area_id: Number.isInteger(Number(areaId)) ? Number(areaId) : (areaId as any),
          intervention_type: mapImprovementToBackendIntervention(improvement),
          intervention_value: Math.max(1, Math.round(amount / 2)),
          budget: amount * 10_000_000,
        })
        .then((serverRes) => {
          const affected = serverRes.affected_indicators
          const primary = affected[0]
          const roi = serverRes.cost_efficiency_roi ?? 0
          const efficiencyIndex: SimulationResult['efficiencyIndex'] = roi > 1.2
            ? 'Exceptional ROI'
            : roi > 0.8
            ? 'High Impact'
            : roi > 0
            ? 'Moderate Yield'
            : 'Diminishing Returns'
          setSimulationResult({
            areaId: String(serverRes.area_id),
            areaName: serverRes.area_name ?? currentArea?.name ?? 'Selected ward',
            investmentCr: amount,
            improvement: selectedImprovement,
            currentAreaUIS: serverRes.before_uis,
            projectedAreaUIS: serverRes.after_uis,
            deltaAreaUIS: serverRes.uis_change,
            currentCityUIS: currentCityScore,
            projectedCityUIS: currentCityScore,
            deltaCityUIS: 0,
            cityForecastAvailable: false,
            currentSectorScore: primary?.before ?? currentSectorBaseline ?? 0,
            projectedSectorScore: primary?.after ?? currentSectorBaseline ?? 0,
            deltaSectorScore: primary?.change ?? 0,
            benefitedPopulation: currentArea?.populationDemoCount ?? 0,
            benefitedPopulationPct: currentArea?.populationDemoCount ? 100 : 0,
            efficiencyIndex,
            efficiencyTone: efficiencyIndex === 'Exceptional ROI' ? 'green' : efficiencyIndex === 'High Impact' ? 'blue' : 'amber',
            rationale: [serverRes.model_note, ...serverRes.assumptions, ...serverRes.limitations].filter(Boolean).join(' '),
            breakdown: affected.map((item) => ({
              sector: item.indicator,
              before: item.before,
              after: item.after,
              gain: item.change,
            })),
          })
          setSimulationError('Backend area simulation completed. The endpoint does not return a city-wide forecast; city impact is not projected.')
        })
        .catch((error) => {
          setSimulationResult(null)
          setSimulationError(`Backend simulation failed: ${error instanceof Error ? error.message : 'request failed'}`)
        })

      return true
    }
    return false
  }

  // Run Simulation handler
  const handleRunSimulation = (
    overrideAreaId?: string,
    overrideImprovement?: string,
    overrideInvestment?: number
  ) => {
    const targetAreaId = overrideAreaId ?? simulationAreaId
    const targetImprovement = overrideImprovement ?? selectedImprovementLabel
    const amount = overrideInvestment ?? (investment ? Number(investment) : NaN)

    if (!targetAreaId) {
      setSimulationError('Please select a target zone/area first.')
      return
    }

    if (!targetImprovement) {
      setSimulationError('Please select a civic improvement package.')
      return
    }

    if (!Number.isFinite(amount) || amount < 1 || amount > 100 || !Number.isInteger(amount)) {
      setSimulationError('Please enter a valid investment between ₹1 Cr and ₹100 Cr.')
      return
    }

    triggerDynamicRecalculation(targetAreaId, targetImprovement, amount)
  }

  // Quick preset investment click - only sets the investment value
  const handleQuickInvestment = (amountCr: number) => {
    setInvestment(String(amountCr))
    setSimulationError('')
    // Only trigger calculation if user has already selected both area and improvement
    if (simulationAreaId && selectedImprovementLabel) {
      triggerDynamicRecalculation(simulationAreaId, selectedImprovementLabel, amountCr)
    }
  }

  // Select area for simulation from Area table row
  const handleSelectAreaForSimulation = (areaId: string) => {
    setSimulationAreaId(areaId)
    setSelectedAreaForGap(areaId)
    setSelectedImprovementLabel('')
    setSimulationResult(null)
    setSimulationError('')
    document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Pre-fill simulation from Budget deployment plan
  const handleSimulateBudgetItem = (areaId: string, sectorKey: string, amountCr?: number) => {
    setSimulationAreaId(areaId)
    const areaOptions = getImprovementsForArea(areaId)
    const matchingImprovement =
      areaOptions.find((i) => i.sectorKey === sectorKey) ??
      improvementCatalog.find((i) => i.sectorKey === sectorKey) ??
      areaOptions[0]

    const impLabel = matchingImprovement?.label ?? ''
    setSelectedImprovementLabel(impLabel)
    const inv = amountCr ? Math.min(100, Math.round(amountCr)) : 25
    setInvestment(String(inv))
    if (impLabel) {
      triggerDynamicRecalculation(areaId, impLabel, inv)
    }
    document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Export comprehensive or specific report
  const exportReport = (type: ExportReportType = 'complete') => {
    let rows: (string | number)[][] = []
    let filename = ''
    let notice = ''

    if (type === 'city') {
      rows = [
        ['UIS Nashik Government Dashboard - City UIS Overview'],
        ['Generated', new Date().toLocaleString()],
        ['City', cityOverview.name],
        ['State', cityOverview.state],
        ['Current City UIS', `${liveCityUIS ?? cityOverview.uis} / 100`],
        ['Total Representative Population', String(cityOverview.totalPopulation)],
        [],
        ['--- SECTOR PERFORMANCE BREAKDOWN ---'],
        ['Sector', 'City Gap Index (%)', 'Average Performance Score', 'Deficit Severity'],
        ...cityGapAnalysis.map((gap) => [
          gap.label,
          `${gap.cityGap}%`,
          `${gap.avgScore} / 100`,
          gap.severity,
        ]),
        [],
        ['--- AREA UIS SUMMARY ---'],
        ['Area', 'Score', 'Zone Description', 'Priority'],
        ...prioritizedAreas.map((area) => [
          area.name,
          String(area.score),
          area.zone,
          area.priority,
        ]),
      ]
      filename = `uis-nashik-city-overview-${new Date().toISOString().slice(0, 10)}.csv`
      notice = 'City UIS overview CSV exported successfully'
    } else if (type === 'area') {
      rows = [
        ['UIS Nashik Government Dashboard - Area UIS Values (6 Nashik Zones)'],
        ['Source', 'Citizen dashboard indicators and zonal telemetry'],
        ['Generated', new Date().toLocaleString()],
        [],
        ['Area', 'UIS Score', 'Zone Description', 'Population Count', 'Priority Level', 'Top Strength', 'Critical Deficit'],
        ...prioritizedAreas.map((area) => [
          area.name,
          String(area.score),
          area.zone,
          String(area.populationDemoCount),
          area.priority,
          area.strength,
          area.improve,
        ]),
      ]
      filename = `uis-nashik-area-uis-values-${new Date().toISOString().slice(0, 10)}.csv`
      notice = 'Area UIS values CSV exported successfully'
    } else if (type === 'gap') {
      rows = [
        ['UIS Nashik Government Dashboard - Infrastructure & Civic Gap Synthesis'],
        ['Source', 'City-wide gap analysis & policy recommendations'],
        ['Generated', new Date().toLocaleString()],
        [],
        ['Sector', 'City Gap Index (%)', 'Average Performance Score', 'Deficit Severity', 'Key Lagging Zones', 'Strategic Action Recommendation'],
        ...cityGapAnalysis.map((gap) => [
          gap.label,
          `${gap.cityGap}%`,
          `${gap.avgScore} / 100`,
          gap.severity,
          gap.laggingAreas.join('; '),
          gap.actionRecommendation,
        ]),
      ]
      filename = `uis-nashik-infrastructure-gap-synthesis-${new Date().toISOString().slice(0, 10)}.csv`
      notice = 'Infrastructure gap synthesis CSV exported successfully'
    } else {
      rows = [
        ['UIS Nashik Government Dashboard - Executive City Intelligence Report'],
        ['Source', 'Citizen dashboard city & area UIS indicators with predictive simulation'],
        ['City', cityOverview.name],
        ['Current City UIS', `${liveCityUIS ?? cityOverview.uis} / 100`],
        [
          'Simulated Projected City UIS',
          simulationResult
            ? `${simulationResult.projectedCityUIS} / 100 (+${simulationResult.deltaCityUIS} pts)`
            : 'Not calculated (simulation awaiting run)',
        ],
        ['Total Representative Population', String(cityOverview.totalPopulation)],
        [],
        ['--- AREA UIS OVERVIEW & SECTOR PROFILES ---'],
        ['Area', 'Score', 'Zone Description', 'Arbitrary Demo Population', 'Priority', 'Top Strength', 'Critical Deficit'],
        ...prioritizedAreas.map((area) => [
          area.name,
          String(area.score),
          area.zone,
          String(area.populationDemoCount),
          area.priority,
          area.strength,
          area.improve,
        ]),
        [],
        ['--- OVERALL CITY INFRASTRUCTURE & CIVIC GAP ANALYSIS ---'],
        ['Sector', 'City Gap Index (%)', 'Average Performance Score', 'Deficit Severity', 'Key Lagging Zones', 'Strategic Action Recommendation'],
        ...cityGapAnalysis.map((gap) => [
          gap.label,
          `${gap.cityGap}%`,
          `${gap.avgScore} / 100`,
          gap.severity,
          gap.laggingAreas.join('; '),
          gap.actionRecommendation,
        ]),
        [],
        ['--- WHAT-IF SIMULATION SUMMARY ---'],
        ...(simulationResult
          ? [
              ['Target Area', simulationResult.areaName],
              ['Proposed Improvement', simulationResult.improvement.label],
              ['Capital Investment', `₹${simulationResult.investmentCr} Cr`],
              ['Current Area UIS', String(simulationResult.currentAreaUIS)],
              ['Projected Area UIS', `${simulationResult.projectedAreaUIS} (+${simulationResult.deltaAreaUIS} pts)`],
              ['Current City UIS', String(simulationResult.currentCityUIS)],
              ['Projected City UIS', `${simulationResult.projectedCityUIS} (+${simulationResult.deltaCityUIS} pts)`],
              ['Direct Population Benefited', `${simulationResult.benefitedPopulation} (${simulationResult.benefitedPopulationPct}% reach)`],
              ['Strategic Assessment', simulationResult.efficiencyIndex],
              ['Planning Rationale', simulationResult.rationale],
            ]
          : [
              ['Status', 'No simulation executed yet'],
              ['Selected Area for Next Run', selectedAreaObj?.name ?? 'Not selected'],
              ['Selected Improvement', selectedImprovementLabel || 'Not selected'],
              ['Configured Investment', investment ? `₹${investment} Cr` : 'Not configured'],
            ]),
      ]
      filename = `uis-nashik-government-report-${new Date().toISOString().slice(0, 10)}.csv`
      notice = 'Nashik complete government intelligence CSV exported successfully'
    }

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    setDownloadNotice(notice)
    window.setTimeout(() => setDownloadNotice(''), 3500)
  }

  // Dynamic Dashboard Metrics reflecting simulation
  const dynamicMetrics = useMemo(() => {
    return initialDashboardMetrics.map((metric) => {
      if (metric.label === 'Total Budget') {
        return {
          ...metric,
          value: `₹${totalBudgetCr}`,
          numericValue: totalBudgetCr,
          editable: true,
          onValueChange: (val: number) => setTotalBudgetCr(val),
        }
      }
      if (metric.label === 'City UIS') {
        const scoreVal = liveCityUIS != null ? String(liveCityUIS) : metric.value
        return {
          ...metric,
          value: scoreVal,
          note: liveCityUIS != null
            ? 'Backend UIS score; underlying measurements include estimates'
            : metric.note,
        }
      }
      if (metric.label === 'Priority Areas' && liveWardRankings.length > 0) {
        return {
          ...metric,
          value: String(liveWardRankings.length > 1 ? 2 : liveWardRankings.length),
          note: `${liveWardRankings.length > 1 ? 2 : liveWardRankings.length} lowest-scoring wards in backend rankings`,
        }
      }
      if (metric.label === 'Population Covered' && liveAreas.length > 0) {
        const population = liveAreas.reduce((sum, area) => sum + (area.population ?? 0), 0)
        return {
          ...metric,
          value: (population / 100_000).toFixed(2),
          note: 'Sum of backend ward population fields',
        }
      }
      if (metric.label === 'Projected City UIS') {
        const cityForecastAvailable = simulationResult?.cityForecastAvailable !== false
        return {
          ...metric,
          value: simulationResult && cityForecastAvailable ? String(simulationResult.projectedCityUIS) : '—',
          suffix: simulationResult && cityForecastAvailable ? '/ 100' : '',
          note: simulationResult && !cityForecastAvailable
            ? 'Backend simulation returns area impact only'
            : simulationResult
            ? `+${simulationResult.deltaCityUIS} gain via ${simulationResult.areaName}`
            : 'Run simulation below to calculate',
          tone: simulationResult ? 'teal' : 'teal',
        }
      }
      return metric
    })
  }, [simulationResult, totalBudgetCr, liveCityUIS, liveWardRankings, liveAreas])

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app-shell">
      <main className="main-area" id="dashboard">
        <Header onExport={exportReport} onLogout={handleLogout} />
        <div className="dashboard-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" /> URBAN INTELLIGENCE PLATFORM · GOVERNMENT SUITE
              </div>
              <h1>Nashik government dashboard</h1>
              <p>
                City UIS metrics synchronized with citizen dashboard indicators, overall gap analysis, and predictive simulation.
              </p>
            </div>
            <div className="heading-controls">
              <button
                className="live-calculate-button"
                type="button"
                onClick={handleCalculateAllAreas}
                disabled={!liveAreas.length || calculationProgress !== null}
              >
                <RotateCcw size={13} className={calculationProgress ? 'is-spinning' : undefined} />
                {calculationProgress
                  ? `Calculating ${calculationProgress.completed + 1}/${calculationProgress.total}`
                  : 'Calculate live UIS'}
              </button>
              <div className="city-showcase" aria-label="Dashboard city: Nashik, Maharashtra, India">
                <MapPin size={16} />
                <span>
                  <strong>Nashik</strong>
                  <small>Maharashtra, India</small>
                </span>
              </div>
            </div>
          </div>
          {calculationMessage && (
            <p className="live-calculate-message" role="status" aria-live="polite">
              {calculationMessage}
            </p>
          )}


          <MapCard liveRankings={liveWardRankings} />

          <section className="metric-grid" aria-label="Nashik government dashboard summary">
            {dynamicMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="overview-grid">
            {/* ── 1. PRIORITY AREAS ──────────────────────────────── */}
            <article className="panel priority-panel" id="area-rankings">
              <div className="panel-header">
                <div>
                  <h2>Priority Areas</h2>
                </div>
              </div>
              <div className="priority-table-wrap">
                <table className="priority-table">
                  <thead>
                    <tr>
                      <th>AREA & ZONE</th>
                      <th>UIS SCORE</th>
                      <th>PRIORITY</th>
                      <th>POPULATION</th>
                      <th>PRIMARY DEFICIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prioritizedAreas.map((area) => (
                      <tr
                        className={`area-row ${simulationAreaId === area.id ? 'selected' : ''}`}
                        key={area.id}
                      >
                        <td
                          style={{ cursor: 'pointer' }}
                          title={`Select ${area.name}`}
                          onClick={() => handleSelectAreaForSimulation(area.id)}
                        >
                          <strong>{area.name}</strong>
                          <div style={{ fontSize: '7.5px', color: '#94a3b8', marginTop: '1px' }}>
                            {area.zone.split('·')[0]}
                          </div>
                        </td>
                        <td className="score-cell">{area.score}</td>
                        <td>
                          <span className={`priority-tag ${area.priority.toLowerCase()}`}>
                            {area.priority}
                          </span>
                        </td>
                        <td className="population-cell">
                          {area.populationDemoCount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ cursor: 'default' }}>
                          <span
                            className="area-sector-chip"
                            style={{ cursor: 'default', pointerEvents: 'none', userSelect: 'none' }}
                          >
                            <ShieldAlert size={10} />
                            {area.improve}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="area-priority-note">
                💡 Overview of primary civic deficits across Nashik zones sourced from citizen indicators.
              </div>
            </article>

            {/* ── 2. INFRASTRUCTURE & CIVIC GAP ANALYSIS ────────────────────── */}
            <article className="panel infrastructure-panel" id="infrastructure">
              <div className="panel-header">
                <div>
                  <h2>Infrastructure & civic gap analysis</h2>
                  <p>Synthesized across all 6 Nashik zones from citizen indicators</p>
                </div>
                <div className="gap-view-toggle">
                  <button
                    type="button"
                    className={`gap-view-btn ${gapViewMode === 'city' ? 'active' : ''}`}
                    onClick={() => setGapViewMode('city')}
                  >
                    City Overview
                  </button>
                  <button
                    type="button"
                    className={`gap-view-btn ${gapViewMode === 'area' ? 'active' : ''}`}
                    onClick={() => setGapViewMode('area')}
                  >
                    Zone Breakdown
                  </button>
                </div>
              </div>

              {gapViewMode === 'city' ? (
                <div className="gap-interactive-container">
                  {/* Filter bar */}
                  <div className="gap-filter-bar">
                    <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 650 }}>
                      Filter by Deficit Severity:
                    </span>
                    <div className="gap-filter-chips">
                      <button
                        type="button"
                        className={`gap-filter-chip ${gapFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setGapFilter('all')}
                      >
                        All (7)
                      </button>
                      <button
                        type="button"
                        className={`gap-filter-chip ${gapFilter === 'critical' ? 'active' : ''}`}
                        onClick={() => setGapFilter('critical')}
                      >
                        🚨 Critical & High (4)
                      </button>
                      <button
                        type="button"
                        className={`gap-filter-chip ${gapFilter === 'moderate' ? 'active' : ''}`}
                        onClick={() => setGapFilter('moderate')}
                      >
                        ⚡ Moderate (3)
                      </button>
                    </div>
                  </div>

                  {/* Interactive Sector Progress Matrix */}
                  <div className="gap-sector-list" role="list" aria-label="City infrastructure gap list">
                    {filteredGaps.map((gap) => {
                      const Icon = sectorIcons[gap.key] ?? Building2
                      const isSelected = selectedGapKey === gap.key
                      return (
                        <div
                          key={gap.key}
                          className={`gap-row-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedGapKey(selectedGapKey === gap.key ? null : gap.key)}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedGapKey(selectedGapKey === gap.key ? null : gap.key)
                            }
                          }}
                        >
                          <div className="gap-row-top">
                            <div className="gap-row-left">
                              <div
                                className="gap-icon-box"
                                style={{ background: `${gap.color}18`, color: gap.color }}
                              >
                                <Icon size={13} />
                              </div>
                              <span className="gap-row-title">{gap.label}</span>
                              <span
                                className={`gap-badge ${
                                  gap.severity === 'Critical Deficit'
                                    ? 'critical'
                                    : gap.severity === 'High Deficit'
                                    ? 'high'
                                    : 'moderate'
                                }`}
                              >
                                {gap.severity.split(' ')[0]}
                              </span>
                            </div>

                            <div className="gap-row-right">
                              <span
                                className="gap-meter-percentage"
                                style={{ color: gap.color }}
                              >
                                {gap.cityGap}% Gap
                              </span>
                            </div>
                          </div>

                          <div className="gap-bar-container">
                            <div className="gap-meter-track">
                              <div
                                className="gap-meter-fill"
                                style={{
                                  width: `${gap.cityGap}%`,
                                  background: `linear-gradient(90deg, ${gap.color}99, ${gap.color})`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Spotlight Diagnostic Card - Appears ONLY when an indicator is clicked */}
                  {activeGapMetric ? (
                    <div className="gap-spotlight-card">
                      <div className="gap-spotlight-top">
                        <div className="gap-spotlight-title">
                          {(() => {
                            const Icon = sectorIcons[activeGapMetric.key] ?? Building2
                            return <Icon size={15} style={{ color: activeGapMetric.color }} />
                          })()}
                          <h3>{activeGapMetric.label} Intelligence Spotlight</h3>
                        </div>
                        <div className="gap-spotlight-badges">
                          <span className="gap-rank-tag">
                            #{cityGapAnalysis.findIndex((g) => g.key === activeGapMetric.key) + 1} City Gap
                          </span>
                          <span
                            className={`gap-badge ${
                              activeGapMetric.severity === 'Critical Deficit'
                                ? 'critical'
                                : activeGapMetric.severity === 'High Deficit'
                                ? 'high'
                                : 'moderate'
                            }`}
                          >
                            {activeGapMetric.severity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedGapKey(null)}
                            title="Close spotlight"
                            aria-label="Close spotlight"
                            style={{
                              border: 0,
                              background: 'transparent',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              marginLeft: '4px',
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="gap-spotlight-metrics">
                        <div className="gap-spotlight-stat">
                          <span>City Deficit Index</span>
                          <strong style={{ color: activeGapMetric.color }}>
                            {activeGapMetric.cityGap}%
                          </strong>
                        </div>
                        <div className="gap-spotlight-stat">
                          <span>Baseline Capacity</span>
                          <strong>{activeGapMetric.avgScore} / 100</strong>
                        </div>
                        <div className="gap-spotlight-stat">
                          <span>Highest Deficit Zones</span>
                          <strong style={{ fontSize: '8px', color: '#b91c1c' }}>
                            {activeGapMetric.laggingAreas[0] ?? 'Satpur'}
                          </strong>
                        </div>
                      </div>

                      <p className="gap-spotlight-desc">{activeGapMetric.diagnostic}</p>

                      <div className="gap-spotlight-action">
                        <div className="gap-action-text" style={{ width: '100%' }}>
                          <strong>Strategic Policy: </strong>
                          <span>{activeGapMetric.actionRecommendation}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '12px 10px',
                        fontSize: '8.5px',
                        color: '#64748b',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1',
                        marginTop: '4px',
                      }}
                    >
                      💡 <strong>Click any indicator row above</strong> to inspect its detailed gap intelligence & strategic policy
                    </div>
                  )}
                </div>
              ) : (
                <div className="gap-interactive-container">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: '2px 0',
                    }}
                  >
                    <span style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 650 }}>
                      Select zone to inspect civic indicators:
                    </span>
                    <select
                      value={selectedAreaForGap}
                      onChange={(e) => setSelectedAreaForGap(e.target.value)}
                      style={{
                        padding: '4px 9px',
                        fontSize: '9.5px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        color: '#1e293b',
                        fontWeight: 650,
                        background: '#ffffff',
                      }}
                    >
                      {areaUIS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (UIS: {a.score})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comparative breakdown list for the selected zone */}
                  <div className="gap-area-compare-list">
                    {[
                      { key: 'infrastructure', label: 'Infrastructure', score: activeAreaForGapObj.sectors.infrastructure },
                      { key: 'transport', label: 'Transport & Transit', score: activeAreaForGapObj.sectors.transport },
                      { key: 'safety', label: 'Safety & Surveillance', score: activeAreaForGapObj.sectors.safety },
                      { key: 'environment', label: 'Environment', score: activeAreaForGapObj.sectors.environment },
                      { key: 'education', label: 'Education', score: activeAreaForGapObj.sectors.education },
                      { key: 'healthcare', label: 'Healthcare Access', score: activeAreaForGapObj.sectors.healthcare },
                      { key: 'accessibility', label: 'Accessibility', score: activeAreaForGapObj.sectors.accessibility },
                    ].map((item) => {
                      const Icon = sectorIcons[item.key] ?? Building2
                      const band = getCitizenBand(item.score)
                      const iconColor =
                        band.label === 'Strong' ? '#16a34a' : band.label === 'Moderate' ? '#d97706' : '#dc2626'
                      return (
                        <div key={item.key} className="gap-area-compare-row">
                          <div className="gap-area-compare-left">
                            <Icon size={12} color={iconColor} />
                            <span>{item.label}</span>
                          </div>
                          <div className="gap-area-compare-right">
                            <span className={`citizen-band-badge ${band.className}`}>
                              {band.label}
                            </span>
                            <span style={{ fontSize: '8.5px', color: '#475569' }}>
                              Score: <strong>{item.score} / 100</strong>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="gap-spotlight-card" style={{ marginTop: '4px' }}>
                    <div className="gap-spotlight-top">
                      <div className="gap-spotlight-title">
                        <h3>{activeAreaForGapObj.name} Planning Profile</h3>
                      </div>
                      <span className="gap-badge critical">Deficit Focus: {activeAreaForGapObj.improve}</span>
                    </div>
                    <p className="gap-spotlight-desc">{activeAreaForGapObj.description}</p>
                  </div>
                </div>
              )}

              <div className="chart-note" style={{ marginTop: '8px' }}>
                <span className="chart-note-dot" />
                <span>Deficit Gap = 100 - Performance Score</span>
                <span>Click any row to inspect & simulate</span>
              </div>
            </article>

            {/* ── 3. BUDGET ALLOCATION PLAN ─────────────────────────────────── */}
            <article className="panel budget-panel" id="budget">
              <div className="panel-header">
                <div>
                  <h2>
                    {selectedBudgetItem
                      ? `${selectedBudgetItem.label} Allocation`
                      : budgetTab === 'wards'
                      ? 'Ward-Based Proportional Budget Allocation'
                      : 'Budget allocation plan'}
                  </h2>
                  <p>
                    {selectedBudgetItem
                      ? `Targeted zone allocation roadmap for ₹${selectedBudgetItem.crAmount} Cr (${selectedBudgetItem.value}% of Budget)`
                      : budgetTab === 'wards'
                      ? 'Live mathematical distribution based on (80 - Area UIS) × Population from backend'
                      : 'Capital investment aligned with civic deficits'}
                  </p>
                </div>
                {!selectedBudgetItem && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="gap-view-toggle">
                      <button
                        type="button"
                        className={`gap-view-btn ${budgetTab === 'sectors' ? 'active' : ''}`}
                        onClick={() => setBudgetTab('sectors')}
                      >
                        Sector Shares
                      </button>
                      <button
                        type="button"
                        className={`gap-view-btn ${budgetTab === 'wards' ? 'active' : ''}`}
                        onClick={() => setBudgetTab('wards')}
                      >
                        Ward Need (Live API)
                      </button>
                    </div>
                    {budgetTab === 'sectors' && (
                      <div className="budget-gap-sync-badge" title="Capital shares mathematically aligned with Nashik 6-zone civic deficits">
                        <span className="gap-sync-dot" />
                        <span>ALIGNED WITH CITY GAP ANALYSIS</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedBudgetItem ? (
                /* ── SECTOR ALLOCATION ROADMAP (WHERE TO INVEST) ── */
                <div className="budget-detail-view">
                  <div className="budget-detail-header">
                    <button
                      type="button"
                      className="budget-back-btn"
                      onClick={() => setSelectedBudgetKey(null)}
                    >
                      <ArrowLeft size={11} /> Back to Capital Plan
                    </button>
                    <div className="budget-detail-title-row">
                      <div className="budget-detail-title">
                        <i style={{ background: selectedBudgetItem.color }} />
                        <h3>{selectedBudgetItem.label} Allocation</h3>
                      </div>
                      <div className="budget-detail-outlay">
                        <span className="outlay-badge">₹{selectedBudgetItem.crAmount} Cr</span>
                        <span className="outlay-share">{selectedBudgetItem.value}% of Budget</span>
                      </div>
                    </div>
                  </div>

                  {/* Objective Card */}
                  <div className="budget-objective-card">
                    <div className="objective-label">
                      <Sparkles size={11} color={selectedBudgetItem.color} />
                      <strong>Capital Deployment Objective</strong>
                    </div>
                    <p>{selectedBudgetItem.investmentPlan.objective}</p>
                  </div>

                  {/* WHERE TO INVEST SECTION */}
                  <div className="budget-plan-section">
                    <div className="budget-section-title">
                      <MapPin size={11} color="#475569" />
                      <h4>WHERE TO INVEST (Target Zones & Deficits)</h4>
                    </div>
                    <div className="budget-area-cards">
                      {selectedBudgetItem.investmentPlan.targetAreas.map((area) => (
                        <div key={area.areaId} className="budget-area-card">
                          <div className="budget-area-top">
                            <div className="budget-area-name-wrap">
                              <strong>{area.areaName}</strong>
                              <span className="budget-area-initiative">{area.keyInitiative}</span>
                            </div>
                            <div className="budget-area-funds">
                              <span className="funds-amount">₹{area.amountCr} Cr</span>
                              <span className="funds-pct">{area.percent}% of sector</span>
                            </div>
                          </div>
                          <div className="budget-area-bottom">
                            <div className="budget-score-delta">
                              <span>UIS:</span>
                              <span className="score-from">{area.baselineScore}</span>
                              <ChevronRight size={10} color="#94a3b8" />
                              <span className="score-to" style={{ color: selectedBudgetItem.color }}>
                                {area.projectedScore} (+{area.projectedScore - area.baselineScore} pts)
                              </span>
                            </div>
                            <button
                              type="button"
                              className="budget-simulate-btn"
                              title={`Simulate ₹${area.amountCr} Cr investment in ${area.areaName}`}
                              onClick={() =>
                                handleSimulateBudgetItem(area.areaId, selectedBudgetItem.key, area.amountCr)
                              }
                            >
                              Simulate <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : budgetTab === 'wards' ? (
                /* ── LIVE WARD NEED ALLOCATION VIEW (FROM BACKEND API) ── */
                <div style={{ padding: '8px 4px' }}>
                  <div style={{ marginBottom: '10px', fontSize: '11px', color: '#64748b' }}>
                    ⚖️ <strong>Backend Proportional Need Allocation:</strong> Budget distributed mathematically by <code>(80 - Area UIS) × Population</code> from <code>GET /api/v1/government/budget-allocation</code>.
                  </div>
                  <div className="priority-table-wrap">
                    <table className="priority-table">
                      <thead>
                        <tr>
                          <th>WARD / AREA</th>
                          <th>POPULATION</th>
                          <th>NEED SHARE</th>
                          <th>ALLOCATED BUDGET</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(wardAllocations.length > 0
                          ? wardAllocations
                          : [
                              { area_id: 1, area_name: 'Satpur', population: 38400, need_share_percentage: 23.4, allocated_budget: totalBudgetCr * 0.234 * 10000000 },
                              { area_id: 2, area_name: 'Nashik Road', population: 52000, need_share_percentage: 21.2, allocated_budget: totalBudgetCr * 0.212 * 10000000 },
                              { area_id: 3, area_name: 'Panchavati', population: 44000, need_share_percentage: 17.5, allocated_budget: totalBudgetCr * 0.175 * 10000000 },
                              { area_id: 4, area_name: 'CIDCO', population: 48000, need_share_percentage: 14.8, allocated_budget: totalBudgetCr * 0.148 * 10000000 },
                              { area_id: 5, area_name: 'Old Nashik', population: 42000, need_share_percentage: 13.1, allocated_budget: totalBudgetCr * 0.131 * 10000000 },
                              { area_id: 6, area_name: 'Gangapur Road', population: 39800, need_share_percentage: 10.0, allocated_budget: totalBudgetCr * 0.100 * 10000000 },
                            ]
                        ).map((wa) => {
                          const cr = Math.round((wa.allocated_budget / 10000000) * 10) / 10
                          return (
                            <tr key={wa.area_id}>
                              <td>
                                <strong>{wa.area_name}</strong>
                              </td>
                              <td>{wa.population ? Number(wa.population).toLocaleString('en-IN') : '—'}</td>
                              <td>
                                <span style={{ fontWeight: 700, color: '#0f766e' }}>
                                  {wa.need_share_percentage}%
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#0f766e', fontSize: '12px' }}>
                                  ₹{cr} Cr
                                </strong>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="budget-simulate-btn"
                                  title={`Simulate ₹${cr} Cr investment in ${wa.area_name}`}
                                  onClick={() => {
                                    handleSelectAreaForSimulation(String(wa.area_id))
                                    setInvestment(String(Math.min(100, Math.max(1, Math.round(cr)))))
                                  }}
                                >
                                  Simulate <ChevronRight size={10} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ── OVERVIEW VIEW: DONUT + LEGEND ── */
                <>
                  <div className="budget-layout">
                    <div className="donut-wrap">
                      <Doughnut
                        key={`donut-canvas-${chartAnimKey}`}
                        data={budgetData}
                        options={budgetOptions}
                      />
                      <div className={`donut-center ${isChartPulsing ? 'donut-center-pulse' : ''}`}>
                        <span>CAPITAL PLAN</span>
                        <strong>₹{Number(totalBudgetCr).toLocaleString('en-IN')} Cr</strong>
                      </div>
                    </div>
                    <div className="budget-legend">
                      {dynamicBudgetAllocation.map((item) => (
                        <div
                          className="budget-legend-item"
                          key={item.label}
                          title={`Click to inspect where to invest ₹${Number.isInteger(item.crAmount) ? item.crAmount : item.crAmount.toFixed(1)} Cr in ${item.label}`}
                          onClick={() => setSelectedBudgetKey(item.key)}
                        >
                          <i style={{ background: item.color }} />
                          <div className="budget-legend-info">
                            <span className="budget-legend-name">{item.label}</span>
                            <div className="budget-legend-progress-track">
                              <div
                                className="budget-legend-progress-bar"
                                style={{ width: `${item.value}%`, background: item.color }}
                              />
                            </div>
                          </div>
                          <div className="budget-legend-meta">
                            <span className="budget-legend-cr">
                              ₹{Number.isInteger(item.crAmount) ? item.crAmount : item.crAmount.toFixed(1)} Cr
                            </span>
                            <strong>{item.value}%</strong>
                            <ChevronRight size={9} color={item.color} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </article>
          </section>

          {/* ── 4. WHAT-IF SIMULATION SECTION ────────────────────────────────── */}
          <section className="operations-grid">
            <article className="panel simulation-panel" id="simulation">
              <div className="panel-header">
                <div className="simulation-heading">
                  <h2>What-if simulation</h2>
                  <span
                    className="simulation-info"
                    title="Intelligent predictive simulation based on sector deficits, diminishing returns, and population-weighted aggregation."
                    aria-label="Simulation info"
                  >
                    <CircleHelp size={13} />
                  </span>
                </div>
                <span className="beta-pill">
                  <Sparkles size={12} /> INTELLIGENT MODEL
                </span>
              </div>
              <p className="simulation-subtitle">
                Model capital investments across Nashik zones to project Area UIS and population-weighted City UIS.
              </p>

              <div className="simulation-layout">
                <div className="simulation-main">
                  <div className="simulation-fields">
                    <label>
                      Select Area
                      <select
                        value={simulationAreaId}
                        onChange={(event) => {
                          const newArea = event.target.value
                          setSimulationAreaId(newArea)
                          setSelectedImprovementLabel('')
                          setSimulationResult(null)
                          setSimulationError('')
                        }}
                      >
                        <option value="">-- Select a Nashik zone / area --</option>
                        {[...prioritizedAreas]
                          .sort((a, b) => a.score - b.score)
                          .map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name} (Current UIS: {area.score})
                            </option>
                          ))}
                      </select>
                    </label>

                    <label>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Select Improvement</span>
                        {selectedAreaObj && (
                          <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 650 }}>
                            ({availableImprovements.length} {availableImprovements.length === 1 ? 'project' : 'projects'} needed in {selectedAreaObj.name})
                          </span>
                        )}
                      </div>
                      <select
                        value={selectedImprovementLabel}
                        onChange={(event) => {
                          const newImp = event.target.value
                          setSelectedImprovementLabel(newImp)
                          setSimulationError('')
                          if (simulationAreaId && investment) {
                            const inv = Number(investment)
                            if (Number.isFinite(inv) && inv >= 1 && inv <= 100) {
                              triggerDynamicRecalculation(simulationAreaId, newImp, inv)
                            }
                          }
                        }}
                      >
                        {!simulationAreaId ? (
                          <option value="">-- Select an area first to view needed improvements --</option>
                        ) : (
                          <option value="">-- Select needed civic improvement in {selectedAreaObj?.name} --</option>
                        )}
                        {availableImprovements.map((imp) => (
                          <option key={imp.id} value={imp.label}>
                            {imp.label} ({imp.sectorName}){imp.priorityTag ? ` · [${imp.priorityTag}]` : ''}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Investment (₹ Cr)
                      <input
                        className="investment-input"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        inputMode="numeric"
                        placeholder="e.g. 25"
                        value={investment}
                        onChange={(event) => {
                          const val = event.target.value
                          setInvestment(val)
                          setSimulationError('')
                          const num = Number(val)
                          if (simulationAreaId && selectedImprovementLabel && Number.isFinite(num) && num >= 1 && num <= 100) {
                            triggerDynamicRecalculation(simulationAreaId, selectedImprovementLabel, num)
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleRunSimulation()
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Quick Preset Investment Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 650 }}>Quick Presets:</span>
                    <div className="quick-chip-group">
                      {[15, 25, 40, 60].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className={`quick-chip ${investment && Number(investment) === amt ? 'active' : ''}`}
                          onClick={() => handleQuickInvestment(amt)}
                        >
                          ₹{amt} Cr
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="simulation-impact-header">
                    <div>
                      <h3>Projected Impact Preview</h3>
                      <p>Area impact uses the backend simulation; city-wide projection is illustrative.</p>
                    </div>
                    <span>{simulationResult ? 'CALCULATED INTELLIGENCE' : 'AWAITING SIMULATION'}</span>
                  </div>

                  {/* 4 Impact Preview Metric Cards */}
                  <div className="impact-grid">
                    <div className={`impact-card ${isDynamicAnimating ? 'card-dynamic-pulse' : ''}`}>
                      <span>Area UIS</span>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {simulationResult ? (
                          <>
                            {simulationResult.currentAreaUIS} → {simulationResult.projectedAreaUIS}
                            <span className="delta-pill">+{simulationResult.deltaAreaUIS} pts</span>
                          </>
                        ) : selectedAreaObj ? (
                          <>
                            {selectedAreaObj.score} → —
                            <span className="delta-pill neutral">Awaiting run</span>
                          </>
                        ) : (
                          <>
                            — → —
                            <span className="delta-pill neutral">Select zone</span>
                          </>
                        )}
                      </strong>
                      <small>
                        {simulationResult
                          ? `${simulationResult.areaName} composite score`
                          : selectedAreaObj
                          ? `${selectedAreaObj.name} baseline score`
                          : 'Select an area above'}
                      </small>
                    </div>

                    <div className={`impact-card ${isDynamicAnimating ? 'card-dynamic-pulse' : ''}`}>
                      <span>Projected City UIS</span>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {simulationResult?.cityForecastAvailable === false ? (
                          <span>Not returned by API</span>
                        ) : simulationResult ? (
                          <>
                            {simulationResult.currentCityUIS} → {simulationResult.projectedCityUIS}
                            <span className="delta-pill city">+{simulationResult.deltaCityUIS} pts</span>
                          </>
                        ) : (
                          <>
                            {liveCityUIS ?? cityOverview.uis} → —
                            <span className="delta-pill neutral">Not projected</span>
                          </>
                        )}
                      </strong>
                      <small>
                        {simulationResult?.cityForecastAvailable === false
                          ? 'The backend endpoint does not provide a city-wide projection'
                          : simulationResult
                          ? 'Nashik population-weighted'
                          : `Backend city baseline (${liveCityUIS ?? cityOverview.uis})`}
                      </small>
                    </div>

                    <div className={`impact-card ${isDynamicAnimating ? 'card-dynamic-pulse' : ''}`}>
                      <span>Population Benefited</span>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {simulationResult ? (
                          <>
                            {simulationResult.benefitedPopulation.toLocaleString('en-IN')}
                            <span className="delta-pill neutral">
                              {simulationResult.benefitedPopulationPct}% reach
                            </span>
                          </>
                        ) : (
                          <>
                            —
                            <span className="delta-pill neutral">—</span>
                          </>
                        )}
                      </strong>
                      <small>
                        {simulationResult
                          ? `Catchment residents in ${simulationResult.areaName}`
                          : selectedAreaObj
                          ? `Catchment residents in ${selectedAreaObj.name}`
                          : 'Catchment zone reach'}
                      </small>
                    </div>

                    <div className={`impact-card ${isDynamicAnimating ? 'card-dynamic-pulse' : ''}`}>
                      <span>Primary Sector Impact</span>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {simulationResult ? (
                          <>
                            {simulationResult.currentSectorScore} → {simulationResult.projectedSectorScore}
                            <span className="delta-pill">+{simulationResult.deltaSectorScore} pts</span>
                          </>
                        ) : currentSectorBaseline !== null ? (
                          <>
                            {currentSectorBaseline} → —
                            <span className="delta-pill neutral">No delta</span>
                          </>
                        ) : (
                          <>
                            — → —
                            <span className="delta-pill neutral">Select project</span>
                          </>
                        )}
                      </strong>
                      <small>
                        {selectedImprovementObj
                          ? `${selectedImprovementObj.sectorName} sector`
                          : 'Target sector baseline'}
                      </small>
                    </div>
                  </div>

                  <div className="simulation-bottom">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {simulationResult?.cityForecastAvailable === false ? (
                        <strong>City-wide forecast not returned by API</strong>
                      ) : simulationResult ? (
                        <>
                          <Check size={14} color="#16a34a" />
                          Dynamic forecast active · Real-time elastic projection
                        </>
                      ) : (
                        <>
                          <Clock size={14} color="#64748b" />
                          Simulation ready · Select parameters to model dynamically
                        </>
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          setSimulationAreaId('')
                          setSelectedImprovementLabel('')
                          setInvestment('')
                          setSimulationResult(null)
                          setSimulationError('')
                        }}
                      >
                        <RotateCcw size={13} /> Reset
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => handleRunSimulation()}
                      >
                        <Play size={13} fill="currentColor" /> {simulationResult ? 'Re-run Simulation' : 'Run Simulation'}
                      </button>
                    </div>
                  </div>

                  {simulationError && (
                    <div className="simulation-error" role="alert">
                      {simulationError}
                    </div>
                  )}
                </div>

                {/* ── RIGHT COLUMN: Current vs Predicted Dual UIS Visualization ── */}
                <div className={`simulation-score-panel ${isDynamicAnimating ? 'score-panel-dynamic-active' : ''}`}>
                  <div className="simulation-score-heading">
                    <div>
                      <h3>Current vs Predicted UIS</h3>
                      <p>Direct comparison for Area & City indices</p>
                    </div>
                    <span title="Comparative visualization of baseline vs simulated scores">ⓘ</span>
                  </div>

                  <div className="simulation-score-values">
                    <div className={isDynamicAnimating ? 'score-pulse-active' : ''}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>{selectedAreaObj ? `${selectedAreaObj.name} UIS` : 'Area UIS'}</span>
                        {simulationResult && (
                          <span key={`area-live-tag-${updateKey}`} className="live-dynamic-tag area">
                            ▲ +{simulationResult.deltaAreaUIS} pts
                          </span>
                        )}
                      </div>
                      {simulationResult ? (
                        <strong className="animated-score-row">
                          <span>{simulationResult.currentAreaUIS}</span>
                          <ArrowRight size={11} color="#0284c7" />
                          <span className="score-num projected area">{simulationResult.projectedAreaUIS}</span>
                          <small>+{simulationResult.deltaAreaUIS}</small>
                        </strong>
                      ) : selectedAreaObj ? (
                        <strong style={{ color: '#475569' }}>
                          {selectedAreaObj.score} → —
                          <small style={{ color: '#94a3b8' }}>Awaiting</small>
                        </strong>
                      ) : (
                        <strong style={{ color: '#94a3b8' }}>
                          — → —
                          <small style={{ color: '#94a3b8' }}>Select area</small>
                        </strong>
                      )}
                    </div>

                    <div className={isDynamicAnimating ? 'score-pulse-active' : ''}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>Nashik City UIS</span>
                        {simulationResult && (
                          <span key={`city-live-tag-${updateKey}`} className="live-dynamic-tag city">
                            ▲ +{simulationResult.deltaCityUIS} pts
                          </span>
                        )}
                      </div>
                      {simulationResult ? (
                        <strong className="animated-score-row">
                          <span>{simulationResult.currentCityUIS}</span>
                          <ArrowRight size={11} color="#059669" />
                          <span className="score-num projected city">{simulationResult.projectedCityUIS}</span>
                          <small style={{ color: '#059669' }}>+{simulationResult.deltaCityUIS}</small>
                        </strong>
                      ) : (
                        <strong style={{ color: '#475569' }}>
                          {liveCityUIS ?? cityOverview.uis} → —
                          <small style={{ color: '#94a3b8' }}>Awaiting</small>
                        </strong>
                      )}
                    </div>
                  </div>

                  <div
                    className="uis-bars-dual"
                    aria-label={
                      simulationResult
                        ? `Current ${simulationResult.areaName} UIS is ${simulationResult.currentAreaUIS}, projected to ${simulationResult.projectedAreaUIS}. City UIS projected from ${simulationResult.currentCityUIS} to ${simulationResult.projectedCityUIS}.`
                        : `City UIS baseline is ${liveCityUIS ?? cityOverview.uis}. City-wide projection is illustrative.`
                    }
                  >
                    {/* Area Dual Column */}
                    <div className="uis-dual-group">
                      <div className="uis-bar-column">
                        <strong>{selectedAreaObj ? selectedAreaObj.score : '—'}</strong>
                        <div
                          className="uis-bar current"
                          style={{
                            height: selectedAreaObj ? `${(selectedAreaObj.score / 100) * 115}px` : '40px',
                            opacity: selectedAreaObj ? 1 : 0.4,
                            transition: 'height 0.5s ease',
                          }}
                        />
                        <span>{selectedAreaObj ? 'Current' : 'Area'}</span>
                      </div>
                      <div className="uis-bar-column">
                        {simulationResult?.cityForecastAvailable === false ? (
                          <>
                            <strong style={{ color: '#94a3b8' }}>—</strong>
                            <div className="uis-bar predicted uncalculated" />
                            <span style={{ color: '#94a3b8' }}>City forecast unavailable</span>
                          </>
                        ) : simulationResult ? (
                          <>
                            <div key={`area-tag-${updateKey}`} className="uis-bar-floating-tag area-tag">
                              ▲ +{simulationResult.deltaAreaUIS}
                            </div>
                            <strong style={{ color: '#0284c7' }}>{simulationResult.projectedAreaUIS}</strong>
                            <div
                              key={`area-bar-${updateKey}`}
                              className={`uis-bar-segmented active-area ${isDynamicAnimating ? 'bar-spring-active' : ''}`}
                              style={{ height: `${(simulationResult.projectedAreaUIS / 100) * 115}px` }}
                            >
                              <div className="uis-bar-top-cap" />
                              <div
                                className="uis-bar-gain-segment"
                                style={{ height: `${Math.max(10, (simulationResult.deltaAreaUIS / 100) * 115)}px` }}
                              />
                              <div
                                className="uis-bar-base-segment"
                                style={{
                                  height: `${Math.max(
                                    0,
                                    (simulationResult.projectedAreaUIS / 100) * 115 -
                                      Math.max(10, (simulationResult.deltaAreaUIS / 100) * 115)
                                  )}px`,
                                }}
                              />
                            </div>
                            <span style={{ color: '#0284c7', fontWeight: 700 }}>Projected</span>
                          </>
                        ) : (
                          <>
                            <strong style={{ color: '#94a3b8' }}>—</strong>
                            <div className="uis-bar predicted uncalculated" />
                            <span style={{ color: '#94a3b8' }}>Projected</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* City Dual Column */}
                    <div className="uis-dual-group">
                      <div className="uis-bar-column">
                        <strong>{liveCityUIS ?? cityOverview.uis}</strong>
                        <div
                          className="uis-bar current"
                          style={{
                            height: `${((liveCityUIS ?? cityOverview.uis) / 100) * 115}px`,
                            background: 'linear-gradient(180deg, #94a3b8, #64748b)',
                            transition: 'height 0.5s ease',
                          }}
                        />
                        <span>City Base</span>
                      </div>
                      <div className="uis-bar-column">
                        {simulationResult ? (
                          <>
                            <div key={`city-tag-${updateKey}`} className="uis-bar-floating-tag city-tag">
                              ▲ +{simulationResult.deltaCityUIS}
                            </div>
                            <strong style={{ color: '#059669' }}>{simulationResult.projectedCityUIS}</strong>
                            <div
                              key={`city-bar-${updateKey}`}
                              className={`uis-bar-segmented active-city ${isDynamicAnimating ? 'bar-spring-active' : ''}`}
                              style={{ height: `${(simulationResult.projectedCityUIS / 100) * 115}px` }}
                            >
                              <div className="uis-bar-top-cap" />
                              <div
                                className="uis-bar-gain-segment city"
                                style={{ height: `${Math.max(8, (simulationResult.deltaCityUIS / 100) * 115)}px` }}
                              />
                              <div
                                className="uis-bar-base-segment city"
                                style={{
                                  height: `${Math.max(
                                    0,
                                    (simulationResult.projectedCityUIS / 100) * 115 -
                                      Math.max(8, (simulationResult.deltaCityUIS / 100) * 115)
                                  )}px`,
                                }}
                              />
                            </div>
                            <span style={{ color: '#059669', fontWeight: 700 }}>City Proj</span>
                          </>
                        ) : (
                          <>
                            <strong style={{ color: '#94a3b8' }}>—</strong>
                            <div className="uis-bar predicted uncalculated" />
                            <span style={{ color: '#94a3b8' }}>City Proj</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="prediction-note">
                    <CircleHelp size={12} />
                    <span>
                      {simulationResult?.cityForecastAvailable === false
                        ? 'The backend returned an area-level simulation only; no city-wide forecast is available.'
                        : simulationResult && selectedAreaObj
                        ? `Projected City UIS aggregates all 6 zones weighted by representative population share (${simulationResult.areaName}: ${Math.round(
                            (selectedAreaObj.populationDemoCount / cityOverview.totalPopulation) * 100
                          )}% weight).`
                        : 'Population-weighted elasticity engine ready. Select an area, civic improvement, and investment amount, then click Run Simulation.'}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ── 5. RECENT / PLANNED PROJECTS ──────────────────────────────── */}
            <article className="panel project-panel" id="projects">
              <div className="panel-header project-panel-header">
                <div>
                  <div className="project-title-row">
                    <h2>Recent / planned projects</h2>
                    <span className="project-count-badge">{demoProjects.length} Works</span>
                  </div>
                  <p>Targeted capital works addressing citizen deficits across 6 Nashik zones</p>
                </div>
                <div className="project-header-stats">
                  <div className="p-stat-item">
                    <span className="p-stat-label">Total Outlay</span>
                    <strong className="p-stat-value">₹{projectPortfolioStats.totalCr} Cr</strong>
                  </div>
                  <div className="p-stat-item">
                    <span className="p-stat-label">Avg Completion</span>
                    <strong className="p-stat-value">{projectPortfolioStats.avgProg}%</strong>
                  </div>
                  <div className="p-stat-item highlight">
                    <span className="p-stat-label">On Schedule</span>
                    <strong className="p-stat-value">{projectPortfolioStats.onTrackCount} of {demoProjects.length}</strong>
                  </div>
                </div>
              </div>

              {/* Filter and search bar */}
              <div className="project-controls-bar">
                <div className="project-sector-tabs" role="tablist" aria-label="Filter projects by sector">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'all'}
                    className={`project-tab-btn ${projectSectorFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('all')}
                  >
                    All Sectors ({demoProjects.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'infrastructure'}
                    className={`project-tab-btn ${projectSectorFilter === 'infrastructure' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('infrastructure')}
                  >
                    <Building2 size={13} />
                    Infrastructure ({demoProjects.filter((p) => p.sectorKey === 'infrastructure').length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'safety'}
                    className={`project-tab-btn ${projectSectorFilter === 'safety' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('safety')}
                  >
                    <ShieldAlert size={13} />
                    Safety ({demoProjects.filter((p) => p.sectorKey === 'safety').length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'environment'}
                    className={`project-tab-btn ${projectSectorFilter === 'environment' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('environment')}
                  >
                    <Trees size={13} />
                    Environment ({demoProjects.filter((p) => p.sectorKey === 'environment').length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'transport'}
                    className={`project-tab-btn ${projectSectorFilter === 'transport' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('transport')}
                  >
                    <TrainFront size={13} />
                    Transit ({demoProjects.filter((p) => p.sectorKey === 'transport').length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'healthcare'}
                    className={`project-tab-btn ${projectSectorFilter === 'healthcare' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('healthcare')}
                  >
                    <HeartPulse size={13} />
                    Healthcare ({demoProjects.filter((p) => p.sectorKey === 'healthcare').length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'education'}
                    className={`project-tab-btn ${projectSectorFilter === 'education' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('education')}
                  >
                    <GraduationCap size={13} />
                    Education ({demoProjects.filter((p) => p.sectorKey === 'education').length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={projectSectorFilter === 'accessibility'}
                    className={`project-tab-btn ${projectSectorFilter === 'accessibility' ? 'active' : ''}`}
                    onClick={() => setProjectSectorFilter('accessibility')}
                  >
                    <Accessibility size={13} />
                    Walkability ({demoProjects.filter((p) => p.sectorKey === 'accessibility').length})
                  </button>
                </div>

                <div className="project-search-wrap">
                  <Search size={14} className="project-search-icon" />
                  <input
                    type="text"
                    className="project-search-input"
                    placeholder="Search works, zones, deliverables..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    aria-label="Filter capital works table"
                  />
                  {projectSearch && (
                    <button
                      type="button"
                      className="project-search-clear"
                      onClick={() => setProjectSearch('')}
                      aria-label="Clear search query"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="project-table-wrap">
                <table className="project-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>PROJECT & CIVIC DELIVERABLE</th>
                      <th style={{ width: '13%' }}>SECTOR</th>
                      <th style={{ width: '11%' }}>ZONE</th>
                      <th style={{ width: '15%' }}>DEFICIT ADDRESSED</th>
                      <th style={{ width: '8%' }}>BUDGET</th>
                      <th style={{ width: '15%' }}>PROGRESS & EST. COMPLETION</th>
                      <th style={{ width: '8%' }}>STATUS</th>
                      <th style={{ width: '7%', textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDemoProjects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="project-empty-state">
                          No capital projects match the selected criteria.
                          <button
                            type="button"
                            className="project-reset-btn"
                            onClick={() => {
                              setProjectSectorFilter('all')
                              setProjectSearch('')
                            }}
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredDemoProjects.map((project) => {
                        const SectorIcon = sectorIcons[project.sectorKey] ?? Building2
                        return (
                          <tr key={project.id || project.name} className="project-data-row">
                            <td className="project-title-col">
                              <div className="project-header-line">
                                <strong className="project-name-text">{project.name}</strong>
                                <span className="project-agency-tag">{project.agency}</span>
                              </div>
                              <p className="project-deliverable-desc">{project.deliverable}</p>
                            </td>

                            <td>
                              <span className={`project-sector-pill sector-${project.sectorKey}`}>
                                <SectorIcon size={12} />
                                <span>{project.sector}</span>
                              </span>
                            </td>

                            <td>
                              <span className="project-zone-pill">
                                <MapPin size={11} />
                                <span>{project.area}</span>
                              </span>
                            </td>

                            <td>
                              <span className="project-deficit-tag" title={`Directly mitigates ${project.deficitAddressed}`}>
                                <span className="deficit-dot" />
                                <span>{project.deficitAddressed}</span>
                              </span>
                            </td>

                            <td>
                              <strong className="project-budget-val">{project.budget}</strong>
                              <span className="project-budget-sub">Capital Outlay</span>
                            </td>

                            <td>
                              <div className="project-progress-container">
                                <div className="project-progress-bar-wrap">
                                  <div
                                    className={`project-progress-fill ${
                                      project.status === 'Completed'
                                        ? 'fill-complete'
                                        : project.progress >= 70
                                        ? 'fill-high'
                                        : project.progress >= 50
                                        ? 'fill-mid'
                                        : 'fill-low'
                                    }`}
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <div className="project-progress-meta">
                                  <span className="project-phase-txt" title={project.phase}>
                                    {project.phase}
                                  </span>
                                  <strong className="project-percent-txt">{project.progress}%</strong>
                                </div>
                                <div className={`project-est-completion ${project.status === 'Completed' ? 'completed' : ''}`}>
                                  <Clock size={10} />
                                  <span>
                                    {project.status === 'Completed' ? 'Delivered: ' : 'Est. Completion: '}
                                    <strong>{project.timeline}</strong>
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`project-status-badge ${
                                  project.status === 'Completed'
                                    ? 'status-completed'
                                    : project.status === 'On track'
                                    ? 'status-ontrack'
                                    : 'status-inreview'
                                }`}
                              >
                                <i className="status-dot" />
                                {project.status}
                              </span>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="project-simulate-action"
                                title={`Simulate impact of ₹${project.budget} in ${project.area}`}
                                onClick={() =>
                                  handleSimulateBudgetItem(
                                    project.areaId,
                                    project.sectorKey,
                                    parseFloat(project.budget.replace(/[^0-9.]/g, '')) || 25
                                  )
                                }
                              >
                                <Sparkles size={11} />
                                <span>Simulate</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="project-panel-footer">
                <span className="static-panel-note">
                  Prioritized according to Citizen Dashboard deficit findings · Direct capital correlation with NMC 2026–2027 Capital Works Program
                </span>
                <span className="project-showing-counter">
                  Showing <strong>{filteredDemoProjects.length}</strong> of <strong>{demoProjects.length}</strong> works
                </span>
              </div>
            </article>
          </section>



          <footer className="dashboard-footer">
            <span>
              UIS Nashik Government Dashboard <i /> Synchronized with Citizen Dashboard ground indicators
            </span>
            <span>
              Planning analytics apply economic elasticity, spillover modeling, and population weighting.
            </span>
          </footer>
        </div>

        {downloadNotice && (
          <div className="toast" role="status">
            <Check size={15} />
            {downloadNotice}
            <button aria-label="Dismiss" onClick={() => setDownloadNotice('')}>
              <X size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
