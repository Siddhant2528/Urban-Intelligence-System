/**
 * Urban Intelligence System (UIS) Government Dashboard Data
 * Synchronized with citizen dashboard metrics and ground indicator profiles.
 */

export interface AreaSectorScores {
  environment: number
  healthcare: number
  education: number
  safety: number
  transport: number
  infrastructure: number
  accessibility: number
}

export interface AreaData {
  id: string
  name: string
  zone: string
  score: number // Area UIS demo score
  populationDemoCount: number // Arbitrary representative population
  strength: string
  improve: string
  sectors: AreaSectorScores
  facilities: {
    hospitals: number
    schools: number
    policeStations: number
    busStops: number
    parks: number
    railwayStations?: number
  }
  description: string
}

export const cityOverview = {
  name: 'Nashik',
  state: 'Maharashtra, India',
  uis: 72.4,
  scale: 100,
  totalPopulation: 264200, // Aggregate of the 6 representative demo areas
} as const

/** Sourced from citizen dashboard demoData.ts with realistic arbitrary population counts */
export const areaUIS: AreaData[] = [
  {
    id: 'satpur',
    name: 'Satpur',
    zone: 'South-West Industrial & Worker Belt',
    score: 67.5,
    populationDemoCount: 38400,
    strength: 'Accessibility',
    improve: 'Safety',
    sectors: {
      environment: 34,
      healthcare: 38,
      education: 39,
      safety: 31,
      transport: 45,
      infrastructure: 37,
      accessibility: 48,
    },
    facilities: {
      hospitals: 2,
      schools: 3,
      policeStations: 1,
      busStops: 3,
      parks: 2,
    },
    description: 'Heavy industrial MIDC cluster and residential colonies facing acute deficits in nighttime safety, healthcare facilities, and environmental runoff.',
  },
  {
    id: 'deolali',
    name: 'Deolali',
    zone: 'South-East Cantonment & Green Periphery',
    score: 69.4,
    populationDemoCount: 34500,
    strength: 'Education',
    improve: 'Infrastructure',
    sectors: {
      environment: 74,
      healthcare: 67,
      education: 79,
      safety: 68,
      transport: 62,
      infrastructure: 35,
      accessibility: 72,
    },
    facilities: {
      hospitals: 3,
      schools: 3,
      policeStations: 2,
      busStops: 4,
      parks: 3,
      railwayStations: 1,
    },
    description: 'Cantonment zone characterized by clean pine woodlands and strong central schools, but lagging in modern municipal water lines and arterial road sub-bases.',
  },
  {
    id: 'dwarka',
    name: 'Dwarka',
    zone: 'East Highway Junction & Commercial Transit Node',
    score: 70.6,
    populationDemoCount: 61200,
    strength: 'Accessibility',
    improve: 'Safety',
    sectors: {
      environment: 65,
      healthcare: 72,
      education: 58,
      safety: 35,
      transport: 68,
      infrastructure: 62,
      accessibility: 76,
    },
    facilities: {
      hospitals: 3,
      schools: 3,
      policeStations: 1,
      busStops: 4,
      parks: 2,
    },
    description: 'Critical intersection of Mumbai-Agra & Pune highways; bustling transit exchange with high pedestrian conflict zones and inadequate traffic police chowkis.',
  },
  {
    id: 'panchavati',
    name: 'Panchavati',
    zone: 'North Historic Cultural & Pilgrimage Core',
    score: 71.8,
    populationDemoCount: 52400,
    strength: 'Healthcare',
    improve: 'Infrastructure',
    sectors: {
      environment: 61,
      healthcare: 72,
      education: 68,
      safety: 62,
      transport: 35,
      infrastructure: 32,
      accessibility: 67,
    },
    facilities: {
      hospitals: 3,
      schools: 3,
      policeStations: 2,
      busStops: 4,
      parks: 3,
    },
    description: 'Dense pilgrimage center along the Godavari riverbanks; robust community healthcare access but severe drainage bottlenecks and heritage road congestion.',
  },
  {
    id: 'gangapur',
    name: 'Gangapur Road',
    zone: 'West High-Growth Residential & Academic Belt',
    score: 73.1,
    populationDemoCount: 29100,
    strength: 'Accessibility',
    improve: 'Environment',
    sectors: {
      environment: 35,
      healthcare: 72,
      education: 63,
      safety: 66,
      transport: 72,
      infrastructure: 60,
      accessibility: 81,
    },
    facilities: {
      hospitals: 3,
      schools: 4,
      policeStations: 1,
      busStops: 4,
      parks: 3,
    },
    description: 'Premier academic avenue with top colleges and broad thoroughfares; key concern is riverbank runoff protection and ecological preservation around Someshwar.',
  },
  {
    id: 'cidco',
    name: 'CIDCO',
    zone: 'South-West Planned Modern Township (New Nashik)',
    score: 76.2,
    populationDemoCount: 48600,
    strength: 'Healthcare',
    improve: 'Infrastructure',
    sectors: {
      environment: 78,
      healthcare: 86,
      education: 73,
      safety: 75,
      transport: 72,
      infrastructure: 68,
      accessibility: 75,
    },
    facilities: {
      hospitals: 4,
      schools: 4,
      policeStations: 2,
      busStops: 5,
      parks: 3,
    },
    description: 'Master-planned township with sectoral grid layout, high hospital density, and top civic satisfaction; minor upgrades needed in secondary drainage conduits.',
  },
]

export interface CityGapMetric {
  key: keyof AreaSectorScores
  label: string
  cityGap: number // 100 - average score
  avgScore: number
  severity: 'Critical Deficit' | 'High Deficit' | 'Moderate Gap' | 'Stable'
  color: string
  laggingAreas: string[]
  diagnostic: string
  actionRecommendation: string
}

/**
 * City-Wide Infrastructure & Civic Gap Analysis
 * Aggregated from all 6 Nashik zones' citizen indicators (Gap = 100 - Score)
 */
