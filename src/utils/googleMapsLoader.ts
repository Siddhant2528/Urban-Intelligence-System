export const DEFAULT_GOOGLE_MAPS_KEY = 'AIzaSyB38hO5jQsswJSou0DUxjuXpSofHeTODRY'

export function getGoogleMapsApiKey(): string {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim()
  if (envKey && envKey.length > 0 && !envKey.includes('your_') && !envKey.includes('YOUR_')) {
    return envKey
  }
  return DEFAULT_GOOGLE_MAPS_KEY
}

function isGoogleMapsReady(): boolean {
  return typeof (window as unknown as { google?: { maps?: { Map?: unknown } } }).google?.maps?.Map === 'function'
}

let gmPromise: Promise<void> | null = null
let currentKeyLoaded: string | null = null

export function loadGoogleMaps(apiKey?: string): Promise<void> {
  const keyToUse = (apiKey && apiKey.trim().length > 0) ? apiKey.trim() : getGoogleMapsApiKey()

  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  // If already loaded and Map constructor is ready
  if (isGoogleMapsReady() && currentKeyLoaded === keyToUse) {
    return Promise.resolve()
  }

  if (gmPromise && currentKeyLoaded === keyToUse) {
    return gmPromise
  }

  // If key changed, remove old script
  if (currentKeyLoaded !== keyToUse) {
    const oldScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
    oldScripts.forEach((s) => s.remove())
    gmPromise = null
    delete (window as unknown as { google?: unknown }).google
  }

  currentKeyLoaded = keyToUse

  gmPromise = new Promise((resolve, reject) => {
    const waitForMap = (retries = 20) => {
      if (isGoogleMapsReady()) {
        resolve()
      } else if (retries > 0) {
        setTimeout(() => waitForMap(retries - 1), 100)
      } else {
        resolve()
      }
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      if (isGoogleMapsReady()) {
        resolve()
        return
      }
      existingScript.addEventListener('load', () => waitForMap())
      existingScript.addEventListener('error', () => {
        gmPromise = null
        reject(new Error('google-maps-script-error'))
      })
      return
    }

    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${keyToUse}&v=weekly`
    s.async = true
    s.defer = true
    s.onload = () => {
      waitForMap()
    }
    s.onerror = () => {
      gmPromise = null
      reject(new Error('google-maps-script-load-error'))
    }
    document.head.appendChild(s)
  })

  return gmPromise
}
