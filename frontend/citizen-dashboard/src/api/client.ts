/**
 * UIS API Client
 * Centralized fetch wrapper — injects JWT token, handles errors uniformly.
 */

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
if (import.meta.env.PROD && !configuredBaseUrl) {
  throw new Error('VITE_API_BASE_URL must point to the deployed UIS backend.')
}
const BASE_URL = configuredBaseUrl || 'http://localhost:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('uis_token')
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail ?? body?.message ?? detail
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, detail)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