export const cityGapAnalysis: CityGapMetric[] = [
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    cityGap: 51.0,
    avgScore: 49.0,
    severity: 'Critical Deficit',
    color: '#e25959',
    laggingAreas: ['Panchavati', 'Deolali', 'Satpur'],
    diagnostic: 'Old city core and industrial fringes face severe drainage choke points during monsoon runoff, deteriorated arterial road sub-bases, and unmodernized drinking water utility pipelines.',
    actionRecommendation: 'Prioritize underground stormwater trunk lines in Panchavati and road recarpeting in Satpur MIDC corridor.',
  },
  {
    key: 'safety',
    label: 'Safety & Surveillance',
    cityGap: 43.8,
    avgScore: 56.2,
    severity: 'High Deficit',
    color: '#ed8043',
    laggingAreas: ['Satpur', 'Dwarka'],
    diagnostic: 'Acute deficiency of police chowkis and CCTV camera coverage at industrial shift change points in Satpur and heavy-traffic highway crossovers in Dwarka.',
    actionRecommendation: 'Deploy AI-monitored smart poles with high-mast LED illumination and emergency SOS pedestals at Dwarka Circle and Satpur MIDC.',
  },
  {
    key: 'environment',
    label: 'Environment & Greenery',
    cityGap: 42.2,
    avgScore: 57.8,
    severity: 'High Deficit',
    color: '#70b37f',
    laggingAreas: ['Satpur', 'Gangapur'],
    diagnostic: 'Elevated airborne particulate concentrations near Satpur industrial plants and stormwater runoff polluting the Godavari riverfront along western Gangapur.',
    actionRecommendation: 'Establish a 12 km green buffer zone along industrial boundaries and install decentralized effluent interceptors near Gangapur.',
  },
  {
    key: 'transport',
    label: 'Transport & Transit',
    cityGap: 41.0,
    avgScore: 59.0,
    severity: 'High Deficit',
    color: '#f09c3d',
    laggingAreas: ['Panchavati', 'Satpur'],
    diagnostic: 'Public transit bus (Citilinc) headways exceed 25 minutes in historic Panchavati, causing heavy motorized two-wheeler congestion; lack of dedicated factory commuter lines in Satpur.',
    actionRecommendation: 'Introduce 40 electric feeder midi-buses on dedicated circular loops connecting Panchavati Karanja and Satpur Ambad links.',
  },
  {
    key: 'education',
    label: 'Education & Skill Hubs',
    cityGap: 36.7,
    avgScore: 63.3,
    severity: 'Moderate Gap',
    color: '#6e85e0',
    laggingAreas: ['Satpur', 'Dwarka'],
    diagnostic: 'Disparity between premier academic institutions in Gangapur/Deolali vs underfunded municipal primary schools and technical skill labs in working-class Satpur.',
    actionRecommendation: 'Upgrade 12 municipal secondary schools into smart STEM campuses and establish a vocational apprenticeship center in Satpur.',
  },
  {
    key: 'healthcare',
    label: 'Healthcare Access',
    cityGap: 32.2,
    avgScore: 67.8,
    severity: 'Moderate Gap',
    color: '#da6092',
    laggingAreas: ['Satpur', 'Deolali'],
    diagnostic: 'CIDCO and Panchavati enjoy tertiary hospitals (ESIC, Zakir Hussain), but Satpur industrial workers lack a 24/7 civic trauma center within 15-minute reach.',
    actionRecommendation: 'Construct a 100-bed civil trauma and occupational health hospital on Trimbak Road in Satpur.',
  },
  {
    key: 'accessibility',
    label: 'Accessibility & Walkability',
    cityGap: 30.2,
    avgScore: 69.8,
    severity: 'Moderate Gap',
    color: '#53a8be',
    laggingAreas: ['Satpur', 'Panchavati'],
    diagnostic: 'Absence of universal barrier-free footpaths, tactile pavers, and pedestrian-grade traffic signals in dense commercial and pilgrimage arteries.',
    actionRecommendation: 'Implement continuous sidewalk retrofits with curb ramps and audible pedestrian crossings around pilgrimage and market corridors.',
  },
]

/** Backward-compatible export for existing bar charts */
export const infrastructureGaps = cityGapAnalysis.map((item) => ({
  label: item.label,
  value: Math.round(item.cityGap),
  color: item.color,
  severity: item.severity,
}))

export interface TargetAreaInvestment {
  areaId: string
  areaName: string
  amountCr: number
  percent: number
  baselineScore: number
  projectedScore: number
  keyInitiative: string
}

export interface ExecutionPillar {
  title: string
  amountCr: number
  percent: number
  deliverable: string
}

export interface InvestmentPlan {
  objective: string
  targetAreas: TargetAreaInvestment[]
  executionPillars: ExecutionPillar[]
  cityUisGain: number
  beneficiaryCount: string
  timeline: string
  primaryRoi: string
}

export interface BudgetItem {
  key: keyof AreaSectorScores
  label: string
  value: number // percentage share of capital plan (sums to 100%)
  crAmount: number // in ₹ Crores (sums to ₹182 Cr)
  color: string
  gap: number // City-wide civic deficit gap %
  severity: 'Critical Deficit' | 'High Deficit' | 'Moderate Gap'
  rationale: string
  investmentPlan: InvestmentPlan
}

