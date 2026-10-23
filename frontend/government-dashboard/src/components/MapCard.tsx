import { useEffect, useRef, useState } from 'react'
import { Navigation, RotateCcw } from 'lucide-react'
import { loadGoogleMaps } from '../utils/googleMapsLoader'

// ── Accurate GPS coordinates & matching UIS scores from Citizen Dashboard ──────
export interface NashikAreaInfo {
  id: string
  name: string
  tagline: string
  lat: number
  lng: number
  uis: number
  facilities: number
  accessibility: number
  status: string
}

export const NASHIK_AREAS: NashikAreaInfo[] = [
  {
    id: 'panchavati',
    name: 'Panchavati',
    tagline: 'Historic & Cultural Hub',
    lat: 20.0125,
    lng: 73.7930,
    uis: 71.8,
    facilities: 35,
    accessibility: 68,
    status: 'High',
  },
  {
    id: 'gangapur',
    name: 'Gangapur Road',
    tagline: 'Residential & Educational Zone',
    lat: 20.0210,
    lng: 73.7430,
    uis: 73.1,
    facilities: 37,
    accessibility: 67,
    status: 'High',
  },
  {
    id: 'satpur',
    name: 'Satpur',
    tagline: 'Industrial & Commercial Belt',
    lat: 19.9920,
    lng: 73.7320,
    uis: 67.5,
    facilities: 29,
    accessibility: 56,
    status: 'Moderate',
  },
  {
    id: 'dwarka',
    name: 'Dwarka Circle',
    tagline: 'Highway Transit & Junction',
    lat: 19.9880,
    lng: 73.8020,
    uis: 70.6,
    facilities: 45,
    accessibility: 64,
    status: 'High',
  },
  {
    id: 'cidco',
    name: 'CIDCO',
    tagline: 'New Nashik Planned Sector',
    lat: 19.9580,
    lng: 73.7540,
    uis: 76.2,
    facilities: 48,
    accessibility: 64,
    status: 'Very High',
  },
  {
    id: 'deolali',
    name: 'Deolali',
    tagline: 'Cantonment & Green Zone',
    lat: 19.9400,
    lng: 73.8320,
    uis: 69.4,
    facilities: 34,
    accessibility: 65,
    status: 'Moderate',
  },
]

const MAP_CENTER_LAT = 19.9850
const MAP_CENTER_LNG = 73.7760
const MAP_ZOOM = 12
const MIN_UIS = 0
const MAX_UIS = 100

function normalise(uis: number) {
  return Math.min(1, Math.max(0, (uis - MIN_UIS) / (MAX_UIS - MIN_UIS)))
}

