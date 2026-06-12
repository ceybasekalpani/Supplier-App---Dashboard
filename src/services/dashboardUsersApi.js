import { adminApiRequest } from './adminApiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const dateOnly = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

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
    createdAt: dateOnly(getValue(row, 'createdAt')),
    lastLoginAt: dateOnly(getValue(row, 'lastLoginAt')),
  }
}

const normalizeSummary = (summary = {}) => ({
  totalAdministrators: Number(getValue(summary, 'totalAdministrators') || 0),
  activeUsers: Number(getValue(summary, 'activeUsers') || 0),
  inactiveUsers: Number(getValue(summary, 'inactiveUsers') || 0),
})

const normalizeResponse = (response = {}) => ({
  summary: normalizeSummary(getValue(response, 'summary')),
  users: (getValue(response, 'users') || []).map(normalizeUser),
  roles: (getValue(response, 'roles') || []).map(role => String(role)),
})

const buildUserPayload = ({ fullName, email, username, password, phoneNo, role, status, avatar }, { editing = false } = {}) => ({
  fullName: fullName.trim(),
  email: email.trim(),
  username: username.trim(),
  ...(editing && !password ? {} : { password }),
  phoneNo: phoneNo?.trim() || null,
  role,
  status,
  avatar: avatar || null,
})

export const dashboardUsersApi = {
  async list({ search = '', status = '', signal } = {}) {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status && status !== 'all') params.set('status', status)

    const query = params.toString()
    const response = await adminApiRequest(`/api/DashboardUsers${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return normalizeResponse(response)
  },

  async create(form) {
    const response = await adminApiRequest('/api/DashboardUsers', {
      method: 'POST',
      body: JSON.stringify(buildUserPayload(form)),
    })

    return normalizeUser(response)
  },

  async update(id, form) {
    const response = await adminApiRequest(`/api/DashboardUsers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildUserPayload(form, { editing: true })),
    })

    return normalizeUser(response)
  },

  async delete(id) {
    return adminApiRequest(`/api/DashboardUsers/${id}`, {
      method: 'DELETE',
    })
  },
}
