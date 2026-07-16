import axios from 'axios'
import { env } from '../config/env'
import { adminAuthStorage } from './adminApiClient'
import { dashboardPermissionsApi } from './dashboardPermissionsApi'

// Mirrors the previous fetch-based `response.json().catch(() => null)`:
// an empty or non-JSON body resolves to null instead of throwing.
const loginTransformResponse = [(data) => {
  if (typeof data !== 'string' || !data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}]

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeBoolean = value => value === true || String(value).toLowerCase() === 'true'

const isMainAdminUsername = username => ['admin', 'mainadmin', 'main_admin'].includes(String(username || '').trim().toLowerCase())

const toProfileImageDisplayUrl = (id, avatar) => (
  /^(data:|blob:)/i.test(String(avatar || ''))
    ? avatar
    : id && avatar
    ? `${API_BASE_URL}/api/DashboardUsers/${id}/profile-image`
    : avatar || null
)

export const adminAuthApi = {
  async login({ username, password }) {
    adminAuthStorage.removeToken()

    const response = await axios.post(
      `${API_BASE_URL}/api/DashboardAuth/login`,
      { username, password },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
        transformResponse: loginTransformResponse,
      }
    )

    const data = response.data

    if (!(response.status >= 200 && response.status < 300)) {
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
    const adminId = getValue(data, 'adminId') ?? getValue(data, 'id')
    const avatar = getValue(data, 'avatar') || getValue(data, 'profileImage') || null
    const user = {
      adminId,
      id: adminId,
      username: usernameValue,
      fullName: getValue(data, 'fullName'),
      avatar: toProfileImageDisplayUrl(adminId, avatar),
      avatarUrl: avatar,
      profileImage: toProfileImageDisplayUrl(adminId, avatar),
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