function getDistanceFromNashikKm(lat: number, lng: number): number {
  const R = 6371
  const dLat = ((lat - MAP_CENTER_LAT) * Math.PI) / 180
  const dLng = ((lng - MAP_CENTER_LNG) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((MAP_CENTER_LAT * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function intensityToRgb(t: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [0.00, [239, 68, 68]],  // Very Low (0-39) -> Red
    [0.39, [239, 68, 68]],
    [0.45, [249, 115, 22]],  // Low (40-49) -> Orange
    [0.60, [234, 179, 8]],  // Moderate (50-69) -> Yellow
    [0.77, [34, 197, 94]],  // High (70-84) -> Light Green
    [0.92, [21, 128, 61]],  // Very High (85-100) -> Dark Green
    [1.00, [21, 128, 61]],
  ]
  for (let i = 1; i < stops.length; i++) {
    const [t0, c0] = stops[i - 1]
    const [t1, c1] = stops[i]
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0)
      return [
        Math.round(c0[0] + f * (c1[0] - c0[0])),
        Math.round(c0[1] + f * (c1[1] - c0[1])),
        Math.round(c0[2] + f * (c1[2] - c0[2])),
      ]
    }
  }
  return [21, 128, 61]
}

function getIntensityColor(uis: number): string {
  if (uis < 40) return '#ef4444' // Very Low (0-39) -> Red
  if (uis < 50) return '#f97316' // Low (40-49) -> Orange
  if (uis < 70) return '#eab308' // Moderate (50-69) -> Yellow
  if (uis < 85) return '#22c55e' // High (70-84) -> Light Green
  return '#15803d'               // Very High (85-100) -> Dark Green
}

function getIntensityLabel(uis: number): string {
  if (uis < 40) return 'Very Low'
  if (uis < 50) return 'Low'
  if (uis < 70) return 'Moderate'
  if (uis < 85) return 'High'
  return 'Very High'
}

const INTENSITY_BANDS = [
  { label: 'Very Low', range: '0–39', color: '#ef4444' },
  { label: 'Low', range: '40–49', color: '#f97316' },
  { label: 'Moderate', range: '50–69', color: '#eab308' },
  { label: 'High', range: '70–84', color: '#22c55e' },
  { label: 'Very High', range: '85–100', color: '#15803d' },
]

// ── Enhanced Multi-Tier Heatmap Overlay ─────────────────────────────────────
function addGoogleHeatmapOverlay(
  map: google.maps.Map,
  selectedIdRef: { current: string | null },
  mapTypeRef: { current: 'roadmap' | 'hybrid' },
) {
  const overlay = new google.maps.OverlayView()
  let canvas: HTMLCanvasElement | null = null

  overlay.onAdd = function () {
    canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.pointerEvents = 'none'
    canvas.style.mixBlendMode = 'normal'
    this.getPanes()!.overlayLayer.appendChild(canvas)
  }

  overlay.draw = function () {
    if (!canvas) return
    const proj = this.getProjection()
    if (!proj) return

    const bounds = map.getBounds()
    if (!bounds) return
    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    const nePx = proj.fromLatLngToDivPixel(ne)
    const swPx = proj.fromLatLngToDivPixel(sw)
    if (!nePx || !swPx) return

    const pad = 160
    const left = Math.min(swPx.x, nePx.x) - pad
    const top = Math.min(nePx.y, swPx.y) - pad
    const width = Math.abs(nePx.x - swPx.x) + pad * 2
    const height = Math.abs(swPx.y - nePx.y) + pad * 2

    canvas.style.left = `${left}px`
    canvas.style.top = `${top}px`
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, width, height)

    const zoom = map.getZoom() || MAP_ZOOM
    const zf = Math.pow(2, zoom - MAP_ZOOM)
    const isSat = mapTypeRef.current === 'hybrid'
    const RADIUS = Math.max(36, Math.min(260, Math.round(80 * zf)))

    // Render Heatmap Blurs with balanced transparency so streets and landmarks remain clear
    NASHIK_AREAS.forEach((area) => {
      const { lat, lng, uis, id } = area
      const pt = proj.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng))
      if (!pt) return
      const px = pt.x - left
      const py = pt.y - top

      const isSel = selectedIdRef.current === id
      const currentRadius = isSel ? RADIUS * 1.35 : RADIUS
      const [r, g, b] = intensityToRgb(normalise(uis))

      // Outer atmospheric glow
      const outerGrad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius)
      const alphaPeak = isSel ? 0.65 : (isSat ? 0.55 : 0.40)
      outerGrad.addColorStop(0, `rgba(${r},${g},${b},${alphaPeak})`)
      outerGrad.addColorStop(0.35, `rgba(${r},${g},${b},${alphaPeak * 0.6})`)
      outerGrad.addColorStop(0.70, `rgba(${r},${g},${b},${alphaPeak * 0.2})`)
      outerGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)

      ctx.beginPath()
      ctx.arc(px, py, currentRadius, 0, Math.PI * 2)
      ctx.fillStyle = outerGrad
      ctx.fill()

      // Inner intense core
      const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius * 0.45)
      coreGrad.addColorStop(0, `rgba(${r},${g},${b},${alphaPeak * 0.75})`)
      coreGrad.addColorStop(0.8, `rgba(${r},${g},${b},${alphaPeak * 0.25})`)
      coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)

      ctx.beginPath()
      ctx.arc(px, py, currentRadius * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      // Selection Halo
      if (isSel) {
        ctx.beginPath()
        ctx.arc(px, py, currentRadius * 0.55, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`
        ctx.lineWidth = 2.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(px, py, currentRadius * 0.9, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
      }
    })
  }

  overlay.onRemove = function () {
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas)
    }
    canvas = null
  }

  overlay.setMap(map)

  // Redraw cleanly on zoom and idle to ensure live fluidity
  map.addListener('zoom_changed', () => {
    overlay.draw()
  })
  map.addListener('idle', () => {
    overlay.draw()
  })

  return overlay
}

function addGoogleClickableLabel(
  map: google.maps.Map,
  area: NashikAreaInfo,
  onSelect: (area: NashikAreaInfo) => void,
  onHover: (area: NashikAreaInfo) => void,
  onHoverLeave: () => void,
) {
  const overlay = new google.maps.OverlayView()
  let btn: HTMLButtonElement | null = null

  overlay.onAdd = function () {
    btn = document.createElement('button')
    btn.type = 'button'
    const color = getIntensityColor(area.uis)
    btn.style.cssText = `
      position: absolute;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.96);
      color: #0f172a;
      padding: 5px 11px;
      border-radius: 9999px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      border: 1.5px solid rgba(15, 23, 42, 0.12);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      user-select: none;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
    `
    btn.innerHTML = `
      <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${color}; display: inline-block; box-shadow: 0 0 0 2px rgba(255,255,255,0.8);"></span>
      <span>${area.name}</span>
      <span style="background: ${color}18; color: ${color}; font-weight: 800; padding: 1px 6px; border-radius: 6px; font-size: 10.5px;">UIS ${area.uis}</span>
    `

    btn.onmouseenter = () => {
      if (!btn) return
      btn.style.transform = 'scale(1.1) translateY(-3px)'
      btn.style.boxShadow = '0 8px 22px rgba(0, 0, 0, 0.20)'
      btn.style.borderColor = color
      onHover(area)
    }
    btn.onmouseleave = () => {
      if (!btn) return
      btn.style.transform = 'none'
      btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)'
      btn.style.borderColor = 'rgba(15, 23, 42, 0.12)'
      onHoverLeave()
    }
    btn.onclick = (e) => {
      e.stopPropagation()
      onSelect(area)
    }

    this.getPanes()!.overlayMouseTarget.appendChild(btn)
  }

  overlay.draw = function () {
    if (!btn) return
    const pt = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(area.lat, area.lng))
    if (!pt) return
    btn.style.left = `${pt.x - btn.offsetWidth / 2}px`
    btn.style.top = `${pt.y - 36}px`
  }

  overlay.onRemove = function () {
    btn?.parentNode?.removeChild(btn)
    btn = null
  }

  overlay.setMap(map)
  return overlay
}

export function MapCard() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const heatmapOverlayRef = useRef<google.maps.OverlayView | null>(null)
  const destroyRef = useRef<(() => void) | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [provider, setProvider] = useState<'loading' | 'google'>('loading')
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap')
  const [selectedArea, setSelectedArea] = useState<NashikAreaInfo | null>(null)
  const [hoveredArea, setHoveredArea] = useState<NashikAreaInfo | null>(null)
  const [isOffCenter, setIsOffCenter] = useState<boolean>(false)

  const activeArea = selectedArea || hoveredArea
  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = activeArea?.id ?? null

  const mapTypeRef = useRef<'roadmap' | 'hybrid'>('roadmap')
  mapTypeRef.current = mapType

  const resetToNashik = () => {
    cancelHoverLeave()
    setSelectedArea(null)
    setHoveredArea(null)
    selectedIdRef.current = null
    setIsOffCenter(false)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: MAP_CENTER_LAT, lng: MAP_CENTER_LNG })
      mapInstanceRef.current.setZoom(MAP_ZOOM)
    }
    if (heatmapOverlayRef.current) {
      heatmapOverlayRef.current.draw()
    }
  }

  const handleHoverArea = (area: NashikAreaInfo) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setHoveredArea(area)
    selectedIdRef.current = selectedArea?.id || area.id
    if (heatmapOverlayRef.current) {
      heatmapOverlayRef.current.draw()
    }
  }

  const handleHoverLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => {
      setHoveredArea(null)
      selectedIdRef.current = selectedArea?.id ?? null
      if (heatmapOverlayRef.current) {
        heatmapOverlayRef.current.draw()
      }
    }, 200)
  }

  const cancelHoverLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  const handleSelectArea = (area: NashikAreaInfo | null) => {
    cancelHoverLeave()
    if (selectedArea?.id === area?.id || !area) {
      resetToNashik()
    } else {
      setSelectedArea(area)
      selectedIdRef.current = area.id
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: area.lat, lng: area.lng })
        mapInstanceRef.current.setZoom(14)
      }
    }
    if (heatmapOverlayRef.current) {
      heatmapOverlayRef.current.draw()
    }
  }

  const toggleMapType = (type: 'roadmap' | 'hybrid') => {
    setMapType(type)
    mapTypeRef.current = type
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
      if (heatmapOverlayRef.current) {
        heatmapOverlayRef.current.draw()
      }
    }
  }

  useEffect(() => {
    const mapDiv = mapDivRef.current
    if (!mapDiv) return

    let isMounted = true

    loadGoogleMaps()
      .then(() => {
        if (!isMounted) return
        mapDiv.innerHTML = ''

        // ── Google Maps Map Instance (Natural vibrant Google Roadmap view) ──
        const map = new google.maps.Map(mapDiv, {
          center: { lat: MAP_CENTER_LAT, lng: MAP_CENTER_LNG },
          zoom: MAP_ZOOM,
          minZoom: 10, // Prevents zooming out too far into other states or world map
          maxZoom: 19, // Zoom in to inspect streets and neighborhoods
          restriction: {
            latLngBounds: {
              north: 20.40,
              south: 19.60,
              west: 73.30,
              east: 74.25,
            },
            strictBounds: false,
          },
          mapTypeId: mapTypeRef.current,
          // Standard full-color Google Maps: natural roads, blue rivers, green parks & street labels
          styles: undefined,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          scrollwheel: true,         // Fully enables mouse wheel and trackpad zoom
          gestureHandling: 'greedy', // Instantly zooms on scroll without needing Ctrl key
        })
        mapInstanceRef.current = map

        // Monitor if user moved off-center or zoomed away from Nashik
        map.addListener('idle', () => {
          const center = map.getCenter()
          const zoom = map.getZoom()
          if (center && zoom !== undefined) {
            const distKm = getDistanceFromNashikKm(center.lat(), center.lng())
            const off = distKm > 4.5 || zoom < 11 || zoom > 14.5
            setIsOffCenter(off)
          }
        })

        // Add enhanced canvas heatmap overlay
        const overlay = addGoogleHeatmapOverlay(map, selectedIdRef, mapTypeRef)
        heatmapOverlayRef.current = overlay

        // Add clickable & hoverable area labels with UIS score
        NASHIK_AREAS.forEach((area) => {
          addGoogleClickableLabel(
            map,
            area,
            (clickedArea) => handleSelectArea(clickedArea),
            (hoveredArea) => handleHoverArea(hoveredArea),
            () => handleHoverLeave(),
          )
        })

        setProvider('google')
        destroyRef.current = () => {
          mapDiv.innerHTML = ''
          mapInstanceRef.current = null
          heatmapOverlayRef.current = null
        }
      })
      .catch((err) => {
        console.warn('Google maps load notice:', err)
      })

    return () => {
      isMounted = false
      destroyRef.current?.()
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm mb-6">
      <div className="p-4 sm:p-6 space-y-4">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              INTERACTIVE CITY MAP
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-800">
              Nashik Urban Intensity &amp; Accessibility Heatmap
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Scroll or pinch to zoom in/out. Explore neighborhood streets or zoom out to inspect surrounding Nashik regions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dedicated Recenter Nashik Redirection Button */}
            <button
              type="button"
              onClick={resetToNashik}
              title="Reset view and recenter map on Nashik city"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw size={13} className="text-emerald-600" />
              <span>Recenter Nashik</span>
            </button>

            {/* View Mode Map Toggle: Street View vs Satellite View */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => toggleMapType('roadmap')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  mapType === 'roadmap'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🗺️ Street View
              </button>
              <button
                type="button"
                onClick={() => toggleMapType('hybrid')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  mapType === 'hybrid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛰️ Satellite View
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              ● Google Maps · Live Heatmap
            </span>
          </div>
        </div>

        {/* Quick Area Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Select Zone:</span>
          
          {/* All Nashik Reset Pill */}
          <button
            type="button"
            onClick={resetToNashik}
            title="Reset to whole Nashik city overview"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !selectedArea
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <Navigation size={11} className={!selectedArea ? 'text-white' : 'text-slate-500'} />
            <span>All Nashik (Reset View)</span>
          </button>

          {NASHIK_AREAS.map((area) => {
            const isSelected = selectedArea?.id === area.id
            const color = getIntensityColor(area.uis)
            return (
              <button
                key={area.id}
                type="button"
                onMouseEnter={() => handleHoverArea(area)}
                onMouseLeave={handleHoverLeave}
                onClick={() => handleSelectArea(area)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md scale-105 ring-2 ring-emerald-500'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: color }}
                />
                <span>{area.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 shadow-xs'
                  }`}
                >
                  {area.uis}
                </span>
              </button>
            )
          })}
        </div>

        {/* Map Canvas Container */}
        <div
          ref={wrapperRef}
          className="relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner"
          style={{ height: '480px' }}
        >
          {provider === 'loading' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
              <span className="mt-3 text-xs font-medium text-slate-500">Loading Google Maps layer…</span>
            </div>
          )}

          {/* Smart Floating "Return to Nashik" redirection chip when map drifts off-center */}
          {isOffCenter && (
            <button
              type="button"
              onClick={resetToNashik}
              className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md transition-all hover:scale-105 border border-white/20 cursor-pointer"
              title="Click to smoothly return to Nashik city overview"
            >
              <RotateCcw size={13} className="text-emerald-400" />
              <span>Return to Nashik City</span>
            </button>
          )}

          {/* Map mounts here */}
          <div ref={mapDivRef} className="absolute inset-0 z-0" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Floating Hover/Selected Area Quick Card */}
          {activeArea && (
            <div
              onMouseEnter={cancelHoverLeave}
              onMouseLeave={handleHoverLeave}
              className="absolute bottom-4 left-4 z-20 w-72 rounded-xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                    style={{ background: getIntensityColor(activeArea.uis) }}
                  >
                    {getIntensityLabel(activeArea.uis)}
                  </span>
                  <h4 className="mt-1.5 text-base font-bold text-slate-900">{activeArea.name}</h4>
                  <p className="text-[11px] text-slate-500">{activeArea.tagline}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 shadow-xs">
                    <span className="text-[9px] uppercase font-bold text-slate-400">UIS Score</span>
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{ color: getIntensityColor(activeArea.uis) }}
                    >
                      {activeArea.uis}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectArea(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    title="Close details"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* UIS Development Score Legend */}
        <div className="space-y-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-800">
                UIS DEVELOPMENT SCORE
              </p>
              <p className="text-[11px] text-slate-500">
                Higher UIS indicates stronger overall urban development performance.
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">Scale: 0 – 100 UIS</span>
          </div>
          <div
            className="h-3 w-full rounded-full shadow-inner"
            style={{
              background:
                'linear-gradient(to right, #ef4444 0%, #f97316 45%, #eab308 60%, #22c55e 78%, #15803d 100%)',
            }}
          />
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {INTENSITY_BANDS.map((b) => (
              <div key={b.label} className="flex flex-col items-center text-center gap-0.5">
                <span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ background: b.color }} />
                <span className="text-[10px] font-bold text-slate-800">{b.label}</span>
                <span className="text-[9px] text-slate-500">{b.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-end pt-0.5">
          <span className="text-[11px] text-slate-400">
            Coordinates calibrated to Nashik Municipal Corporation (NMC) ward boundaries.
          </span>
        </div>
      </div>
    </div>
  )
}
