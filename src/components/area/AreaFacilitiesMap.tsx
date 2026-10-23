import { useEffect, useRef, useState } from 'react'
import { Badge, Card } from '../common'
import { facilityCategories, type Facility, type FacilityCategory } from '../../types/facility'
import { loadGoogleMaps } from '../../utils/googleMapsLoader'

interface AreaCoords {
  lat: number
  lng: number
  uis: number
  name: string
  tagline: string
}

const AREA_GPS_DATA: Record<string, AreaCoords> = {
  cidco: {
    lat: 19.9580,
    lng: 73.7540,
    uis: 76.2,
    name: 'CIDCO',
    tagline: 'New Nashik Planned Sector · Uttam Nagar · Trimurti Chowk',
  },
  panchavati: {
    lat: 20.0125,
    lng: 73.7930,
    uis: 71.8,
    name: 'Panchavati',
    tagline: 'Historic & Cultural Hub · Ramkund · Godavari Riverbank',
  },
  satpur: {
    lat: 19.9920,
    lng: 73.7320,
    uis: 67.5,
    name: 'Satpur',
    tagline: 'Industrial & Commercial Zone · MIDC Belt · Trimbak Road',
  },
  gangapur: {
    lat: 20.0210,
    lng: 73.7430,
    uis: 73.1,
    name: 'Gangapur Road',
    tagline: 'Residential & Educational Zone · Anandwalli · College Belt',
  },
  dwarka: {
    lat: 19.9880,
    lng: 73.8020,
    uis: 70.6,
    name: 'Dwarka Circle',
    tagline: 'Highway Transit Junction · Mumbai-Agra & Pune Highway',
  },
  deolali: {
    lat: 19.9400,
    lng: 73.8320,
    uis: 69.4,
    name: 'Deolali',
    tagline: 'Cantonment & Green Zone · Deolali Camp · Temple Hill',
  },
}

export const CATEGORY_COLORS: Record<FacilityCategory, string> = {
  Hospitals: '#ef4444',
  Schools: '#3b82f6',
  'Police Stations': '#8b5cf6',
  'Bus Stops': '#f59e0b',
  'Railway Stations': '#06b6d4',
  Parks: '#10b981',
}

export const CATEGORY_ICONS: Record<FacilityCategory, string> = {
  Hospitals: '🏥',
  Schools: '🎓',
  'Police Stations': '👮',
  'Bus Stops': '🚌',
  'Railway Stations': '🚆',
  Parks: '🌳',
}


// ── Google Maps facility marker overlay ──────────────────────────────────────
function addFacilityMarker(
  map: google.maps.Map,
  facility: Facility,
  onSelect: (fac: Facility) => void,
) {
  if (!facility.coordinates) return null
  const { lat, lng } = facility.coordinates

  const overlay = new google.maps.OverlayView()
  let container: HTMLDivElement | null = null
  let pinBtn: HTMLButtonElement | null = null
  let tooltip: HTMLDivElement | null = null
  const color = CATEGORY_COLORS[facility.category] || '#64748b'
  const icon = CATEGORY_ICONS[facility.category] || '📍'

  overlay.onAdd = function () {
    container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 10;
      pointer-events: auto;
    `

    // Hover tooltip
    tooltip = document.createElement('div')
    tooltip.style.cssText = `
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: rgba(15, 23, 42, 0.95);
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
      box-shadow: 0 6px 18px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      gap: 5px;
      z-index: 50;
    `
    const facName = facility.name || facility.category
    tooltip.innerHTML = `
      <span>${icon}</span>
      <span>${facName}</span>
      <span style="font-size: 9px; opacity: 0.7; border-left: 1px solid rgba(255,255,255,0.3); padding-left: 5px;">${facility.category}</span>
    `

    // Pin circle button
    pinBtn = document.createElement('button')
    pinBtn.type = 'button'
    pinBtn.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid ${color};
      box-shadow: 0 3px 10px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      outline: none;
      padding: 0;
    `
    pinBtn.innerHTML = `<span>${icon}</span>`
    pinBtn.setAttribute('aria-label', facName)

    // Hover events
    container.onmouseenter = () => {
      if (!pinBtn || !tooltip || !container) return
      pinBtn.style.transform = 'scale(1.25)'
      pinBtn.style.boxShadow = `0 6px 18px ${color}88`
      container.style.zIndex = '100'
      tooltip.style.opacity = '1'
      tooltip.style.visibility = 'visible'
      tooltip.style.transform = 'translateX(-50%) translateY(0)'
    }

    container.onmouseleave = () => {
      if (!pinBtn || !tooltip || !container) return
      pinBtn.style.transform = 'scale(1)'
      pinBtn.style.boxShadow = '0 3px 10px rgba(0,0,0,0.18)'
      container.style.zIndex = '10'
      tooltip.style.opacity = '0'
      tooltip.style.visibility = 'hidden'
      tooltip.style.transform = 'translateX(-50%) translateY(4px)'
    }

    pinBtn.onclick = (e) => {
      e.stopPropagation()
      onSelect(facility)
    }

    container.appendChild(tooltip)
    container.appendChild(pinBtn)
    this.getPanes()!.overlayMouseTarget.appendChild(container)
  }

  overlay.draw = function () {
    if (!container) return
    const pt = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(lat, lng))
    if (!pt) return
    container.style.left = `${pt.x - 15}px`
    container.style.top  = `${pt.y - 15}px`
  }

  overlay.onRemove = function () {
    container?.parentNode?.removeChild(container)
    container = null
    pinBtn = null
    tooltip = null
  }

  overlay.setMap(map)
  return overlay
}

