import { useEffect, useRef, useState } from 'react'
import { Badge, Card } from '../common'
import { loadGoogleMaps } from '../../utils/googleMapsLoader'

interface AreaCoords {
  lat: number
  lng: number
  name: string
}

const AREA_GPS_DATA: Record<string, AreaCoords> = {
  cidco: {
    lat: 19.9580,
    lng: 73.7540,
    name: 'CIDCO',
  },
  panchavati: {
    lat: 20.0125,
    lng: 73.7930,
    name: 'Panchavati',
  },
  satpur: {
    lat: 19.9920,
    lng: 73.7320,
    name: 'Satpur',
  },
  gangapur: {
    lat: 20.0210,
    lng: 73.7430,
    name: 'Gangapur Road',
  },
  dwarka: {
    lat: 19.9880,
    lng: 73.8020,
    name: 'Dwarka Circle',
  },
  deolali: {
    lat: 19.9400,
    lng: 73.8320,
    name: 'Deolali',
  },
}

const GOOGLE_RED_PIN_SVG = `
<svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
  <!-- Ground Shadow -->
  <ellipse cx="20" cy="46" rx="13" ry="3.5" fill="#64748b" opacity="0.35"/>
  <!-- Pin Body (Google Red) -->
  <path d="M20 2C10.0589 2 2 10.0589 2 20C2 32.5 20 45.5 20 45.5C20 45.5 38 32.5 38 20C38 10.0589 29.9411 2 20 2Z" fill="#EA4335" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
  <!-- Inner Dark Red Circle -->
  <circle cx="20" cy="19" r="7.5" fill="#B3261E"/>
</svg>
`

// ── Google Maps Red Drop Pin with Attached Directions Callout ────────────────
function addPinWithDirectionsCallout(
  map: google.maps.Map,
  area: AreaCoords,
  isCardOpenRef: { current: boolean },
  onPinClick: () => void,
) {
  const overlay = new google.maps.OverlayView()
  let container: HTMLDivElement | null = null
  let pinIcon: HTMLDivElement | null = null
  let callout: HTMLDivElement | null = null

  overlay.onAdd = function () {
    container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 40;
      pointer-events: auto;
      transform: translate(-50%, -92%);
    `

    // Callout card attached directly over the pin
    callout = document.createElement('div')
    callout.style.cssText = `
      position: absolute;
      bottom: calc(100% + 2px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 12px;
      padding: 10px 14px;
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.18), 0 4px 6px -2px rgba(0, 0, 0, 0.08);
      font-family: system-ui, -apple-system, sans-serif;
      min-width: 190px;
      display: ${isCardOpenRef.current ? 'flex' : 'none'};
      flex-direction: column;
      gap: 6px;
      z-index: 50;
      cursor: default;
    `

    callout.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 5px;">
          <span style="display:inline-block; width: 7px; height: 7px; border-radius: 50%; background: #ea4335;"></span>
          <span style="font-size: 12px; font-weight: 700; color: #0f172a; white-space: nowrap;">${area.name}, Nashik</span>
        </div>
      </div>
      <div style="font-size: 10px; color: #64748b; font-weight: 500;">
        GPS: ${area.lat.toFixed(4)}, ${area.lng.toFixed(4)}
      </div>
      <div style="margin-top: 2px;">
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=${area.lat},${area.lng}"
          target="_blank"
          rel="noreferrer"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            background: #059669;
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 7px;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
            transition: background 0.15s ease;
            box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
          "
          onmouseover="this.style.background='#047857'"
          onmouseout="this.style.background='#059669'"
        >
          <span>🚗</span>
          <span>Get Directions ↗</span>
        </a>
      </div>
      <!-- Downward Callout Arrow pointing directly to pin head -->
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #ffffff;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.08));
      "></div>
    `

    callout.onclick = (e) => {
      e.stopPropagation()
    }

    pinIcon = document.createElement('div')
    pinIcon.style.cssText = `
      width: 40px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    `
    pinIcon.innerHTML = GOOGLE_RED_PIN_SVG
    pinIcon.title = `Click to toggle directions for ${area.name}`

    pinIcon.onmouseenter = () => {
      if (pinIcon) pinIcon.style.transform = 'scale(1.18) translateY(-3px)'
    }
    pinIcon.onmouseleave = () => {
      if (pinIcon) pinIcon.style.transform = 'scale(1) translateY(0)'
    }
    pinIcon.onclick = (e) => {
      e.stopPropagation()
      isCardOpenRef.current = !isCardOpenRef.current
      if (callout) {
        callout.style.display = isCardOpenRef.current ? 'flex' : 'none'
      }
      onPinClick()
    }

    container.appendChild(callout)
    container.appendChild(pinIcon)
    this.getPanes()!.overlayMouseTarget.appendChild(container)
  }

  overlay.draw = function () {
    if (!container) return
    const pt = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(area.lat, area.lng))
    if (!pt) return
    container.style.left = `${pt.x}px`
    container.style.top  = `${pt.y}px`
  }

  overlay.onRemove = function () {
    container?.parentNode?.removeChild(container)
    container = null
    callout = null
    pinIcon = null
  }

  overlay.setMap(map)
  return overlay
}