export const budgetAllocation: BudgetItem[] = [
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    value: 28,
    crAmount: 51.0,
    color: '#e25959',
    gap: 51.0,
    severity: 'Critical Deficit',
    rationale: 'Stormwater trunk lines, drainage renewal, and arterial road sub-bases in Panchavati & Satpur.',
    investmentPlan: {
      objective: 'Eliminate critical monsoon waterlogging choke points, restore deteriorated arterial road foundations, and modernize drinking water distribution networks in the most lagging zones.',
      targetAreas: [
        {
          areaId: 'panchavati',
          areaName: 'Panchavati (Heritage Core)',
          amountCr: 24.5,
          percent: 48,
          baselineScore: 32,
          projectedScore: 58,
          keyInitiative: 'Underground stormwater trunk lines along Godavari basin, floodgate renewals & sewer separation.',
        },
        {
          areaId: 'satpur',
          areaName: 'Satpur (Industrial Corridor)',
          amountCr: 16.5,
          percent: 32,
          baselineScore: 37,
          projectedScore: 61,
          keyInitiative: 'Heavy-duty arterial road recarpeting with anti-rutting sub-bases and industrial drainage network.',
        },
        {
          areaId: 'deolali',
          areaName: 'Deolali (Cantonment Belt)',
          amountCr: 10.0,
          percent: 20,
          baselineScore: 35,
          projectedScore: 56,
          keyInitiative: 'Pressurized drinking water utility grid modernization, road foundations & culvert reinforcement.',
        },
      ],
      executionPillars: [
        {
          title: 'Underground Stormwater & Drainage',
          amountCr: 22.5,
          percent: 44,
          deliverable: '18.4 km RCC box conduits & gravity mains in chronic waterlogging zones.',
        },
        {
          title: 'Heavy Arterial Road Recarpeting',
          amountCr: 18.0,
          percent: 35,
          deliverable: '34 km polymer-modified bitumen road reconstruction with reinforced sub-bases.',
        },
        {
          title: 'Pressurized Potable Water Grid',
          amountCr: 10.5,
          percent: 21,
          deliverable: '28 km ductile iron feeder pipes with smart pressure-equalizing valves.',
        },
      ],
      cityUisGain: 1.4,
      beneficiaryCount: '1,25,000 citizens',
      timeline: '14 Months (Q4 2027)',
      primaryRoi: 'Zero severe road waterlogging under 65 mm/hr downpour; 94% potable water pressure reliability.',
    },
  },
  {
    key: 'safety',
    label: 'Safety & Surveillance',
    value: 18,
    crAmount: 32.8,
    color: '#ed8043',
    gap: 43.8,
    severity: 'High Deficit',
    rationale: 'AI CCTV smart surveillance poles, high-mast LED floodlights, and police chowkis.',
    investmentPlan: {
      objective: 'Eradicate dark spots and blind industrial transit stretches with smart optical surveillance and high-mast LED networks connected to the Integrated Command & Control Center (ICCC).',
      targetAreas: [
        {
          areaId: 'satpur',
          areaName: 'Satpur (MIDC Industrial)',
          amountCr: 16.0,
          percent: 49,
          baselineScore: 31,
          projectedScore: 59,
          keyInitiative: '24/7 AI CCTV smart poles at plant gates, shift change points, and Trimbak Road.',
        },
        {
          areaId: 'dwarka',
          areaName: 'Dwarka (Transit Junction)',
          amountCr: 11.8,
          percent: 36,
          baselineScore: 35,
          projectedScore: 62,
          keyInitiative: 'High-mast illumination arrays & emergency SOS pedestals across Highway interchange.',
        },
        {
          areaId: 'panchavati',
          areaName: 'Panchavati (Heritage Ghats)',
          amountCr: 5.0,
          percent: 15,
          baselineScore: 62,
          projectedScore: 75,
          keyInitiative: 'Pilgrimage ghat optical perimeter sensors and crowd-density monitoring cameras.',
        },
      ],
      executionPillars: [
        {
          title: 'AI Smart Poles & PTZ Cameras',
          amountCr: 16.4,
          percent: 50,
          deliverable: '180 smart poles with automated incident detection linked to Nashik ICCC.',
        },
        {
          title: 'High-Mast LED Dark Spot Removal',
          amountCr: 10.2,
          percent: 31,
          deliverable: '45 high-mast floodlight towers across transit corridors and industrial fringe roads.',
        },
        {
          title: 'Emergency SOS & Rapid Chowkis',
          amountCr: 6.2,
          percent: 19,
          deliverable: '24 one-touch SOS citizen emergency pedestals + 4 modular police response outposts.',
        },
      ],
      cityUisGain: 0.9,
      beneficiaryCount: '95,000 daily commuters',
      timeline: '9 Months (Q2 2027)',
      primaryRoi: '42% reduction in nighttime transit incidents; emergency response window reduced to < 7 mins.',
    },
  },
  {
    key: 'environment',
    label: 'Environment & Greenery',
    value: 16,
    crAmount: 29.1,
    color: '#70b37f',
    gap: 42.2,
    severity: 'High Deficit',
    rationale: 'Godavari western bio-buffer, air quality monitoring, and decentralized wastewater interceptors.',
    investmentPlan: {
      objective: 'Build dense vegetative bio-filters around industrial estates and deploy decentralized wastewater interceptors to halt runoff into the Godavari riverbed.',
      targetAreas: [
        {
          areaId: 'satpur',
          areaName: 'Satpur (Industrial Perimeter)',
          amountCr: 14.0,
          percent: 48,
          baselineScore: 34,
          projectedScore: 58,
          keyInitiative: '12 km multi-tier Miyawaki green buffer along industrial boundary to absorb PM10/PM2.5.',
        },
        {
          areaId: 'gangapur',
          areaName: 'Gangapur (Riverfront Belt)',
          amountCr: 10.5,
          percent: 36,
          baselineScore: 35,
          projectedScore: 63,
          keyInitiative: 'Someshwar riverfront decentralized bio-interceptors & natural wetland stabilization.',
        },
        {
          areaId: 'dwarka',
          areaName: 'Dwarka (Highway Corridor)',
          amountCr: 4.6,
          percent: 16,
          baselineScore: 48,
          projectedScore: 64,
          keyInitiative: 'Dense avenue plantation and roadside particulate absorption barriers.',
        },
      ],
      executionPillars: [
        {
          title: 'Industrial Bio-Buffer Green Belts',
          amountCr: 13.0,
          percent: 45,
          deliverable: 'Planting 85,000 native evergreen canopy trees along the Satpur MIDC perimeter.',
        },
        {
          title: 'Riverfront Wastewater Interceptors',
          amountCr: 10.5,
          percent: 36,
          deliverable: '6 decentralized phytoremediation bio-retention ponds along Godavari tributaries.',
        },
        {
          title: 'Real-Time Air/Water Sensor Grid',
          amountCr: 5.6,
          percent: 19,
          deliverable: '28 continuous ambient air & water monitoring stations with public LED displays.',
        },
      ],
      cityUisGain: 0.8,
      beneficiaryCount: '1,80,000 residents',
      timeline: '12 Months (Q3 2027)',
      primaryRoi: '18% decrease in ambient particulate matter; 99% stoppage of untreated storm runoff into Godavari.',
    },
  },
  {
    key: 'transport',
    label: 'Transport & Transit',
    value: 15,
    crAmount: 27.3,
    color: '#f09c3d',
    gap: 41.0,
    severity: 'High Deficit',
    rationale: '40 Citilinc electric midi-buses, high-frequency feeder routes, and terminal depot charging.',
    investmentPlan: {
      objective: 'Deploy a clean, accessible zero-emission feeder transit network with dedicated worker loop shuttles and high-frequency historic core connections.',
      targetAreas: [
        {
          areaId: 'panchavati',
          areaName: 'Panchavati (Heritage Streets)',
          amountCr: 14.5,
          percent: 53,
          baselineScore: 35,
          projectedScore: 62,
          keyInitiative: 'High-frequency electric midi-bus loops navigating narrow heritage lanes & ghats.',
        },
        {
          areaId: 'satpur',
          areaName: 'Satpur (Worker Shuttles)',
          amountCr: 9.0,
          percent: 33,
          baselineScore: 45,
          projectedScore: 66,
          keyInitiative: 'Dedicated industrial shift commuter shuttles between MIDC and residential clusters.',
        },
        {
          areaId: 'dwarka',
          areaName: 'Dwarka (Interchange Hub)',
          amountCr: 3.8,
          percent: 14,
          baselineScore: 55,
          projectedScore: 71,
          keyInitiative: 'Multi-modal interchange bay upgrades with integrated digital passenger information.',
        },
      ],
      executionPillars: [
        {
          title: 'Electric Midi-Bus Fleet Acquisition',
          amountCr: 15.8,
          percent: 58,
          deliverable: '40 air-conditioned 9-meter electric midi-buses custom designed for dense streets.',
        },
        {
          title: 'Depot Fast-Charging Infrastructure',
          amountCr: 7.5,
          percent: 27,
          deliverable: '12 dual-gun 120kW DC fast charging stations at central Panchavati & Satpur depots.',
        },
        {
          title: 'Intelligent Transit Management (ITMS)',
          amountCr: 4.0,
          percent: 15,
          deliverable: 'GPS live tracking on Citilinc app, contactless smart cards & automated fare gates.',
        },
      ],
      cityUisGain: 0.7,
      beneficiaryCount: '70,000 daily transit users',
      timeline: '10 Months (Q3 2027)',
      primaryRoi: 'Bus waiting intervals halved from 26 min to 11 min; 3,200 tons annual CO2 displacement.',
    },
  },
  {
    key: 'education',
    label: 'Education & Skills',
    value: 10,
    crAmount: 18.2,
    color: '#6e85e0',
    gap: 36.7,
    severity: 'Moderate Gap',
    rationale: 'Smart STEM campus upgrades across 12 municipal secondary schools and Satpur vocational center.',
    investmentPlan: {
      objective: 'Bridge educational infrastructure disparity by upgrading municipal schools into smart STEM centers and establishing vocational apprenticeship hubs.',
      targetAreas: [
        {
          areaId: 'satpur',
          areaName: 'Satpur (Vocational Hub)',
          amountCr: 11.2,
          percent: 62,
          baselineScore: 39,
          projectedScore: 64,
          keyInitiative: 'Satpur Advanced Municipal Vocational Center for precision machining & electronics skills.',
        },
        {
          areaId: 'dwarka',
          areaName: 'Dwarka (Municipal High Schools)',
          amountCr: 4.5,
          percent: 25,
          baselineScore: 58,
          projectedScore: 74,
          keyInitiative: 'Smart interactive classrooms and computer labs across 6 municipal high schools.',
        },
        {
          areaId: 'panchavati',
          areaName: 'Panchavati (Heritage Schools)',
          amountCr: 2.5,
          percent: 13,
          baselineScore: 64,
          projectedScore: 76,
          keyInitiative: 'Modern science laboratories and digital public library infrastructure.',
        },
      ],
      executionPillars: [
        {
          title: 'Vocational & Technical Training Hub',
          amountCr: 9.8,
          percent: 54,
          deliverable: '1 modern apprenticeship facility equipped with CNC simulators and robotics training kits.',
        },
        {
          title: 'Smart STEM Classrooms & Labs',
          amountCr: 5.4,
          percent: 30,
          deliverable: '24 digital classrooms with interactive flat panels and high-speed fiber internet.',
        },
        {
          title: 'School Sanitation & Campus Refurbishment',
          amountCr: 3.0,
          percent: 16,
          deliverable: 'Hygienic wash facilities, solar rooftop power, and structural repairs in 12 schools.',
        },
      ],
      cityUisGain: 0.5,
      beneficiaryCount: '14,500 students & trainees',
      timeline: '8 Months (Q2 2027)',
      primaryRoi: '85% placement rate for vocational trainees; digital learning access expanded by 340%.',
    },
  },
  {
    key: 'healthcare',
    label: 'Healthcare Access',
    value: 8,
    crAmount: 14.6,
    color: '#da6092',
    gap: 32.2,
    severity: 'Moderate Gap',
    rationale: '100-bed industrial trauma care hospital in Satpur and urban primary health clinic retrofits.',
    investmentPlan: {
      objective: 'Fill the critical gap in emergency trauma stabilization in industrial zones and upgrade Urban Primary Health Centers (UPHC).',
      targetAreas: [
        {
          areaId: 'satpur',
          areaName: 'Satpur (Industrial Trauma)',
          amountCr: 10.8,
          percent: 74,
          baselineScore: 38,
          projectedScore: 68,
          keyInitiative: '100-bed Civil Trauma & Occupational Health Hospital on Trimbak Road corridor.',
        },
        {
          areaId: 'deolali',
          areaName: 'Deolali (Maternity Clinic)',
          amountCr: 2.5,
          percent: 17,
          baselineScore: 67,
          projectedScore: 78,
          keyInitiative: '24/7 Maternity, Child Welfare & Emergency Stabilization wing at Cantonment clinic.',
        },
        {
          areaId: 'dwarka',
          areaName: 'Dwarka (UPHC Diagnostic)',
          amountCr: 1.3,
          percent: 9,
          baselineScore: 70,
          projectedScore: 79,
          keyInitiative: 'Diagnostic pathology automation & telemedicine nodes at Dwarka UPHC.',
        },
      ],
      executionPillars: [
        {
          title: 'Trauma & Occupational Hospital Wing',
          amountCr: 9.2,
          percent: 63,
          deliverable: '100-bed facility with 2 modular operation theaters, burn unit, and 10 ICU beds.',
        },
        {
          title: 'Advanced Diagnostic & ICU Equipment',
          amountCr: 3.8,
          percent: 26,
          deliverable: 'Digital X-ray, multi-parameter patient monitors, and 4 ALS life-support ambulances.',
        },
        {
          title: 'UPHC Tele-Medicine Upgrades',
          amountCr: 1.6,
          percent: 11,
          deliverable: 'EHR systems and specialist tele-consultation links across 3 peripheral clinics.',
        },
      ],
      cityUisGain: 0.4,
      beneficiaryCount: '62,000 patients annually',
      timeline: '11 Months (Q3 2027)',
      primaryRoi: 'Emergency golden-hour trauma transit time dropped from 38 mins to under 12 mins in Satpur.',
    },
  },
  {
    key: 'accessibility',
    label: 'Accessibility & Walk',
    value: 5,
    crAmount: 9.0,
    color: '#53a8be',
    gap: 30.2,
    severity: 'Moderate Gap',
    rationale: 'Universal barrier-free footpaths, tactile pavers, and audible pedestrian crossing signals.',
    investmentPlan: {
      objective: 'Install universal barrier-free pedestrian corridors, tactile paving, and audio-assisted traffic crossings along pilgrimage and industrial pedestrian spines.',
      targetAreas: [
        {
          areaId: 'satpur',
          areaName: 'Satpur (MIDC Pedestrian Corridor)',
          amountCr: 4.5,
          percent: 50,
          baselineScore: 48,
          projectedScore: 69,
          keyInitiative: 'Wide barrier-free footpaths with tree canopy shading along busy worker commute arteries.',
        },
        {
          areaId: 'panchavati',
          areaName: 'Panchavati (Heritage Walkway)',
          amountCr: 3.2,
          percent: 36,
          baselineScore: 67,
          projectedScore: 82,
          keyInitiative: 'Continuous tactile paving, non-slip ramps, and pedestrian-only heritage zones.',
        },
        {
          areaId: 'cidco',
          areaName: 'CIDCO (Township Crossroads)',
          amountCr: 1.3,
          percent: 14,
          baselineScore: 75,
          projectedScore: 86,
          keyInitiative: 'Standardized curb ramps and audible pedestrian signals at all major sector crossroads.',
        },
      ],
      executionPillars: [
        {
          title: 'Tactile Sidewalks & Curb Ramps',
          amountCr: 5.2,
          percent: 58,
          deliverable: '16.5 km universal barrier-free pedestrian walkways with detectable warning surfaces.',
        },
        {
          title: 'Smart Pedestrian Crossings & Signals',
          amountCr: 2.3,
          percent: 26,
          deliverable: '18 audible pedestrian push-button crossing signals and zebra illumination.',
        },
        {
          title: 'Anti-Encroachment Bollards & Shading',
          amountCr: 1.5,
          percent: 16,
          deliverable: 'Stainless steel safety bollards, resting benches, and pedestrian wayfinding maps.',
        },
      ],
      cityUisGain: 0.3,
      beneficiaryCount: '1,10,000 pedestrians daily',
      timeline: '6 Months (Q1 2027)',
      primaryRoi: 'Universal ADA-compliant accessibility across pilgrimage & transit hubs; 58% drop in pedestrian collisions.',
    },
  },
]

