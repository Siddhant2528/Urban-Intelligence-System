import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation, RotateCcw } from 'lucide-react'
import { Badge, ButtonLink, Card } from '../common'
import { loadGoogleMaps } from '../../utils/googleMapsLoader'
import { areasApi } from '../../api/areas'
import { useApiData } from '../../context/ApiDataContext'

// ── Accurate GPS coordinates & matching UIS scores from Area Analysis ──────
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

const NASHIK_AREAS: NashikAreaInfo[] = [
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
  areas: NashikAreaInfo[],
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

    // Render Heatmap Blurs
    areas.forEach((area) => {
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
      coreGrad.addColorStop(0, `rgba(${r},${g},${b},${alphaPeak * 0.9})`)
      coreGrad.addColorStop(0.8, `rgba(${r},${g},${b},${alphaPeak * 0.3})`)
      coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)

      ctx.beginPath()
      ctx.arc(px, py, currentRadius * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      // Selection Halo
      if (isSel) {
        ctx.beginPath()
        ctx.arc(px, py, currentRadius * 0.55, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},0.95)`
        ctx.lineWidth = 3
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
      font-family: system-ui, -apple-system, sans-serif;
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

// ── Leaflet fallback helper ─────────────────────────────────────────────────
function initLeaflet(
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
  mapType: 'roadmap' | 'hybrid',
  onSelect: (area: NashikAreaInfo) => void,
  onHover: (area: NashikAreaInfo) => void,
  onHoverLeave: () => void,
  areas: NashikAreaInfo[],
) {
  return import('leaflet').then((L) => {
    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: number })._leaflet_id
      container.innerHTML = ''
    }

    const map = L.map(container, {
      center: [MAP_CENTER_LAT, MAP_CENTER_LNG],
      zoom: MAP_ZOOM,
      scrollWheelZoom: false,
      zoomControl: true,
    })

    const tileUrl = mapType === 'hybrid'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    const attribution = mapType === 'hybrid'
      ? '&copy; Esri'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map)

    // Interactive clickable & hoverable markers
    areas.forEach((area) => {
      const color = getIntensityColor(area.uis)
      const marker = L.marker([area.lat, area.lng], {
        icon: L.divIcon({
          html: `<button type="button" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.96);color:#0f172a;padding:5px 10px;border-radius:9999px;font-family:system-ui,sans-serif;font-size:11px;font-weight:700;white-space:nowrap;border:1.5px solid rgba(15,23,42,0.12);box-shadow:0 4px 12px rgba(0,0,0,0.12);cursor:pointer;">
            <span style="width:8px;height:8px;border-radius:9999px;background:${color};"></span>
            <span>${area.name}</span>
            <span style="background:${color}18;color:${color};font-weight:800;padding:1px 5px;border-radius:6px;font-size:10px;">UIS ${area.uis}</span>
          </button>`,
          className: '',
          iconAnchor: [50, 18],
        }),
        interactive: true,
      }).addTo(map)

      marker.on('mouseover', () => onHover(area))
      marker.on('mouseout', () => onHoverLeave())
      marker.on('click', () => onSelect(area))
    })

    // Canvas heatmap — redraws on every move/zoom
    const paint = () => {
      const w = container.offsetWidth
      const h = container.offsetHeight
      if (w === 0 || h === 0) return
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, w, h)
      const zf = Math.pow(2, map.getZoom() - MAP_ZOOM)
      const RADIUS = Math.max(36, Math.min(260, Math.round(Math.min(w, h) * 0.16 * zf)))
      areas.forEach(({ lat, lng, uis }) => {
        const { x: px, y: py } = map.latLngToContainerPoint([lat, lng])
        const [r, g, b] = intensityToRgb(normalise(uis))
        const g2 = ctx.createRadialGradient(px, py, 0, px, py, RADIUS)
        g2.addColorStop(0, `rgba(${r},${g},${b},.85)`)
        g2.addColorStop(0.35, `rgba(${r},${g},${b},.50)`)
        g2.addColorStop(0.75, `rgba(${r},${g},${b},.15)`)
        g2.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.beginPath()
        ctx.arc(px, py, RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = g2
        ctx.fill()
      })
    }

    map.on('move zoom viewreset resize', paint)
    map.whenReady(paint)

    return map
  })
}

// ── Main Component ───────────────────────────────────────────────────────────
function CityMapCard() {
  const { data } = useApiData()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const heatmapOverlayRef = useRef<google.maps.OverlayView | null>(null)
  const destroyRef = useRef<(() => void) | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [provider, setProvider] = useState<'loading' | 'google' | 'leaflet'>('loading')
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap')
  const [selectedArea, setSelectedArea] = useState<NashikAreaInfo | null>(null)
  const [isOffCenter, setIsOffCenter] = useState<boolean>(false)
  const [liveFacilityCount, setLiveFacilityCount] = useState<number | null>(null)

  const mapAreas = useMemo(() => {
    if (data.dataStatus !== 'live') return NASHIK_AREAS

    return NASHIK_AREAS.flatMap((mapArea) => {
      const liveArea = data.areas.find((area) => area.id === mapArea.id)
      const liveScore = data.areaAnalysis.find((item) => item.areaId === mapArea.id)?.uisDemoValue
      if (!liveArea || !liveScore || liveScore <= 0) return []
      return [{ ...mapArea, id: liveArea.id, name: liveArea.name, uis: Math.round(liveScore * 100) / 100 }]
    })
  }, [data.dataStatus, data.areas, data.areaAnalysis])

  useEffect(() => {
    areasApi
      .listFacilities()
      .then((res) => {
        const count = res.total ?? res.total_returned ?? res.facilities?.length ?? null
        setLiveFacilityCount(count)
      })
      .catch(() => {})
  }, [])

  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedArea?.id ?? null

  const mapTypeRef = useRef<'roadmap' | 'hybrid'>('roadmap')
  mapTypeRef.current = mapType

  const resetToNashik = () => {
    cancelHoverLeave()
    setSelectedArea(null)
    selectedIdRef.current = null
    setIsOffCenter(false)
    if (provider === 'google' && mapInstanceRef.current) {
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
    setSelectedArea(area)
    selectedIdRef.current = area.id
    if (heatmapOverlayRef.current) {
      heatmapOverlayRef.current.draw()
    }
  }

  const handleHoverLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => {
      setSelectedArea(null)
      selectedIdRef.current = null
      if (heatmapOverlayRef.current) {
        heatmapOverlayRef.current.draw()
      }
    }, 250)
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
      if (provider === 'google' && mapInstanceRef.current) {
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
    if (provider === 'google' && mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
      if (heatmapOverlayRef.current) {
        heatmapOverlayRef.current.draw()
      }
    }
  }

  useEffect(() => {
    const mapDiv = mapDivRef.current
    const canvas = canvasRef.current
    if (!mapDiv || !canvas) return

    let isMounted = true

    loadGoogleMaps()
      .then(() => {
        if (!isMounted) return
        mapDiv.innerHTML = ''

        // ── Google Maps Map Instance ─────────────────────────────────────
        const map = new google.maps.Map(mapDiv, {
          center: { lat: MAP_CENTER_LAT, lng: MAP_CENTER_LNG },
          zoom: MAP_ZOOM,
          minZoom: 10,
          maxZoom: 19,
          restriction: {
            latLngBounds: {
              north: 20.40,
              south: 19.60,
              west: 73.30,
              east: 74.25,
            },
            strictBounds: false,
          },
          mapTypeId: mapType,
          styles: undefined,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
        })
        mapInstanceRef.current = map

        // Monitor if map moved off-center or zoomed out
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
        const overlay = addGoogleHeatmapOverlay(map, selectedIdRef, mapTypeRef, mapAreas)
        heatmapOverlayRef.current = overlay

        // Add clickable & hoverable area labels with UIS score
        mapAreas.forEach((area) => {
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
      .catch(() => {
        if (!isMounted) return
        initLeaflet(
          mapDiv,
          canvas,
          mapType,
          (area) => handleSelectArea(area),
          (area) => handleHoverArea(area),
          () => handleHoverLeave(),
          mapAreas,
        ).then((map) => {
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
      })

    return () => {
      isMounted = false
      destroyRef.current?.()
    }
  }, [mapType, mapAreas])

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-card" padding="none">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Interactive City Map</p>
            <h3 className="mt-1 text-lg font-semibold text-ink">
              Nashik Urban Intensity & Accessibility Heatmap
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              Ward scores come from the backend when available; map points are approximate reference locations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dedicated Recenter Nashik Button */}
            <button
              type="button"
              onClick={resetToNashik}
              title="Reset view and recenter map on Nashik city"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-ink border border-slate-200 shadow-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw size={13} className="text-emerald-600" />
              <span>Recenter Nashik</span>
            </button>

            {/* View Mode Map Toggle: Street View vs Satellite View */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => toggleMapType('roadmap')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${mapType === 'roadmap'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-slate-600 hover:text-ink'
                  }`}
              >
                🗺️ Street View
              </button>
              <button
                type="button"
                onClick={() => toggleMapType('hybrid')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${mapType === 'hybrid'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-slate-600 hover:text-ink'
                  }`}
              >
                🛰️ Satellite View
              </button>
            </div>

            {provider === 'google' && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                ● Google Maps · {liveFacilityCount != null ? `${liveFacilityCount} saved facility records` : 'UIS Heatmap'}
              </Badge>
            )}
            {provider === 'leaflet' && (
              <Badge>UIS Heatmap · {liveFacilityCount != null ? `${liveFacilityCount} facility records` : 'Map layer'}</Badge>
            )}
            {provider === 'loading' && <Badge>Loading Map…</Badge>}
          </div>
        </div>

        {/* Quick Area Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-muted mr-1">Select Zone:</span>

          {/* All Nashik Reset Pill */}
          <button
            type="button"
            onClick={resetToNashik}
            title="Reset to whole Nashik city overview"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !selectedArea
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-surface-secondary text-ink hover:bg-slate-200 hover:text-ink'
            }`}
          >
            <Navigation size={11} className={!selectedArea ? 'text-white' : 'text-slate-500'} />
            <span>All Nashik (Reset View)</span>
          </button>

          {mapAreas.map((area) => {
            const isSelected = selectedArea?.id === area.id
            const color = getIntensityColor(area.uis)
            return (
              <button
                key={area.id}
                type="button"
                onMouseEnter={() => handleHoverArea(area)}
                onMouseLeave={handleHoverLeave}
                onClick={() => handleSelectArea(isSelected ? null : area)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${isSelected
                    ? 'bg-ink text-white shadow-md scale-105 ring-2 ring-brand'
                    : 'bg-surface-secondary text-ink hover:bg-slate-200 hover:text-ink'
                  }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: color }}
                />
                <span>{area.name}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-ink-muted shadow-sm'
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
          style={{ height: '460px' }}
        >
          {provider === 'loading' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand border-t-transparent" />
              <span className="mt-3 text-sm font-medium text-ink-muted">Loading Google Maps layer…</span>
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

          {/* Map mounts here (Google Maps OR Leaflet) */}
          <div ref={mapDivRef} className="absolute inset-0 z-0" />

          {/* Canvas heatmap overlay for Leaflet fallback */}
          {provider === 'leaflet' && (
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 z-10"
              style={{ mixBlendMode: 'normal' }}
            />
          )}
          {provider !== 'leaflet' && (
            <canvas ref={canvasRef} className="hidden" />
          )}

          {/* Floating Hover/Selected Area Quick Card (Facilities & Accessibility removed as requested) */}
          {selectedArea && (
            <div
              onMouseEnter={cancelHoverLeave}
              onMouseLeave={handleHoverLeave}
              className="absolute bottom-4 left-4 z-20 w-72 rounded-xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                    style={{ background: getIntensityColor(selectedArea.uis) }}
                  >
                    {getIntensityLabel(selectedArea.uis)}
                  </span>
                  <h4 className="mt-1.5 text-base font-bold text-ink">{selectedArea.name}</h4>
                  <p className="text-[11px] text-ink-muted">{selectedArea.tagline}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-ink-muted">UIS Score</span>
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{ color: getIntensityColor(selectedArea.uis) }}
                    >
                      {selectedArea.uis}
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

              {/* Action Button to Area Analysis */}
              <div className="mt-4">
                <ButtonLink
                  to={`/area/${selectedArea.id}`}
                  className="w-full text-center text-xs py-2 justify-center font-bold shadow-sm"
                >
                  View Area Analysis →
                </ButtonLink>
              </div>
            </div>
          )}
        </div>

        {/* UIS Development Score Legend */}
        <div className="space-y-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink">
                UIS DEVELOPMENT SCORE
              </p>
              <p className="text-[11px] text-ink-muted">
                Higher UIS indicates stronger overall urban development performance.
              </p>
            </div>
            <span className="text-[11px] text-ink-muted font-semibold">Scale: 0 – 100 UIS</span>
          </div>
          <div
            className="h-3 w-full rounded-full shadow-inner"
            style={{ background: 'linear-gradient(to right, #ef4444 0%, #f97316 45%, #eab308 60%, #22c55e 78%, #15803d 100%)' }}
          />
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {INTENSITY_BANDS.map((b) => (
              <div key={b.label} className="flex flex-col items-center text-center gap-0.5">
                <span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ background: b.color }} />
                <span className="text-[10px] font-bold text-ink">{b.label}</span>
                <span className="text-[9px] text-ink-muted">{b.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-end pt-0.5">
          <span className="text-[11px] text-ink-muted">
            Coordinates calibrated to Nashik Municipal Corporation (NMC) ward boundaries.
          </span>
        </div>
      </div>
    </Card>
  )
}

export default CityMapCard
