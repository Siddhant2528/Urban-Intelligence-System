import type { Area } from '../types/area'
import type { AreaAnalysisDemo } from '../types/areaAnalysis'
import { accessibilityCategories, type AccessibilityMetric } from '../types/accessibilityMetric'
import type { AreaComparison } from '../types/areaComparison'
import type { AreaIndicator } from '../types/areaIndicator'
import type { CityOverviewDemo } from '../types/cityOverview'
import type { DevelopmentProfile } from '../types/developmentProfile'
import { facilityCategories } from '../types/facility'
import type { Facility, FacilityCategory } from '../types/facility'
import type { Indicator } from '../types/indicator'
import type { IndicatorDetailDemo } from '../types/indicatorDetail'

const demoAreas: Area[] = [
	{ id: 'cidco', name: 'CIDCO' },
	{ id: 'panchavati', name: 'Panchavati' },
	{ id: 'satpur', name: 'Satpur' },
	{ id: 'gangapur', name: 'Gangapur' },
	{ id: 'dwarka', name: 'Dwarka' },
	{ id: 'deolali', name: 'Deolali' },
]

const accessibilityValues: Record<string, number[]> = {
	cidco: [61, 70, 64, 58, 67],
	panchavati: [67, 72, 66, 62, 69],
	satpur: [54, 62, 59, 48, 58],
	gangapur: [70, 69, 63, 66, 72],
	dwarka: [63, 68, 53, 66, 70],
	deolali: [59, 64, 76, 68, 62],
}

const demoAccessibilityMetrics: AccessibilityMetric[] = demoAreas.flatMap((area) =>
	accessibilityCategories.map((category, index) => ({
		areaId: area.id,
		category,
		demoValue: accessibilityValues[area.id][index],
	})),
)

const demoFacilityCountsByArea: Record<string, Record<FacilityCategory, number>> = {
	cidco: { Hospitals: 8, Schools: 15, 'Police Stations': 7, 'Bus Stops': 12, 'Railway Stations': 2, Parks: 4 },
	panchavati: { Hospitals: 6, Schools: 12, 'Police Stations': 5, 'Bus Stops': 7, 'Railway Stations': 3, Parks: 5 },
	satpur: { Hospitals: 4, Schools: 6, 'Police Stations': 3, 'Bus Stops': 8, 'Railway Stations': 1, Parks: 7 },
	gangapur: { Hospitals: 5, Schools: 8, 'Police Stations': 4, 'Bus Stops': 9, 'Railway Stations': 2, Parks: 9 },
	dwarka: { Hospitals: 7, Schools: 10, 'Police Stations': 7, 'Bus Stops': 14, 'Railway Stations': 4, Parks: 3 },
	deolali: { Hospitals: 5, Schools: 9, 'Police Stations': 4, 'Bus Stops': 6, 'Railway Stations': 2, Parks: 8 },
}

const facilityCoordinateSeeds: Record<string, { lat: number; lng: number }> = {
	cidco: { lat: 19.993, lng: 73.837 },
	panchavati: { lat: 20.009, lng: 73.77 },
	satpur: { lat: 20.025, lng: 73.78 },
	gangapur: { lat: 19.985, lng: 73.735 },
	dwarka: { lat: 20.013, lng: 73.817 },
	deolali: { lat: 19.927, lng: 73.85 },
}

const demoFacilities: Facility[] = demoAreas.flatMap((area) =>
	facilityCategories.flatMap((category) => {
		const count = demoFacilityCountsByArea[area.id][category]
		const areaSeed = facilityCoordinateSeeds[area.id]

		return Array.from({ length: count }, (_, index) => {
			const ring = index % 8
			const radius = 0.0011 + (ring % 4) * 0.0007 + Math.floor(index / 8) * 0.00015
			const angle = ((index % 12) / 12) * Math.PI * 2
			const lat = areaSeed.lat + Math.cos(angle) * radius
			const lng = areaSeed.lng + Math.sin(angle) * radius + (index % 2 === 0 ? 0.00045 : -0.0002)

			return {
				id: `${area.id}-${category.toLowerCase().replaceAll(' ', '-')}-${index + 1}`,
				areaId: area.id,
				category,
				demoCount: count,
				name: `${category} ${index + 1}`,
				details: `Illustrative demo ${category.toLowerCase()} location in ${area.name}.`,
				coordinates: { lat, lng },
			}
		})
	}),
)