export interface DemoProject {
  id: string
  name: string
  sector: string
  sectorKey: string
  area: string
  areaId: string
  deliverable: string
  deficitAddressed: string
  budget: string
  progress: number
  phase: string
  status: 'On track' | 'In review' | 'Completed'
  timeline: string
  agency: string
}

export const demoProjects: DemoProject[] = [
  {
    id: 'p1',
    name: 'Panchavati Underground Stormwater Trunk Grid',
    sector: 'Infrastructure',
    sectorKey: 'infrastructure',
    area: 'Panchavati',
    areaId: 'panchavati',
    deliverable: '18.4 km RCC box conduits & gravity mains along Godavari riverfront basin',
    deficitAddressed: 'Drainage Bottlenecks',
    budget: '₹24.5 Cr',
    progress: 74,
    phase: 'Phase 2 Culvert Laying',
    status: 'On track',
    timeline: 'Q4 2027',
    agency: 'NMC Stormwater Dept',
  },
  {
    id: 'p2',
    name: 'Satpur MIDC 24/7 AI Smart Surveillance & SOS Network',
    sector: 'Safety & Surveillance',
    sectorKey: 'safety',
    area: 'Satpur',
    areaId: 'satpur',
    deliverable: '180 smart poles with automated incident detection linked to Nashik ICCC',
    deficitAddressed: 'Shift Worker Night Safety',
    budget: '₹16.0 Cr',
    progress: 52,
    phase: 'Optical Fiber Splicing',
    status: 'In review',
    timeline: 'Q2 2027',
    agency: 'Nashik Smart City (ICCC)',
  },
  {
    id: 'p3',
    name: 'Godavari Western Bio-Buffer & Effluent Interceptors',
    sector: 'Environment & Greenery',
    sectorKey: 'environment',
    area: 'Gangapur Road',
    areaId: 'gangapur',
    deliverable: '85,000 native canopy trees + 6 phytoremediation bio-retention ponds',
    deficitAddressed: 'River Runoff & PM10 Dust',
    budget: '₹10.5 Cr',
    progress: 88,
    phase: 'Final Bio-Filter Validation',
    status: 'On track',
    timeline: 'Q3 2027',
    agency: 'Maharashtra Pollution Board / NMC',
  },
  {
    id: 'p4',
    name: 'Citilinc Zero-Emission Electric Midi-Bus Feeder Loops',
    sector: 'Transport & Transit',
    sectorKey: 'transport',
    area: 'Panchavati & Satpur',
    areaId: 'panchavati',
    deliverable: '40 electric midi-buses on circular loops + 12 dual-gun 120kW fast chargers',
    deficitAddressed: 'Transit Headways > 25m',
    budget: '₹15.8 Cr',
    progress: 64,
    phase: 'Depot Charger Commissioning',
    status: 'On track',
    timeline: 'Q3 2027',
    agency: 'Citilinc Nashik Mahanagar Bus',
  },
  {
    id: 'p5',
    name: 'Satpur Trimbak Corridor 100-Bed Civic Trauma Center',
    sector: 'Healthcare Access',
    sectorKey: 'healthcare',
    area: 'Satpur',
    areaId: 'satpur',
    deliverable: '100-bed trauma suite, 2 modular operation theaters & 4 ALS ambulances',
    deficitAddressed: 'Emergency Golden-Hour Gap',
    budget: '₹10.8 Cr',
    progress: 36,
    phase: 'Structural Framework (L2)',
    status: 'In review',
    timeline: 'Q4 2027',
    agency: 'District Civil Hospital / NMC',
  },
  {
    id: 'p6',
    name: 'Deolali Pressurized Potable Water Grid Modernization',
    sector: 'Infrastructure',
    sectorKey: 'infrastructure',
    area: 'Deolali',
    areaId: 'deolali',
    deliverable: '28 km ductile iron feeder pipelines with pressure-equalizing smart valves',
    deficitAddressed: 'Water Line Age & Low Pressure',
    budget: '₹10.0 Cr',
    progress: 45,
    phase: 'Trenching & Valve Fitting',
    status: 'In review',
    timeline: 'Q4 2027',
    agency: 'Cantonment Board & NMC Water',
  },
  {
    id: 'p7',
    name: 'Satpur Advanced Municipal Vocational & Robotics Hub',
    sector: 'Education & Skill Hubs',
    sectorKey: 'education',
    area: 'Satpur',
    areaId: 'satpur',
    deliverable: 'Precision CNC machining simulators & technical apprenticeship workshop',
    deficitAddressed: 'Vocational Skill Disparity',
    budget: '₹11.2 Cr',
    progress: 68,
    phase: 'Equipment Calibration',
    status: 'On track',
    timeline: 'Q2 2027',
    agency: 'Maharashtra Skill Dev Mission',
  },
  {
    id: 'p8',
    name: 'Dwarka Multimodal Pedestrian Skywalk & Tactile Corridors',
    sector: 'Accessibility & Walkability',
    sectorKey: 'accessibility',
    area: 'Dwarka Circle',
    areaId: 'dwarka',
    deliverable: '16.5 km universal barrier-free sidewalks, tactile pavers & audible signals',
    deficitAddressed: 'High Pedestrian Conflict Zone',
    budget: '₹8.5 Cr',
    progress: 58,
    phase: 'Grade Crossing Installation',
    status: 'On track',
    timeline: 'Q1 2027',
    agency: 'National Highways & PWD',
  },
  {
    id: 'p9',
    name: 'CIDCO Smart Neighborhood Secondary Stormwater Upgrades',
    sector: 'Infrastructure',
    sectorKey: 'infrastructure',
    area: 'CIDCO',
    areaId: 'cidco',
    deliverable: 'Automated floodgate sensors, culvert expansion & runoff telemetry',
    deficitAddressed: 'Secondary Conduit Capacity',
    budget: '₹6.2 Cr',
    progress: 92,
    phase: 'Final Telemetry Handover',
    status: 'Completed',
    timeline: 'Q1 2027',
    agency: 'CIDCO Urban Planning Div',
  },
]

