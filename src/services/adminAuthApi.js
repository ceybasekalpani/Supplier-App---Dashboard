import { env } from '../config/env'
import { adminAuthStorage } from './adminApiClient'
import { dashboardPermissionsApi } from './dashboardPermissionsApi'

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeBoolean = value => value === true || String(value).toLowerCase() === 'true'

const isMainAdminUsername = username => ['admin', 'mainadmin', 'main_admin'].includes(String(username || '').trim().toLowerCase())

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

    const rawPermissionKeys = getValue(data, 'permissions') || getValue(data, 'permissionKeys')
    const rawModulePermissions = getValue(data, 'modulePermissions')
    const rawSubPermissions = getValue(data, 'subPermissions')
    const permissionKeys = rawPermissionKeys || []
    const modulePermissions = rawModulePermissions || {}
    const subPermissions = rawSubPermissions || {}
    const hasPermissionData = Boolean(rawPermissionKeys || rawModulePermissions || rawSubPermissions)

    const usernameValue = getValue(data, 'username') || username
    const user = {
      adminId: getValue(data, 'adminId'),
      id: getValue(data, 'adminId') ?? getValue(data, 'id'),
      username: usernameValue,
      fullName: getValue(data, 'fullName'),
      expiresAt: getValue(data, 'expiresAt'),
      isSuperAdmin: normalizeBoolean(getValue(data, 'isSuperAdmin')) || isMainAdminUsername(usernameValue),
      hasPermissionData,
      permissions: permissionKeys,
      modulePermissions,
      subPermissions,
    }

    adminAuthStorage.setToken(token)

    if (!user.isSuperAdmin && !user.hasPermissionData && user.id) {
      try {
        const userPermissions = await dashboardPermissionsApi.getUserPermissions(user.id)
        user.hasPermissionData = true
        user.modulePermissions = userPermissions.modulePermissions || {}
        user.subPermissions = userPermissions.subPermissions || {}
      } catch {
        user.hasPermissionData = false
      }
    }

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
