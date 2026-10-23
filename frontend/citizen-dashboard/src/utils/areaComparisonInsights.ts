export interface CivicInsightItem {
  title: string
  indicator?: string
  score?: number
  category?: string
  reason: string
}

export interface AreaCivicProfile {
  id: string
  name: string
  character: string
  keyStrengths: CivicInsightItem[]
  keyChallenges: CivicInsightItem[]
  civicSummary: string
}

export const AREA_CIVIC_PROFILES: Record<string, AreaCivicProfile> = {
  cidco: {
    id: 'cidco',
    name: 'CIDCO',
    character: 'Planned residential sector with robust civic infrastructure and high medical density',
    keyStrengths: [
      {
        title: 'Comprehensive Healthcare Network',
        indicator: 'Healthcare',
        score: 86,
        category: 'Healthcare & Medical',
        reason: 'Dense concentration of multi-speciality, ESIC government, and civic maternal hospitals ensures rapid emergency response and broad bed capacity.',
      },
      {
        title: 'Planned Residential Green Cover',
        indicator: 'Environment',
        score: 78,
        category: 'Environment & Ecology',
        reason: 'Structured residential avenues, neighborhood parks, and planned tree lines maintain healthy air quality and green buffers.',
      },
      {
        title: 'Planned Sector Accessibility',
        indicator: 'Accessibility',
        score: 75,
        category: 'Urban Accessibility',
        reason: 'Well-structured sector grid layout with accessible public transit routes, educational institutions, and neighborhood shopping hubs within walking distance.',
      },
      {
        title: 'Active Community Safety',
        indicator: 'Safety',
        score: 75,
        category: 'Public Safety',
        reason: 'Dedicated zonal police coverage (Ambad & CIDCO stations) along with well-illuminated residential sectors and organized colony layouts.',
      },
      {
        title: 'Academic Institutions & Schools',
        indicator: 'Education',
        score: 73,
        category: 'Education & Academics',
        reason: 'Symbiosis School, Maratha High School, Shahu Polytechnic, and ICSE convent schools provide strong local educational access.',
      },
      {
        title: 'Citilinc Arterial Bus Transit',
        indicator: 'Transport',
        score: 72,
        category: 'Mobility & Transit',
        reason: 'Trimurti Chowk central bus terminal and regular Citilinc bus routes connect CIDCO efficiently across all Nashik sectors.',
      },
    ],
    keyChallenges: [
      {
        title: 'Civic Utility Aging & Stormwater Drainage',
        indicator: 'Infrastructure',
        score: 68,
        category: 'Civic Infrastructure',
        reason: 'Rapid population expansion across older residential phases has strained water distribution mains and monsoon drainage capacity.',
      },
      {
        title: 'Peak-Hour Feeder Congestion',
        indicator: 'Transport',
        score: 72,
        category: 'Traffic & Connectivity',
        reason: 'Secondary connecting link roads experience bottlenecking during peak morning and evening office commutes towards MIDC.',
      },
    ],
    civicSummary:
      'CIDCO represents an established, planned urban community with strong institutional services, though utility modernization remains a civic priority.',
  },

  satpur: {
    id: 'satpur',
    name: 'Satpur',
    character: 'Premier industrial & manufacturing hub driving commercial employment and freight logistics',
    keyStrengths: [
      {
        title: 'Industrial Transit & Freight Connectivity',
        indicator: 'Transport',
        score: 45,
        category: 'Mobility & Freight',
        reason: 'Direct access to Trimbak Road and dedicated industrial transit corridors facilitating rapid worker commutes and cargo movement.',
      },
      {
        title: 'Commercial Employment & Industry',
        indicator: 'Infrastructure',
        score: 37,
        category: 'Economy & Commerce',
        reason: 'High density of engineering, manufacturing, and allied ancillary units providing extensive localized economic opportunities.',
      },
      {
        title: 'Occupational Healthcare Clinics',
        indicator: 'Healthcare',
        score: 38,
        category: 'Healthcare & Medical',
        reason: 'Strong localized network of occupational health centers, ESIC clinics, and trauma units handling immediate workplace healthcare needs.',
      },
    ],
    keyChallenges: [
      {
        title: 'Heavy Industrial Freight Traffic & Crossings',
        indicator: 'Safety',
        score: 31,
        category: 'Public Safety',
        reason: 'Heavy industrial multi-axle vehicular movement on arterial corridors requires enhanced pedestrian crossing infrastructure and upgraded night street lighting.',
      },
      {
        title: 'Industrial Emissions & Ambient Air Quality',
        indicator: 'Environment',
        score: 34,
        category: 'Environment & Industry',
        reason: 'High concentration of manufacturing units and heavy diesel freight transport creates elevated particulate levels and lower green buffering.',
      },
      {
        title: 'Tertiary Medical & Institutional Density',
        indicator: 'Healthcare',
        score: 38,
        category: 'Healthcare & Medical',
        reason: 'Zoned primarily for manufacturing, resulting in fewer specialized multi-speciality tertiary hospitals compared to residential zones.',
      },
      {
        title: 'Primary School & Campus Distribution',
        indicator: 'Education',
        score: 39,
        category: 'Education & Academics',
        reason: 'Predominantly industrial zoning yields lower residential school density, though higher education institutes like SIOM are present.',
      },
      {
        title: 'Large Industrial Plot Walking Distances',
        indicator: 'Accessibility',
        score: 48,
        category: 'Urban Accessibility',
        reason: 'Expansive factory layouts and industrial zoning result in longer walking distances to daily commercial and retail amenities.',
      },
    ],
    civicSummary:
      'Satpur is Nashik’s manufacturing powerhouse with robust industrial mobility, where environmental green buffering and pedestrian safety are primary focus areas.',
  },

  panchavati: {
    id: 'panchavati',
    name: 'Panchavati',
    character: 'Historic, religious, and cultural center with high pilgrim transit and established civic amenities',
    keyStrengths: [
      {
        title: 'Municipal & Charity Healthcare Access',
        indicator: 'Healthcare',
        score: 72,
        category: 'Healthcare & Medical',
        reason: 'Established municipal hospitals, charity medical foundations, and local clinics provide continuous healthcare coverage across historic wards.',
      },
      {
        title: 'Heritage & Traditional Education',
        indicator: 'Education',
        score: 68,
        category: 'Education & Academics',
        reason: 'Home to historic Sanskrit pathshalas, municipal high schools, and educational trusts embedded directly within residential wards.',
      },
      {
        title: 'Civic & Riverfront Walkability',
        indicator: 'Accessibility',
        score: 67,
        category: 'Urban Accessibility',
        reason: 'High density of traditional market squares, civic institutions, and cultural landmarks clustered near the Godavari river promenade.',
      },
      {
        title: 'Heritage Zone Public Safety',
        indicator: 'Safety',
        score: 62,
        category: 'Public Safety',
        reason: 'Active police deployment and municipal pilgrim management around major temple precincts and river ghats.',
      },
      {
        title: 'Tapovan Forest & Riverfront Greenery',
        indicator: 'Environment',
        score: 61,
        category: 'Environment & Ecology',
        reason: 'Tapovan nature grove and riverside gardens provide essential green lung buffers for the northern city sector.',
      },
    ],
    keyChallenges: [
      {
        title: 'Historic Underground Utility Lines',
        indicator: 'Infrastructure',
        score: 32,
        category: 'Civic Infrastructure',
        reason: 'Older drainage pipes and underground utility networks face capacity constraints during heavy monsoon and seasonal pilgrim surges.',
      },
      {
        title: 'Historic Street Congestion & Turning Radius',
        indicator: 'Transport',
        score: 35,
        category: 'Mobility & Transit',
        reason: 'Centuries-old road layouts in the core old city create chronic vehicular bottlenecks, limiting the turning radius for large standard buses.',
      },
    ],
    civicSummary:
      'Panchavati combines deep cultural heritage with vibrant community amenities, facing structural transit management and utility renewal constraints in heritage zones.',
  },

  gangapur: {
    id: 'gangapur',
    name: 'Gangapur Road',
    character: 'Premium residential, academic, and modern commercial avenue with high living standards',
    keyStrengths: [
      {
        title: 'Walkable Commercial & Retail Avenue',
        indicator: 'Accessibility',
        score: 81,
        category: 'Urban Accessibility',
        reason: 'Spacious avenue design with wide pedestrian walkways, modern cafes, supermarkets, and essential services within immediate reach.',
      },
      {
        title: 'Premier Medical & Diagnostic Centers',
        indicator: 'Healthcare',
        score: 72,
        category: 'Healthcare & Medical',
        reason: 'High concentration of private multi-speciality clinics, diagnostic centers, and specialized wellness facilities.',
      },
      {
        title: 'Arterial Transit & Ring Road Connectivity',
        indicator: 'Transport',
        score: 72,
        category: 'Mobility & Transit',
        reason: 'Wide four-lane arterial roads and frequent Citilinc bus services provide seamless transit to central Nashik.',
      },
      {
        title: 'Safe Residential Neighborhoods',
        indicator: 'Safety',
        score: 66,
        category: 'Public Safety',
        reason: 'Well-lit residential boulevards, active commercial corridors, and regular police patrolling maintain high community security.',
      },
      {
        title: 'Premier Academic & College Spine',
        indicator: 'Education',
        score: 63,
        category: 'Education & Academics',
        reason: 'Hub for premier engineering colleges (KBTCOE), architecture institutes, and reputed CBSE schools.',
      },
    ],
    keyChallenges: [
      {
        title: 'Urban Heat & Tree Canopy Depletion',
        indicator: 'Environment',
        score: 35,
        category: 'Environment & Ecology',
        reason: 'Rapid real-estate densification and high vehicular traffic along the main spine have reduced natural tree canopies and green road buffers.',
      },
      {
        title: 'Stormwater Runoff & High-Density Demand',
        indicator: 'Infrastructure',
        score: 60,
        category: 'Civic Infrastructure',
        reason: 'High-density residential and commercial growth necessitates continuous expansion of stormwater drainage and underground mains.',
      },
    ],
    civicSummary:
      'Gangapur Road represents a modern, highly educated residential corridor with high accessibility, where green buffer preservation and traffic flow are chief priorities.',
  },

  dwarka: {
    id: 'dwarka',
    name: 'Dwarka Circle',
    character: 'Vital highway junction and transit crossroads connecting intercity transport arteries',
    keyStrengths: [
      {
        title: '24/7 Commercial & Transit Accessibility',
        indicator: 'Accessibility',
        score: 76,
        category: 'Urban Accessibility',
        reason: 'Abundant hotels, transit retail, logistics agencies, and round-the-clock commercial services clustered around the junction.',
      },
      {
        title: 'Highway Trauma & Super Speciality Hospitals',
        indicator: 'Healthcare',
        score: 72,
        category: 'Healthcare & Medical',
        reason: 'Sahyadri Super Speciality and trauma emergency centers have direct highway frontage, ensuring rapid ambulance access.',
      },
      {
        title: 'Intercity Highway Mobility',
        indicator: 'Transport',
        score: 68,
        category: 'Mobility & Transit',
        reason: 'Intersection of NH-60 and Mumbai-Agra Highway provides seamless intercity bus connectivity and rapid regional dispatch.',
      },
      {
        title: 'Urban Buffer Pockets & Open Spaces',
        indicator: 'Environment',
        score: 65,
        category: 'Environment & Ecology',
        reason: 'Dedicated roadside green buffers and open transit avenues maintain balanced airflow across the crossroads.',
      },
    ],
    keyChallenges: [
      {
        title: 'Complex Highway Junction & Pedestrian Safety',
        indicator: 'Safety',
        score: 35,
        category: 'Public Safety',
        reason: 'Heavy mix of high-speed intercity freight and local commuter traffic creates significant pedestrian crossing hazards at the circle.',
      },
      {
        title: 'Continuous Highway Heavy-Vehicle Load',
        indicator: 'Infrastructure',
        score: 62,
        category: 'Civic Infrastructure',
        reason: 'Continuous multi-axle freight traffic accelerates road surface wear and demands frequent highway maintenance.',
      },
      {
        title: 'Transit-Zoned Campus Distribution',
        indicator: 'Education',
        score: 58,
        category: 'Education & Academics',
        reason: 'Zoning emphasizes commercial and transport logistics, with fewer large-scale educational campuses situated near the central junction.',
      },
    ],
    civicSummary:
      'Dwarka is Nashik’s central mobility junction providing unmatched transit reach, where grade-separated pedestrian safety and traffic calming are essential.',
  },

  deolali: {
    id: 'deolali',
    name: 'Deolali',
    character: 'Eco-rich cantonment sanctuary known for serene living, clean air, and disciplined civic order',
    keyStrengths: [
      {
        title: 'Elite Residential & Boarding Schools',
        indicator: 'Education',
        score: 79,
        category: 'Education & Academics',
        reason: 'Home to historic residential institutions (Barnes School, Temple Hill) and cantonment academies with expansive educational campuses.',
      },
      {
        title: 'Pristine Air Quality & Natural Canopy',
        indicator: 'Environment',
        score: 74,
        category: 'Environment & Ecology',
        reason: 'Extensive military cantonment green belts, pine groves, and low-density zoning yield the cleanest air and highest environmental score.',
      },
      {
        title: 'Disciplined Pedestrian Walkability',
        indicator: 'Accessibility',
        score: 72,
        category: 'Urban Accessibility',
        reason: 'Low-density, planned cantonment street network provides quiet, unhindered pedestrian walking access to community markets.',
      },
      {
        title: 'High Cantonment Security & Safety',
        indicator: 'Safety',
        score: 68,
        category: 'Public Safety',
        reason: 'Strict cantonment civic administration, organized check-points, and low crime rates provide an exceptionally secure residential environment.',
      },
      {
        title: 'Health Sanatoriums & Wellness Climate',
        indicator: 'Healthcare',
        score: 67,
        category: 'Healthcare & Medical',
        reason: 'Renowned recuperation climate supported by long-standing wellness sanatoriums, cantonment hospitals, and peaceful surroundings.',
      },
    ],
    keyChallenges: [
      {
        title: 'Cantonment Expansion & Commercial Restrictions',
        indicator: 'Infrastructure',
        score: 35,
        category: 'Civic Infrastructure',
        reason: 'Military land-use regulations limit high-rise development, commercial utility piping, and private industrial infrastructure.',
      },
      {
        title: 'Southern Peripheral Commute Times',
        indicator: 'Transport',
        score: 62,
        category: 'Mobility & Transit',
        reason: 'Located on the southern periphery, public bus commutes to northern hubs like Panchavati take longer travel times.',
      },
    ],
    civicSummary:
      'Deolali provides unrivaled environmental purity and peaceful residential security, balanced against regulatory development limitations in cantonment zones.',
  },
}

export function getAreaCivicProfile(areaId: string, fallbackName?: string): AreaCivicProfile {
  if (AREA_CIVIC_PROFILES[areaId]) {
    return AREA_CIVIC_PROFILES[areaId]
  }
  const name = fallbackName || areaId
  return {
    id: areaId,
    name,
    character: `Demonstration civic sector with localized urban facilities in ${name}.`,
    keyStrengths: [
      {
        title: 'Localized Community Access',
        indicator: 'Accessibility',
        score: 70,
        category: 'Urban Planning',
        reason: `Established neighborhood facilities and municipal access points across ${name}.`,
      },
    ],
    keyChallenges: [
      {
        title: 'Infrastructure Maintenance',
        indicator: 'Infrastructure',
        score: 55,
        category: 'Civic Infrastructure',
        reason: `Routine civic maintenance and public transit expansion requirements in ${name}.`,
      },
    ],
    civicSummary: `${name} displays balanced community indicators tailored to its local urban setting.`,
  }
}