export const dashboardMetrics = [
  {
    label: 'City UIS',
    value: '72.4',
    suffix: '/ 100',
    note: 'Citizen dashboard demo value',
    tone: 'green',
    icon: 'score',
  },
  {
    label: 'Priority Areas',
    value: '2',
    suffix: '',
    note: 'Satpur (67.5) & Deolali (69.4)',
    tone: 'blue',
    icon: 'areas',
  },
  {
    label: 'Active Projects',
    value: '3',
    suffix: '',
    note: 'Targeted civic works in progress',
    tone: 'orange',
    icon: 'projects',
  },
  {
    label: 'Total Budget',
    value: '₹182',
    suffix: ' Cr',
    note: 'Civic capital expenditure plan',
    tone: 'purple',
    icon: 'infrastructure',
  },
  {
    label: 'Projected City UIS',
    value: '—',
    suffix: '',
    note: 'Run simulation below to calculate',
    tone: 'teal',
    icon: 'score',
  },
  {
    label: 'Population Covered',
    value: '2.64',
    suffix: ' L',
    note: 'Representative 6-zone population',
    tone: 'amber',
    icon: 'coverage',
  },
] as const

export interface ImprovementOption {
  id: string
  label: string
  sectorKey: keyof AreaSectorScores
  sectorName: string
  spilloverSectors: { key: keyof AreaSectorScores; spilloverFactor: number }[]
  description: string
  baseUnitCostCr: number
  priorityTag?: string
  areaId?: string
}

