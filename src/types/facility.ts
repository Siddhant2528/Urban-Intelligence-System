export const facilityCategories = [
  'Hospitals',
  'Schools',
  'Police Stations',
  'Bus Stops',
  'Railway Stations',
  'Parks',
] as const

export type FacilityCategory = (typeof facilityCategories)[number]

export interface FacilityCoordinates {
  lat: number
  lng: number
}

export interface Facility {
  id: string
  areaId: string
  category: FacilityCategory
  demoCount: number
  name?: string
  details?: string
  coordinates?: FacilityCoordinates | null
}