// ── Leaflet Fallback ─────────────────────────────────────────────────────────
function initLeafletArea(
  container: HTMLDivElement,
  area: AreaCoords,
  facilities: Facility[],
  onSelectFac: (fac: Facility) => void,
) {
  return import('leaflet').then((L) => {
    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: number })._leaflet_id
      container.innerHTML = ''
    }

    const map = L.map(container, {
      center: [area.lat, area.lng],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    facilities.forEach((fac) => {
      if (!fac.coordinates) return
      const color = CATEGORY_COLORS[fac.category] || '#64748b'
      const icon = CATEGORY_ICONS[fac.category] || '📍'
      const marker = L.marker([fac.coordinates.lat, fac.coordinates.lng], {
        icon: L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50%;background:#fff;border:2px solid ${color};box-shadow:0 3px 8px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">
            ${icon}
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        interactive: true,
      }).addTo(map)

      marker.bindTooltip(`<b>${icon} ${fac.name || fac.category}</b><br/><span style="color:${color};font-size:10px;">${fac.category}</span>`, {
        direction: 'top',
        offset: [0, -14],
        opacity: 0.95,
      })

      marker.on('click', () => onSelectFac(fac))
    })

    return map
  })
}

// ── Component Props ──────────────────────────────────────────────────────────
export interface AreaFacilitiesMapProps {
  areaId: string
  areaName: string
  facilities: Facility[]
  activeCategory?: FacilityCategory | 'all'
  onCategoryChange?: (category: FacilityCategory | 'all') => void
}