export const baseImprovementCatalog: ImprovementOption[] = [
  {
    id: 'drainage-infrastructure',
    label: 'Smart Drainage & Stormwater Utility Grid',
    sectorKey: 'infrastructure',
    sectorName: 'Infrastructure',
    spilloverSectors: [
      { key: 'transport', spilloverFactor: 0.22 },
      { key: 'safety', spilloverFactor: 0.15 },
    ],
    description: 'Underground high-capacity stormwater conduit network, road sub-base reconstruction, and digital sensor flood monitoring.',
    baseUnitCostCr: 15,
  },
  {
    id: 'public-transport',
    label: 'Citilinc Bus Corridor & Feeder Transit',
    sectorKey: 'transport',
    sectorName: 'Transport & Transit',
    spilloverSectors: [
      { key: 'accessibility', spilloverFactor: 0.35 },
      { key: 'environment', spilloverFactor: 0.2 },
    ],
    description: 'Electric midi-bus fleet expansion, high-frequency feeder routes, digital bus stops, and dedicated transit boarding lanes.',
    baseUnitCostCr: 18,
  },
  {
    id: 'safety-surveillance',
    label: 'Integrated Police Surveillance & Street Lighting',
    sectorKey: 'safety',
    sectorName: 'Safety & Surveillance',
    spilloverSectors: [
      { key: 'accessibility', spilloverFactor: 0.25 },
      { key: 'infrastructure', spilloverFactor: 0.1 },
    ],
    description: 'High-mast LED lighting at blind spots, automated AI traffic surveillance, SOS kiosks, and 24/7 quick-response police chowkis.',
    baseUnitCostCr: 12,
  },
  {
    id: 'hospital-health',
    label: 'New Civil Hospital & Trauma Hub',
    sectorKey: 'healthcare',
    sectorName: 'Healthcare Access',
    spilloverSectors: [
      { key: 'safety', spilloverFactor: 0.12 },
    ],
    description: '100-bed multispeciality civic hospital with 24/7 emergency trauma suite, neonatal ICU, and subsidized generic diagnostic dispensary.',
    baseUnitCostCr: 20,
  },
  {
    id: 'green-corridor',
    label: 'Godavari Eco-Corridor & Air Quality Buffer',
    sectorKey: 'environment',
    sectorName: 'Environment & Greenery',
    spilloverSectors: [
      { key: 'accessibility', spilloverFactor: 0.2 },
      { key: 'healthcare', spilloverFactor: 0.15 },
    ],
    description: 'Riverfront bio-remediation wetlands, urban afforestation belt, Miyawaki micro-forests, and continuous air quality monitoring stations.',
    baseUnitCostCr: 14,
  },
  {
    id: 'smart-schools',
    label: 'Smart Municipal Schools & Vocational Tech Lab',
    sectorKey: 'education',
    sectorName: 'Education & Skill Hubs',
    spilloverSectors: [
      { key: 'infrastructure', spilloverFactor: 0.1 },
    ],
    description: 'Digital classrooms, robotic & STEM laboratories, vocational apprenticeships for youth, and solar-powered campus infrastructure.',
    baseUnitCostCr: 10,
  },
  {
    id: 'walkable-pedestrian',
    label: 'Universal Barrier-Free Pedestrian Walkways',
    sectorKey: 'accessibility',
    sectorName: 'Accessibility & Walkability',
    spilloverSectors: [
      { key: 'safety', spilloverFactor: 0.28 },
      { key: 'transport', spilloverFactor: 0.18 },
    ],
    description: 'Wide, obstacle-free footpaths with tactile ground indicators, wheelchair ramps, raised pedestrian crosswalks, and sheltered seating.',
    baseUnitCostCr: 8,
  },
]

/**
 * Area-Specific Civic Improvement Options
 * Only contains improvements that are genuinely needed based on each area's actual deficit indicators.
 * Areas with few deficits only have the specific projects they need; areas with broader deficits have projects addressing those specific gaps.
 */
