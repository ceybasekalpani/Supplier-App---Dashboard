import { env } from '../config/env'
import { permissionCatalog, roleModulePermissionDefaults, roleSubPermissionDefaults, systemUsers } from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeUser = (row) => {
  const fullName = String(getValue(row, 'fullName') || getValue(row, 'name') || '')
  const isSuperAdmin = getValue(row, 'isSuperAdmin') === true || String(getValue(row, 'isSuperAdmin')).toLowerCase() === 'true'

  return {
    id: Number(getValue(row, 'id') || 0),
    name: fullName,
    fullName,
    email: String(getValue(row, 'email') || ''),
    username: String(getValue(row, 'username') || ''),
    phoneNo: String(getValue(row, 'phoneNo') || ''),
    role: String(getValue(row, 'role') || 'Admin'),
    status: String(getValue(row, 'status') || 'active').trim().toLowerCase(),
    avatar: getValue(row, 'avatar') || null,
    isSuperAdmin,
  }
}

const normalizeModule = (row) => ({
  id: String(getValue(row, 'id') || ''),
  label: String(getValue(row, 'label') || ''),
  description: String(getValue(row, 'description') || ''),
  subPermissions: (getValue(row, 'subPermissions') || []).map(sub => ({
    id: String(getValue(sub, 'id') || ''),
    label: String(getValue(sub, 'label') || ''),
    description: String(getValue(sub, 'description') || ''),
  })),
})

const normalizePermissions = (row = {}) => ({
  modulePermissions: getValue(row, 'modulePermissions') || {},
  subPermissions: getValue(row, 'subPermissions') || {},
})

const normalizeSettings = (response = {}) => {
  const rawUserPermissions = getValue(response, 'userPermissions') || {}
  const userPermissions = Object.entries(rawUserPermissions).reduce((acc, [userId, permissions]) => {
    acc[Number(userId)] = normalizePermissions(permissions)
    return acc
  }, {})

  return {
    users: (getValue(response, 'users') || []).map(normalizeUser),
    modules: (getValue(response, 'modules') || []).map(normalizeModule),
    userPermissions,
  }
}

const buildMockModules = () => (
  Object.entries(permissionCatalog).map(([id, subPermissions]) => ({
    id,
    label: id.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()),
    description: '',
    subPermissions,
  }))
)

const buildMockSettings = () => {
  const users = systemUsers.map(normalizeUser)
  const userPermissions = systemUsers.reduce((acc, user) => {
    const role = user.role || 'Viewer'
    acc[Number(user.id)] = {
      modulePermissions: roleModulePermissionDefaults[role] || roleModulePermissionDefaults.Viewer,
      subPermissions: roleSubPermissionDefaults[role] || roleSubPermissionDefaults.Viewer,
    }
    return acc
  }, {})

  return {
    users,
    modules: buildMockModules(),
    userPermissions,
  }
}

const withMockFallback = async (request, mockFactory) => {
  if (!shouldUseApi()) return mockFactory()

  try {
    return await request()
  } catch (error) {
    if (error.name === 'AbortError' || !env.enableMockData) throw error
    return mockFactory()
  }
}

export const dashboardPermissionsApi = {
  async getSettings({ signal } = {}) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/DashboardPermissions', {
          method: 'GET',
          signal,
        })

        return normalizeSettings(response)
      },
      buildMockSettings
    )
  },

  async getUserPermissions(adminId, { signal } = {}) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardPermissions/${adminId}`, {
          method: 'GET',
          signal,
        })

        return normalizePermissions(response)
      },
      () => buildMockSettings().userPermissions[Number(adminId)] || {
        modulePermissions: {},
        subPermissions: {},
      }
    )
  },

  async saveUserPermissions(adminId, permissions) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardPermissions/${adminId}`, {
          method: 'PUT',
          body: JSON.stringify({
            modulePermissions: permissions.modulePermissions || {},
            subPermissions: permissions.subPermissions || {},
          }),
        })

        return normalizePermissions(response)
      },
      () => normalizePermissions(permissions)
    )
  },
}
