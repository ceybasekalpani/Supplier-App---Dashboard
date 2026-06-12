import { env } from '../config/env'
import { adminAuthStorage } from './adminApiClient'

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

export const adminAuthApi = {
  async login({ username, password }) {
    adminAuthStorage.removeToken()

    const response = await fetch(`${API_BASE_URL}/api/DashboardAuth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || 'Dashboard admin login failed')
    }

    const token = getValue(data, 'token')

    if (!token) {
      throw new Error('Dashboard login succeeded, but token was not returned.')
    }

    const user = {
      adminId: getValue(data, 'adminId'),
      username: getValue(data, 'username'),
      fullName: getValue(data, 'fullName'),
      expiresAt: getValue(data, 'expiresAt'),
    }

    adminAuthStorage.setToken(token)
    adminAuthStorage.setUser(user)

    return {
      token,
      ...user,
    }
  },

  logout() {
    adminAuthStorage.removeToken()
  },

  getCurrentAdmin() {
    return adminAuthStorage.getUser()
  },
}