export function AreaFacilitiesMap({
  areaId,
  areaName,
  facilities,
  activeCategory = 'all',
  onCategoryChange,
}: AreaFacilitiesMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const overlaysRef = useRef<Array<google.maps.OverlayView>>([])
  const destroyRef = useRef<(() => void) | null>(null)

  const [provider, setProvider] = useState<'loading' | 'google' | 'leaflet'>('loading')
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap')
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)

  const areaInfo: AreaCoords = AREA_GPS_DATA[areaId] || {
    lat: 19.9580,
    lng: 73.7540,
    uis: 72,
    name: areaName,
    tagline: `${areaName}, Nashik`,
  }

  // Calculate actual category counts strictly from facilities array
  const categoryCounts = facilityCategories.reduce((acc, cat) => {
    acc[cat] = facilities.filter((f) => f.category === cat).length
    return acc
  }, {} as Record<FacilityCategory, number>)

  const visibleFacilities = facilities.filter(
    (fac) => activeCategory === 'all' || fac.category === activeCategory,
  )

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

  const toggleMapType = (type: 'roadmap' | 'hybrid') => {
    setMapType(type)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: areaInfo.lat, lng: areaInfo.lng })
      mapInstanceRef.current.setZoom(15)
    }
  }

  useEffect(() => {
    const mapDiv = mapDivRef.current
    if (!mapDiv) return

    let isMounted = true

    const switchToLeaflet = () => {
      if (!isMounted || !mapDiv) return
      initLeafletArea(mapDiv, areaInfo, visibleFacilities, (f) => {
        setSelectedFacility(f)
      }).then((map) => {
        if (!isMounted) {
          map.remove()
          return
        }
        setProvider('leaflet')
        destroyRef.current = () => {
          map.remove()
          if (mapDiv) mapDiv.innerHTML = ''
        }
      })
    }

    const handleAuthFailure = () => {
      switchToLeaflet()
    }
    window.addEventListener('google-maps-auth-failure', handleAuthFailure)

    loadGoogleMaps()
      .then(() => {
        if (!isMounted) return
        mapDiv.innerHTML = ''

        const map = new google.maps.Map(mapDiv, {
          center: { lat: areaInfo.lat, lng: areaInfo.lng },
          zoom: 15,
          mapTypeId: mapType,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          scrollwheel: false,
        })
        mapInstanceRef.current = map

        overlaysRef.current.forEach((ov) => {
          ov.setMap(null)
        })
        overlaysRef.current = []

        visibleFacilities.forEach((fac) => {
          const facPin = addFacilityMarker(map, fac, (f) => {
            setSelectedFacility(f)
          })
          if (facPin) {
            overlaysRef.current.push(facPin)
          }
        })

        setProvider('google')
        destroyRef.current = () => {
          mapDiv.innerHTML = ''
          mapInstanceRef.current = null
        }
      })
      .catch(() => {
        switchToLeaflet()
      })

    return () => {
      isMounted = false
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure)
      destroyRef.current?.()
    }
  }, [API_KEY, areaId, activeCategory])

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-card" padding="none">
      {/* Top Map Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink">
            Live {areaInfo.name} Facilities Map
          </span>
          <Badge className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
            {visibleFacilities.length} {activeCategory === 'all' ? 'Pins' : activeCategory} Plotted
          </Badge>
        </div>

        {/* View Mode & Map Controls */}
        <div className="flex items-center gap-2">
          {provider === 'google' && (
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => toggleMapType('roadmap')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  mapType === 'roadmap'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                🗺️ Street View
              </button>
              <button
                type="button"
                onClick={() => toggleMapType('hybrid')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  mapType === 'hybrid'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                🛰️ Satellite View
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            title="Recenter Map"
          >
            🎯 Recenter
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-4 py-2 sm:px-6 no-scrollbar">
        <button
          type="button"
          onClick={() => onCategoryChange?.('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All ({facilities.length})
        </button>
        {facilityCategories.map((cat) => {
          const count = categoryCounts[cat] || 0
          if (count === 0) return null
          const isSelected = activeCategory === cat
          const color = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange?.(cat)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
              style={{
                backgroundColor: isSelected ? color : undefined,
                borderColor: isSelected ? color : undefined,
              }}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat}</span>
              <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Map Canvas Container */}
      <div className="relative h-[22rem] w-full overflow-hidden bg-slate-100 sm:h-[26rem]">
        {provider === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand border-t-transparent" />
            <span className="mt-3 text-sm font-medium text-ink-muted">
              Loading Google Maps for {areaInfo.name}…
            </span>
          </div>
        )}

        {/* Map mounts here */}
        <div ref={mapDivRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* Floating Selected Facility Popup on Map */}
        {selectedFacility && (
          <div className="absolute top-4 left-4 z-20 max-w-xs rounded-xl border border-white/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                  style={{
                    background: `${CATEGORY_COLORS[selectedFacility.category]}20`,
                    border: `1.5px solid ${CATEGORY_COLORS[selectedFacility.category]}`,
                  }}
                >
                  {CATEGORY_ICONS[selectedFacility.category]}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink">{selectedFacility.name || selectedFacility.category}</h4>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: CATEGORY_COLORS[selectedFacility.category] }}
                  >
                    {selectedFacility.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
              {selectedFacility.details}
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-500">
              <span>
                GPS: {selectedFacility.coordinates ? `${selectedFacility.coordinates.lat.toFixed(4)}, ${selectedFacility.coordinates.lng.toFixed(4)}` : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Floating Bottom Badge */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 py-3 text-white sm:px-5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">📍 {areaInfo.tagline}</span>
          </div>
          <Badge className="bg-emerald-600/90 text-white border-none font-bold text-xs pointer-events-auto">
            Google Maps · Live
          </Badge>
        </div>
      </div>

      {/* Facility Categories Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6">
        <span className="text-xs font-semibold text-slate-600">Facility Legend:</span>
        <div className="flex flex-wrap items-center gap-3">
          {facilityCategories.map((cat) => {
            const count = categoryCounts[cat] || 0
            return (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: CATEGORY_COLORS[cat] }}
                />
                <span>{CATEGORY_ICONS[cat]} {cat}</span>
                <span className="text-[10px] text-slate-400">({count})</span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// Alias export for backward compatibility
export const AreaInteractiveMap = AreaFacilitiesMap
