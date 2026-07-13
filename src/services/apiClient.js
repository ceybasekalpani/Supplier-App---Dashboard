import { env } from '../config/env'

const TOKEN_KEYS = [
  'authToken',
  'supplier-app-auth-token',
  'supplier-admin-auth-token',
  'accessToken',
  'token',
]

export const getAuthToken = () => {
  if (typeof window === 'undefined') return ''

  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key)
    if (!value) continue

    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'string') return parsed
      if (parsed?.token) return parsed.token
      if (parsed?.accessToken) return parsed.accessToken
    } catch {
      return value
    }
  }

  return ''
}

export const storeAuthToken = (token) => {
  if (typeof window === 'undefined' || !token) return false

  window.localStorage.setItem('authToken', token)
  return true
}

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return false

  TOKEN_KEYS.forEach(key => window.localStorage.removeItem(key))
  return true
}

const buildApiUrl = (path) => {
  const baseUrl = env.apiBaseUrl.replace(/\/+$/, '')
  let normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (baseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.slice(4)
  }

  return `${baseUrl}${normalizedPath}`
}

const describeNetworkError = (path) => {
  const target = env.apiBaseUrl || env.apiProxyTarget || 'the configured API server'
  return `Cannot connect to backend API at ${target}. Start the ASP.NET Core API and confirm the Vite proxy target matches its launch URL. Requested: ${path}`
}

const readErrorMessage = async (response) => {
  const fallback = `Request failed with ${response.status}`
  const text = await response.text().catch(() => '')
  if (!text) return fallback

  try {
    const parsed = JSON.parse(text)
    return parsed.message || parsed.title || JSON.stringify(parsed.errors || parsed)
  } catch {
    return text
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const { body, skipAuth = false, ...restOptions } = options
  const token = skipAuth ? '' : getAuthToken()

  headers.set('Accept', 'application/json')
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response

  try {
    const requestBody = body !== undefined && headers.get('Content-Type') === 'application/json' && typeof body !== 'string'
      ? JSON.stringify(body)
      : body

    response = await fetch(buildApiUrl(path), {
      ...restOptions,
      headers,
      body: requestBody,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new Error(describeNetworkError(path), { cause: error })
  }

  if (!response.ok) {
    const message = await readErrorMessage(response)
    const error = new Error(
      response.status === 401 && !skipAuth
        ? 'Login required. The dashboard API is protected, and no valid JWT token was found in this browser session.'
        : message
    )
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json().catch(() => null)
}
