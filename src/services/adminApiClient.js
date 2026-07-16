import axios from 'axios'
import { env } from '../config/env'

const ADMIN_TOKEN_KEY = 'dashboardAdminToken'
const ADMIN_USER_KEY = 'dashboardAdminUser'

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''

// Mirrors the previous fetch-based parseResponseBody: parse JSON when possible,
// fall back to raw text (e.g. the delivery-note print HTML endpoint), and
// treat an empty body as null. Axios' default JSON transform throws on a
// parse failure, so this custom transform is required to keep that behavior.
const transformResponse = [(data) => {
  if (typeof data !== 'string') return data
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}]

export const adminAuthStorage = {
  getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  },

  setToken(token) {
    if (!token) return
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  },

  removeToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null')
    } catch {
      return null
    }
  },

  setUser(user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
  },
}

export async function adminApiRequest(path, options = {}) {
  const { method = 'GET', body, headers: customHeaders, signal, ...rest } = options
  const token = adminAuthStorage.getToken()
  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData

  const headers = {
    Accept: 'application/json',
    ...(body && !isFormDataBody ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await axios.request({
      url: `${API_BASE_URL}${path}`,
      method,
      data: body,
      headers,
      signal,
      validateStatus: () => true,
      transformResponse,
      ...rest,
    })
  } catch (error) {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      const abortError = new Error(error.message || 'The operation was aborted.')
      abortError.name = 'AbortError'
      throw abortError
    }

    const connectionError = new Error(
      'Unable to connect to the API server. Start the ASP.NET Core backend or update VITE_API_PROXY_TARGET in .env, then restart Vite.'
    )
    connectionError.cause = error
    throw connectionError
  }

  const data = response.data

  if (response.status < 200 || response.status >= 300) {
    const validationMessages = data?.errors
      ? Object.entries(data.errors)
          .flatMap(([field, messages]) => (
            Array.isArray(messages)
              ? messages.map(message => `${field}: ${message}`)
              : [`${field}: ${messages}`]
          ))
      : []

    const message =
      validationMessages[0] ||
      data?.message ||
      data?.title ||
      data?.error ||
      response.statusText ||
      `HTTP ${response.status}`

    const error = new Error(message)
    error.status = response.status
    error.data = data

    if (response.status === 401) {
      adminAuthStorage.removeToken()
      window.dispatchEvent(new Event('dashboard-admin-auth-expired'))
    }

    throw error
  }

  return data
}