export const areaSpecificImprovements: Record<string, ImprovementOption[]> = {
  dwarka: [
    {
      id: 'dwarka-safety-junction',
      areaId: 'dwarka',
      label: 'Highway Junction AI Traffic & Police Chowki Grid',
      sectorKey: 'safety',
      sectorName: 'Safety & Surveillance',
      priorityTag: 'Critical Deficit (35 UIS)',
      spilloverSectors: [
        { key: 'transport', spilloverFactor: 0.35 },
        { key: 'accessibility', spilloverFactor: 0.28 },
      ],
      description: 'Intelligent CCTV traffic enforcement, illuminated highway crossings, and 24/7 rapid response police chowkis at Dwarka Circle.',
      baseUnitCostCr: 14,
    },
    {
      id: 'dwarka-education-smart-schools',
      areaId: 'dwarka',
      label: 'Dwarka Municipal Smart Schools & Digital Tech Lab',
      sectorKey: 'education',
      sectorName: 'Education & Skill Hubs',
      priorityTag: 'Key Deficit (58 UIS)',
      spilloverSectors: [
        { key: 'infrastructure', spilloverFactor: 0.15 },
      ],
      description: 'Modernizing secondary municipal schools with digital STEM classrooms, coding labs, and student skill workshops.',
      baseUnitCostCr: 12,
    },
  ],
  deolali: [
    {
      id: 'deolali-water-subbase',
      areaId: 'deolali',
      label: 'Municipal Water Line Augmentation & Road Sub-Base Modernization',
      sectorKey: 'infrastructure',
      sectorName: 'Infrastructure',
      priorityTag: 'Critical Deficit (35 UIS)',
      spilloverSectors: [
        { key: 'transport', spilloverFactor: 0.22 },
        { key: 'environment', spilloverFactor: 0.16 },
      ],
      description: 'Replacing century-old water distribution mains, pressurized booster stations, and comprehensive asphalt sub-base overhaul.',
      baseUnitCostCr: 19,
    },
  ],
  gangapur: [
    {
      id: 'gangapur-wetland-runoff',
      areaId: 'gangapur',
      label: 'Someshwar Riverfront Bio-Filter Wetland & Decentrally Intercepted Runoff',
      sectorKey: 'environment',
      sectorName: 'Environment & Greenery',
      priorityTag: 'Critical Deficit (35 UIS)',
      spilloverSectors: [
        { key: 'healthcare', spilloverFactor: 0.22 },
        { key: 'accessibility', spilloverFactor: 0.18 },
      ],
      description: 'Ecological wetland buffer along Gangapur dam tailwaters to purify agricultural runoff and preserve riverine biodiversity.',
      baseUnitCostCr: 16,
    },
  ],
  cidco: [
    {
      id: 'cidco-secondary-drainage',
      areaId: 'cidco',
      label: 'Sectoral Secondary Drainage Conduit Retrofit & Smart Water Metering',
      sectorKey: 'infrastructure',
      sectorName: 'Infrastructure',
      priorityTag: 'Identified Deficit (68 UIS)',
      spilloverSectors: [
        { key: 'transport', spilloverFactor: 0.2 },
        { key: 'environment', spilloverFactor: 0.15 },
      ],
      description: 'Upgrading internal neighborhood storm drains and installing automated ultrasonic telemetry water meters across CIDCO sectors.',
      baseUnitCostCr: 17,
    },
  ],
  panchavati: [
    {
      id: 'panchavati-stormwater-trunk',
      areaId: 'panchavati',
      label: 'Underground Stormwater Trunk Line & Godavari Floodgate Renewal',
      sectorKey: 'infrastructure',
      sectorName: 'Infrastructure',
      priorityTag: 'Critical Deficit (32 UIS)',
      spilloverSectors: [
        { key: 'transport', spilloverFactor: 0.25 },
        { key: 'safety', spilloverFactor: 0.2 },
      ],
      description: 'Large-diameter underground stormwater conduits, smart floodgate telemetry, and sewer-stormwater line separation along riverbanks.',
      baseUnitCostCr: 24,
    },
    {
      id: 'panchavati-heritage-transit',
      areaId: 'panchavati',
      label: 'Electric Feeder Midi-Buses & Heritage Core Shuttles (Panchavati Loop)',
      sectorKey: 'transport',
      sectorName: 'Transport & Transit',
      priorityTag: 'Critical Deficit (35 UIS)',
      spilloverSectors: [
        { key: 'accessibility', spilloverFactor: 0.36 },
        { key: 'environment', spilloverFactor: 0.24 },
      ],
      description: 'Zero-emission compact electric shuttles navigating narrow historic lanes between Panchavati Karanja, Ramkund, and bus depots.',
      baseUnitCostCr: 16,
    },
  ],
  satpur: [
    {
      id: 'satpur-safety-midc',
      areaId: 'satpur',
      label: 'MIDC Night Shift CCTV Surveillance & Smart Lighting',
      sectorKey: 'safety',
      sectorName: 'Safety & Surveillance',
      priorityTag: 'Critical Deficit (31 UIS)',
      spilloverSectors: [
        { key: 'accessibility', spilloverFactor: 0.3 },
        { key: 'infrastructure', spilloverFactor: 0.15 },
      ],
      description: 'High-mast LED lighting along industrial avenues, automated AI surveillance, emergency SOS towers, and worker safety patrols.',
      baseUnitCostCr: 12,
    },
    {
      id: 'satpur-env-effluent',
      areaId: 'satpur',
      label: 'MIDC Industrial Effluent Treatment & Green Buffer Afforestation',
      sectorKey: 'environment',
      sectorName: 'Environment & Greenery',
      priorityTag: 'Critical Deficit (34 UIS)',
      spilloverSectors: [
        { key: 'healthcare', spilloverFactor: 0.22 },
        { key: 'accessibility', spilloverFactor: 0.14 },
      ],
      description: 'Common effluent pre-treatment monitoring, decentralized air filtration towers, and a 10 km green barrier separating residential wards.',
      baseUnitCostCr: 18,
    },
    {
      id: 'satpur-infra-heavy-roads',
      areaId: 'satpur',
      label: 'Heavy-Vehicle Road Sub-Base Recarpeting & Industrial Drainage Grid',
      sectorKey: 'infrastructure',
      sectorName: 'Infrastructure',
      priorityTag: 'Critical Deficit (37 UIS)',
      spilloverSectors: [
        { key: 'transport', spilloverFactor: 0.28 },
        { key: 'safety', spilloverFactor: 0.16 },
      ],
      description: 'Reinforced concrete arterial roadways designed for industrial freight and reinforced stormwater diversion channels.',
      baseUnitCostCr: 20,
    },
    {
      id: 'satpur-health-workers',
      areaId: 'satpur',
      label: 'Satpur 100-Bed Industrial Workers Trauma & ESI Hospital',
      sectorKey: 'healthcare',
      sectorName: 'Healthcare Access',
      priorityTag: 'Critical Deficit (38 UIS)',
      spilloverSectors: [
        { key: 'safety', spilloverFactor: 0.18 },
      ],
      description: 'Constructing a specialized 24/7 occupational health hospital with emergency trauma suites for factory workforce.',
      baseUnitCostCr: 22,
    },
    {
      id: 'satpur-edu-vocational',
      areaId: 'satpur',
      label: 'Satpur Vocational Apprenticeship & Technical Skill Center',
      sectorKey: 'education',
      sectorName: 'Education & Skill Hubs',
      priorityTag: 'Critical Deficit (39 UIS)',
      spilloverSectors: [
        { key: 'infrastructure', spilloverFactor: 0.12 },
      ],
      description: 'Advanced manufacturing, robotics, and industrial automation training hub for local youth and factory apprentices.',
      baseUnitCostCr: 11,
    },
    {
      id: 'satpur-transit-shuttles',
      areaId: 'satpur',
      label: 'Worker Transit Corridor & Citilinc Shift Shuttles',
      sectorKey: 'transport',
      sectorName: 'Transport & Transit',
      priorityTag: 'High Deficit (45 UIS)',
      spilloverSectors: [
        { key: 'accessibility', spilloverFactor: 0.32 },
        { key: 'environment', spilloverFactor: 0.18 },
      ],
      description: 'Dedicated electric bus loops synchronized with factory shift timings between Satpur, Ambad, and worker residential colonies.',
      baseUnitCostCr: 14,
    },
  ],
}

/**
 * Combined catalog of all improvements (generic base + all area-specific options)
 */
export const improvementCatalog: ImprovementOption[] = [
  ...baseImprovementCatalog,
  ...Object.values(areaSpecificImprovements).flat(),
]

/**
 * Returns the relevant improvement options for a selected area.
 * If an areaId is provided, returns the tailored list of improvements designed for that area.
 * Otherwise returns base catalog.
 */
