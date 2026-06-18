import { env } from '../config/env'

const ADMIN_TOKEN_KEY = 'dashboardAdminToken'
const ADMIN_USER_KEY = 'dashboardAdminUser'

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''

const parseResponseBody = async response => {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

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
  const token = adminAuthStorage.getToken()

  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
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

    if (response.status === 401 || response.status === 403) {
      adminAuthStorage.removeToken()
      window.dispatchEvent(new Event('dashboard-admin-auth-expired'))
    }

    throw error
  }

  return data
}
