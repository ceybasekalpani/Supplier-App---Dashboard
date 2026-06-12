import { adminApiRequest } from './adminApiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeUser = (row) => {
  const fullName = String(getValue(row, 'fullName') || getValue(row, 'name') || '')

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

export const dashboardPermissionsApi = {
  async getSettings({ signal } = {}) {
    const response = await adminApiRequest('/api/DashboardPermissions', {
      method: 'GET',
      signal,
    })

    return normalizeSettings(response)
  },

  async getUserPermissions(adminId, { signal } = {}) {
    const response = await adminApiRequest(`/api/DashboardPermissions/${adminId}`, {
      method: 'GET',
      signal,
    })

    return normalizePermissions(response)
  },

  async saveUserPermissions(adminId, permissions) {
    const response = await adminApiRequest(`/api/DashboardPermissions/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify({
        modulePermissions: permissions.modulePermissions || {},
        subPermissions: permissions.subPermissions || {},
      }),
    })

    return normalizePermissions(response)
  },
}