export function getImprovementsForArea(areaId?: string): ImprovementOption[] {
  if (!areaId) return []
  const key = areaId.toLowerCase().trim()
  const list = areaSpecificImprovements[key]
  if (list && list.length > 0) {
    return list
  }
  return []
}


export interface SimulationResult {
  areaId: string
  areaName: string
  investmentCr: number
  improvement: ImprovementOption
  currentAreaUIS: number
  projectedAreaUIS: number
  deltaAreaUIS: number
  currentCityUIS: number
  projectedCityUIS: number
  deltaCityUIS: number
  currentSectorScore: number
  projectedSectorScore: number
  deltaSectorScore: number
  benefitedPopulation: number
  benefitedPopulationPct: number
  efficiencyIndex: 'Exceptional ROI' | 'High Impact' | 'Moderate Yield' | 'Diminishing Returns'
  efficiencyTone: 'green' | 'blue' | 'amber'
  rationale: string
  breakdown: {
    sector: string
    before: number
    after: number
    gain: number
  }[]
}

/**
 * Intelligent What-If Simulation Engine
 * Takes into account:
 * 1. Target area's actual deficit in the selected sector (Need-based elasticity).
 * 2. Diminishing marginal returns of capital (logarithmic saturation curve).
 * 3. Cross-sector positive externalities (spillover to transport, safety, accessibility).
 * 4. Realistic population-weighted aggregation for the projected City UIS.
 */
export function simulateCivicImprovement(
  areaId: string,
  improvementLabel: string,
  investmentCr: number
): SimulationResult {
  const area = areaUIS.find((a) => a.id === areaId) ?? areaUIS[0]
  const improvement =
    improvementCatalog.find((i) => i.label === improvementLabel) ??
    improvementCatalog.find((i) => i.sectorName === improvementLabel) ??
    improvementCatalog[0]

  const sectorKey = improvement.sectorKey
  const currentSectorScore = area.sectors[sectorKey]
  const sectorGap = 100 - currentSectorScore

  // Need elasticity: higher deficit yields higher marginal return per Rupee
  // If sector is already 86/100, elasticity is 0.14; if sector is 31/100, elasticity is 0.69
  const needElasticity = Math.max(0.18, sectorGap / 100)

  // Capital saturation curve: logarithmic gain with capital half-life
  const capitalScale = Math.log(1 + investmentCr / 14) * 21
  const directSectorGain = Math.min(
    sectorGap,
    Math.round(capitalScale * needElasticity * 1.35)
  )
  const projectedSectorScore = Math.min(98, currentSectorScore + directSectorGain)

  // Calculate spillover impacts across related sectors
  const sectorBreakdown: SimulationResult['breakdown'] = [
    {
      sector: improvement.sectorName,
      before: currentSectorScore,
      after: projectedSectorScore,
      gain: directSectorGain,
    },
  ]

  let totalCompositeGainSum = directSectorGain

  improvement.spilloverSectors.forEach(({ key, spilloverFactor }) => {
    const baseline = area.sectors[key]
    const gap = 100 - baseline
    const spilloverGain = Math.min(gap, Math.round(directSectorGain * spilloverFactor * (gap / 80)))
    totalCompositeGainSum += spilloverGain
    const sectorMeta = cityGapAnalysis.find((s) => s.key === key)
    sectorBreakdown.push({
      sector: sectorMeta?.label ?? key,
      before: baseline,
      after: Math.min(98, baseline + spilloverGain),
      gain: spilloverGain,
    })
  })

  // Area composite UIS has 7 sectors: area score delta is damped composite
  const rawAreaDelta = totalCompositeGainSum / 7
  const deltaAreaUIS = Math.min(
    100 - area.score,
    Math.round((rawAreaDelta * 0.9) * 10) / 10
  )
  const projectedAreaUIS = Math.min(99.4, Math.round((area.score + deltaAreaUIS) * 10) / 10)

  // Population-weighted contribution to overall City UIS:
  // CityUIS = sum(AreaUIS_i * Pop_i) / TotalPop
  // Plus regional inter-ward network factor (1.15)
  const areaPopWeight = area.populationDemoCount / cityOverview.totalPopulation
  const deltaCityUIS = Math.round((deltaAreaUIS * areaPopWeight * 1.18) * 10) / 10
  const projectedCityUIS = Math.min(98.8, Math.round((cityOverview.uis + deltaCityUIS) * 10) / 10)

  // Direct population catchment benefited
  const reachFraction = Math.min(1.0, 0.42 + (investmentCr / 100) * 0.58)
  const benefitedPopulation = Math.round(area.populationDemoCount * reachFraction)
  const benefitedPopulationPct = Math.round(reachFraction * 100)

  // Strategic classification & rationale
  let efficiencyIndex: SimulationResult['efficiencyIndex'] = 'High Impact'
  let efficiencyTone: SimulationResult['efficiencyTone'] = 'blue'
  let rationale = ''

  if (needElasticity > 0.55 && investmentCr >= 15) {
    efficiencyIndex = 'Exceptional ROI'
    efficiencyTone = 'green'
    rationale = `High-leverage intervention: ${area.name} currently suffers from an acute ${improvement.sectorName.toLowerCase()} deficit (${sectorGap}% gap). Allocating ₹${investmentCr} Cr directly resolves this critical civic bottleneck, lifting ${area.name}'s UIS by +${deltaAreaUIS} points and advancing Nashik's overall City UIS to ${projectedCityUIS}.`
  } else if (needElasticity < 0.28) {
    efficiencyIndex = 'Diminishing Returns'
    efficiencyTone = 'amber'
    rationale = `Marginal efficiency detected: ${area.name} already possesses strong ${improvement.sectorName.toLowerCase()} capacity (${currentSectorScore} UIS). This ₹${investmentCr} Cr investment yields modest gains (+${deltaAreaUIS} area UIS). Reallocating capital to higher-deficit areas like ${areaUIS[0].name} or ${areaUIS[1].name} would generate up to 2.8× higher city-wide impact.`
  } else {
    efficiencyIndex = 'High Impact'
    efficiencyTone = 'blue'
    rationale = `Balanced civic investment: Enhancing ${improvement.sectorName.toLowerCase()} in ${area.name} improves primary service coverage from ${currentSectorScore} to ${projectedSectorScore} UIS, benefiting ${benefitedPopulation.toLocaleString('en-IN')} residents and delivering positive cross-sector spillovers.`
  }

  return {
    areaId: area.id,
    areaName: area.name,
    investmentCr,
    improvement,
    currentAreaUIS: area.score,
    projectedAreaUIS,
    deltaAreaUIS,
    currentCityUIS: cityOverview.uis,
    projectedCityUIS,
    deltaCityUIS,
    currentSectorScore,
    projectedSectorScore,
    deltaSectorScore: directSectorGain,
    benefitedPopulation,
    benefitedPopulationPct,
    efficiencyIndex,
    efficiencyTone,
    rationale,
    breakdown: sectorBreakdown,
  }
}
