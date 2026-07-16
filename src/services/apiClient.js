import axios from 'axios'
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

// Mirrors the previous fetch-based readErrorMessage/response.json() parsing:
// parse JSON when possible, fall back to raw text, and treat an empty body as
// null. Axios' default JSON transform throws on a parse failure, so this
// custom transform is required to keep that behavior.
const transformResponse = [(data) => {
  if (typeof data !== 'string') return data
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}]

const deriveErrorMessage = (response) => {
  const data = response.data

  if (data === null || data === undefined || data === '') {
    return `Request failed with ${response.status}`
  }

  if (typeof data === 'string') return data

  return data.message || data.title || JSON.stringify(data.errors || data)
}

export async function apiRequest(path, options = {}) {
  const { body, skipAuth = false, method = 'GET', headers: customHeaders, signal, ...restOptions } = options
  const token = skipAuth ? '' : getAuthToken()

  const headers = {
    Accept: 'application/json',
    ...(customHeaders || {}),
  }

  if (body !== undefined && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await axios.request({
      url: buildApiUrl(path),
      method,
      data: body,
      headers,
      signal,
      validateStatus: () => true,
      transformResponse,
      ...restOptions,
    })
  } catch (error) {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      const abortError = new Error(error.message || 'The operation was aborted.')
      abortError.name = 'AbortError'
      throw abortError
    }

    throw new Error(describeNetworkError(path), { cause: error })
  }

  if (!(response.status >= 200 && response.status < 300)) {
    const message = deriveErrorMessage(response)
    const error = new Error(
      response.status === 401 && !skipAuth
        ? 'Login required. The dashboard API is protected, and no valid JWT token was found in this browser session.'
        : message
    )
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.data ?? null
}