// ── Leaflet Fallback for Area Location ───────────────────────────────────────
function initLeafletAreaLocation(
  container: HTMLDivElement,
  area: AreaCoords,
  mapType: 'roadmap' | 'hybrid',
) {
  return import('leaflet').then((L) => {
    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: number })._leaflet_id
      container.innerHTML = ''
    }

    const map = L.map(container, {
      center: [area.lat, area.lng],
      zoom: 15.5,
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

    const marker = L.marker([area.lat, area.lng], {
      icon: L.divIcon({
        html: `<div style="width:40px;height:50px;transform:translate(-50%, -92%);cursor:pointer;">
          ${GOOGLE_RED_PIN_SVG}
        </div>`,
        className: '',
        iconSize: [40, 50],
        iconAnchor: [20, 46],
      }),
      interactive: true,
    }).addTo(map)

    marker.bindPopup(`
      <div style="font-family:system-ui,sans-serif;min-width:180px;padding:4px 2px;">
        <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:2px;display:flex;align-items:center;gap:4px;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ea4335;"></span>
          <span>${area.name}, Nashik</span>
        </div>
        <div style="font-size:10px;color:#64748b;margin-bottom:8px;">GPS: ${area.lat.toFixed(4)}, ${area.lng.toFixed(4)}</div>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${area.lat},${area.lng}" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;text-align:center;background:#059669;color:#fff;font-weight:700;font-size:11px;padding:6px 10px;border-radius:7px;text-decoration:none;box-shadow:0 2px 6px rgba(5,150,105,0.3);">🚗 Get Directions ↗</a>
      </div>
    `, { offset: [0, -42], autoPan: true }).openPopup()

    return map
  })
}

export interface AreaLocationMapProps {
  areaId: string
  areaName: string
}

export function AreaLocationMap({ areaId, areaName }: AreaLocationMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const overlayRef = useRef<google.maps.OverlayView | null>(null)
  const isCardOpenRef = useRef<boolean>(true)
  const destroyRef = useRef<(() => void) | null>(null)

  const [provider, setProvider] = useState<'loading' | 'google' | 'leaflet'>('loading')
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap')

  const areaInfo: AreaCoords = AREA_GPS_DATA[areaId] || {
    lat: 19.9580,
    lng: 73.7540,
    name: areaName,
  }

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

  const toggleMapType = (type: 'roadmap' | 'hybrid') => {
    setMapType(type)
    if (provider === 'google' && mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  const recenterPin = () => {
    if (provider === 'google' && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: areaInfo.lat, lng: areaInfo.lng })
      mapInstanceRef.current.setZoom(15.5)
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

        const map = new google.maps.Map(mapDiv, {
          center: { lat: areaInfo.lat, lng: areaInfo.lng },
          zoom: 15.5,
          mapTypeId: mapType,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          scrollwheel: false,
        })
        mapInstanceRef.current = map

        overlayRef.current?.setMap(null)
        overlayRef.current = addPinWithDirectionsCallout(
          map,
          areaInfo,
          isCardOpenRef,
          () => {
            map.panTo({ lat: areaInfo.lat, lng: areaInfo.lng })
          },
        )

        setProvider('google')
        destroyRef.current = () => {
          mapDiv.innerHTML = ''
          mapInstanceRef.current = null
        }
      })
      .catch(() => {
        if (!isMounted) return
        initLeafletAreaLocation(mapDiv, areaInfo, mapType).then((map) => {
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
  }, [API_KEY, areaId, mapType])

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-card" padding="none">
      {/* Top Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink">
            {areaInfo.name} Location Pinpoint
          </span>
          <Badge className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
            GPS: {areaInfo.lat.toFixed(4)}, {areaInfo.lng.toFixed(4)}
          </Badge>
        </div>

        {/* View Mode & Map Controls */}
        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={recenterPin}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title={`Recenter ${areaInfo.name}`}
          >
            <span>🎯 Recenter</span>
            <span>{areaInfo.name}</span>
          </button>
        </div>
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

        <div ref={mapDivRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* Floating Bottom Badge */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/40 via-transparent to-transparent px-4 py-2.5 text-white sm:px-5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">📍 {areaInfo.name}, Nashik</span>
          </div>
          <Badge className="bg-emerald-600/90 text-white border-none font-bold text-xs pointer-events-auto">
            Google Maps · Live
          </Badge>
        </div>
      </div>
    </Card>
  )
}