export interface DemoDataset {
	dataStatus: 'demo'
	cityOverview: CityOverviewDemo
	areas: Area[]
	areaAnalysis: AreaAnalysisDemo[]
	indicators: Indicator[]
	indicatorDetails: IndicatorDetailDemo[]
	areaIndicators: AreaIndicator[]
	developmentProfiles: DevelopmentProfile[]
	facilities: Facility[]
	accessibilityMetrics: AccessibilityMetric[]
	areaComparisons: AreaComparison[]
}

/** These area labels and values are for UI demonstration only, not real-world data. */
export const demoData: DemoDataset = {
	dataStatus: 'demo',
	cityOverview: {
		name: 'Nashik',
		uisDemoValue: 72.4,
		uisScale: 100,
	},
	areas: demoAreas,
	areaAnalysis: [
		{
			areaId: 'cidco',
			uisDemoValue: 76.2,
			uisScale: 100,
			topStrengthIndicatorId: 'healthcare',
			areaToImproveIndicatorId: 'infrastructure',
		},
		{
			areaId: 'panchavati',
			uisDemoValue: 71.8,
			uisScale: 100,
			topStrengthIndicatorId: 'healthcare',
			areaToImproveIndicatorId: 'infrastructure',
		},
		{
			areaId: 'satpur',
			uisDemoValue: 67.5,
			uisScale: 100,
			topStrengthIndicatorId: 'accessibility',
			areaToImproveIndicatorId: 'safety',
		},
		{
			areaId: 'gangapur',
			uisDemoValue: 73.1,
			uisScale: 100,
			topStrengthIndicatorId: 'accessibility',
			areaToImproveIndicatorId: 'environment',
		},
		{
			areaId: 'dwarka',
			uisDemoValue: 70.6,
			uisScale: 100,
			topStrengthIndicatorId: 'accessibility',
			areaToImproveIndicatorId: 'safety',
		},
		{
			areaId: 'deolali',
			uisDemoValue: 69.4,
			uisScale: 100,
			topStrengthIndicatorId: 'education',
			areaToImproveIndicatorId: 'infrastructure',
		},
	],
	indicators: [
		{ id: 'environment', category: 'Environment' },
		{ id: 'healthcare', category: 'Healthcare' },
		{ id: 'education', category: 'Education' },
		{ id: 'safety', category: 'Safety' },
		{ id: 'transport', category: 'Transport' },
		{ id: 'infrastructure', category: 'Infrastructure' },
		{ id: 'accessibility', category: 'Accessibility' },
	],
	indicatorDetails: [
		{
			indicatorId: 'environment',
			demoDescription: 'Demonstration description for the Environment indicator; not a verified real-world interpretation.',
			demoRawValue: 28,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
		{
			indicatorId: 'healthcare',
			demoDescription: 'Demonstration description for the Healthcare indicator; not a verified real-world interpretation.',
			demoRawValue: 34,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
		{
			indicatorId: 'education',
			demoDescription: 'Demonstration description for the Education indicator; not a verified real-world interpretation.',
			demoRawValue: 41,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
		{
			indicatorId: 'safety',
			demoDescription: 'Demonstration description for the Safety indicator; not a verified real-world interpretation.',
			demoRawValue: 22,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
		{
			indicatorId: 'transport',
			demoDescription: 'Demonstration description for the Transport indicator; not a verified real-world interpretation.',
			demoRawValue: 37,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
		{
			indicatorId: 'infrastructure',
			demoDescription: 'Demonstration description for the Infrastructure indicator; not a verified real-world interpretation.',
			demoRawValue: 18,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
		{
			indicatorId: 'accessibility',
			demoDescription: 'Demonstration description for the Accessibility indicator; not a verified real-world interpretation.',
			demoRawValue: 31,
			demoUnit: 'Unspecified demo units',
			demoReference: 'No real-world benchmark supplied.',
			demoDataSource: 'UIS demonstration data; no external source used.',
			demoLastUpdated: 'Not provided (demo).',
			componentBreakdown: [],
		},
	],
	areaIndicators: [
		{ areaId: 'cidco', indicatorId: 'environment', demoValue: 78 },
		{ areaId: 'cidco', indicatorId: 'healthcare', demoValue: 86 },
		{ areaId: 'cidco', indicatorId: 'education', demoValue: 73 },
		{ areaId: 'cidco', indicatorId: 'safety', demoValue: 75 },
		{ areaId: 'cidco', indicatorId: 'transport', demoValue: 72 },
		{ areaId: 'cidco', indicatorId: 'infrastructure', demoValue: 68 },
		{ areaId: 'cidco', indicatorId: 'accessibility', demoValue: 75 },
		{ areaId: 'panchavati', indicatorId: 'environment', demoValue: 61 },
		{ areaId: 'panchavati', indicatorId: 'healthcare', demoValue: 72 },
		{ areaId: 'panchavati', indicatorId: 'education', demoValue: 68 },
		{ areaId: 'panchavati', indicatorId: 'safety', demoValue: 62 },
		{ areaId: 'panchavati', indicatorId: 'transport', demoValue: 35 },
		{ areaId: 'panchavati', indicatorId: 'infrastructure', demoValue: 32 },
		{ areaId: 'panchavati', indicatorId: 'accessibility', demoValue: 67 },
		{ areaId: 'satpur', indicatorId: 'environment', demoValue: 34 },
		{ areaId: 'satpur', indicatorId: 'healthcare', demoValue: 38 },
		{ areaId: 'satpur', indicatorId: 'education', demoValue: 39 },
		{ areaId: 'satpur', indicatorId: 'safety', demoValue: 31 },
		{ areaId: 'satpur', indicatorId: 'transport', demoValue: 45 },
		{ areaId: 'satpur', indicatorId: 'infrastructure', demoValue: 37 },
		{ areaId: 'satpur', indicatorId: 'accessibility', demoValue: 48 },
		{ areaId: 'gangapur', indicatorId: 'environment', demoValue: 35 },
		{ areaId: 'gangapur', indicatorId: 'healthcare', demoValue: 72 },
		{ areaId: 'gangapur', indicatorId: 'education', demoValue: 63 },
		{ areaId: 'gangapur', indicatorId: 'safety', demoValue: 66 },
		{ areaId: 'gangapur', indicatorId: 'transport', demoValue: 72 },
		{ areaId: 'gangapur', indicatorId: 'infrastructure', demoValue: 60 },
		{ areaId: 'gangapur', indicatorId: 'accessibility', demoValue: 81 },
		{ areaId: 'dwarka', indicatorId: 'environment', demoValue: 65 },
		{ areaId: 'dwarka', indicatorId: 'healthcare', demoValue: 72 },
		{ areaId: 'dwarka', indicatorId: 'education', demoValue: 58 },
		{ areaId: 'dwarka', indicatorId: 'safety', demoValue: 35 },
		{ areaId: 'dwarka', indicatorId: 'transport', demoValue: 68 },
		{ areaId: 'dwarka', indicatorId: 'infrastructure', demoValue: 62 },
		{ areaId: 'dwarka', indicatorId: 'accessibility', demoValue: 76 },
		{ areaId: 'deolali', indicatorId: 'environment', demoValue: 74 },
		{ areaId: 'deolali', indicatorId: 'healthcare', demoValue: 67 },
		{ areaId: 'deolali', indicatorId: 'education', demoValue: 79 },
		{ areaId: 'deolali', indicatorId: 'safety', demoValue: 68 },
		{ areaId: 'deolali', indicatorId: 'transport', demoValue: 62 },
		{ areaId: 'deolali', indicatorId: 'infrastructure', demoValue: 35 },
		{ areaId: 'deolali', indicatorId: 'accessibility', demoValue: 72 },
	],
	developmentProfiles: [
		{
			areaId: 'cidco',
			demoLabel: 'Established Residential Area',
			demoSummary: 'Demonstration-only profile text; this is not a verified area characteristic.',
		},
		{
			areaId: 'panchavati',
			demoLabel: 'Demonstration Area Profile',
			demoSummary: 'Demonstration-only profile text; this is not a verified area characteristic.',
		},
		{
			areaId: 'satpur',
			demoLabel: 'Demonstration Area Profile',
			demoSummary: 'Demonstration-only profile text; this is not a verified area characteristic.',
		},
		{
			areaId: 'gangapur',
			demoLabel: 'Demonstration Area Profile',
			demoSummary: 'Demonstration-only profile text; this is not a verified area characteristic.',
		},
		{
			areaId: 'dwarka',
			demoLabel: 'Demonstration Area Profile',
			demoSummary: 'Demonstration-only profile text; this is not a verified area characteristic.',
		},
		{
			areaId: 'deolali',
			demoLabel: 'Demonstration Area Profile',
			demoSummary: 'Demonstration-only profile text; this is not a verified area characteristic.',
		},
	],
	facilities: demoFacilities,
	accessibilityMetrics: demoAccessibilityMetrics,
	areaComparisons: [
		{
			areaIds: ['cidco', 'panchavati'],
			indicatorId: 'environment',
			demoValues: [68, 61],
		},
	],
}