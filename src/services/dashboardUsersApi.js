import { env } from '../config/env'
import { systemUsers, userRoles } from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const DASHBOARD_USER_PASSWORDS_KEY = 'dashboardUserPasswords'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''

// const toProfileImageDisplayUrl = (id, avatar, cacheKey = '') => {
//   if (!id || !avatar) return avatar || null
//   const value = String(avatar).trim()
//   if (/^(data:|blob:)/i.test(value)) return value
//   if (/^https?:\/\//i.test(value)) {
//     if (!cacheKey) return value
//     const separator = value.includes('?') ? '&' : '?'
//     return `${value}${separator}v=${encodeURIComponent(cacheKey)}`
//   }
//   const separator = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : ''
//   return `${API_BASE_URL}/api/DashboardUsers/${id}/profile-image${separator}`
// }

  const toProfileImageDisplayUrl = (id, avatar, cacheKey = '') => {
  if (!avatar) return null
  const value = String(avatar).trim()
  if (/^(data:|blob:)/i.test(value)) return value
  if (!id) return value
  // Always route through our backend proxy instead of the raw Supabase URL
  return toProfileImageEndpointUrl(id, cacheKey || Date.now())
}

const toProfileImageEndpointUrl = (id, cacheKey = Date.now()) => {
  if (!id) return null
  const separator = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : ''
  return `${API_BASE_URL}/api/DashboardUsers/${id}/profile-image${separator}`
}

const dateOnly = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const normalizeUser = (row) => {
  const fullName = String(getValue(row, 'fullName') || getValue(row, 'name') || '')
  const password = getValue(row, 'password') || getValue(row, 'plainPassword') || getValue(row, 'temporaryPassword') || ''
  const id = Number(getValue(row, 'id') || 0)
  const avatar = getValue(row, 'avatar') || getValue(row, 'avatarUrl') || getValue(row, 'profileImage') || null
  const cacheKey = getValue(row, 'updatedAt') || getValue(row, 'lastLoginAt') || ''
  const displayAvatar = toProfileImageDisplayUrl(id, avatar, cacheKey)
  const endpointAvatar = avatar ? toProfileImageEndpointUrl(id, cacheKey) : null

  return {
    id,
    name: fullName,
    fullName,
    email: String(getValue(row, 'email') || ''),
    username: String(getValue(row, 'username') || ''),
    phoneNo: String(getValue(row, 'phoneNo') || ''),
    role: String(getValue(row, 'role') || 'Admin'),
    status: String(getValue(row, 'status') || 'active').trim().toLowerCase(),
    avatar: displayAvatar,
    avatarFallback: endpointAvatar && endpointAvatar !== displayAvatar ? endpointAvatar : null,
    avatarUrl: avatar,
    profileImage: displayAvatar,
    password: password ? String(password) : '',
    isSuperAdmin: getValue(row, 'isSuperAdmin') === true || String(getValue(row, 'isSuperAdmin')).toLowerCase() === 'true',
    createdAt: dateOnly(getValue(row, 'createdAt')),
    lastLoginAt: dateOnly(getValue(row, 'lastLoginAt')),
  }
}

const withProfileCacheBust = (user) => {
  if (!user?.id) return user

  const displayUrl = user.avatarUrl
    ? toProfileImageDisplayUrl(user.id, user.avatarUrl, Date.now())
    : toProfileImageEndpointUrl(user.id)
  return {
    ...user,
    avatar: displayUrl,
    profileImage: displayUrl,
    avatarUrl: user.avatarUrl || displayUrl,
  }
}

const readSavedPasswords = () => {
  try {
    return JSON.parse(localStorage.getItem(DASHBOARD_USER_PASSWORDS_KEY) || '{}')
  } catch {
    return {}
  }
}

const writeSavedPasswords = passwords => {
  localStorage.setItem(DASHBOARD_USER_PASSWORDS_KEY, JSON.stringify(passwords))
}

const rememberPassword = (user, password) => {
  if (!user?.id || !password) return mergeSavedPassword(user)

  const passwords = readSavedPasswords()
  passwords[user.id] = {
    username: user.username,
    password,
  }
  writeSavedPasswords(passwords)

  return {
    ...user,
    password,
  }
}

const forgetPassword = id => {
  const passwords = readSavedPasswords()
  delete passwords[id]
  writeSavedPasswords(passwords)
}

const mergeSavedPassword = user => {
  const saved = readSavedPasswords()[user.id]

  return {
    ...user,
    password: user.password || saved?.password || '',
  }
}

const normalizeSummary = (summary = {}) => ({
  totalAdministrators: Number(getValue(summary, 'totalAdministrators') || 0),
  activeUsers: Number(getValue(summary, 'activeUsers') || 0),
  inactiveUsers: Number(getValue(summary, 'inactiveUsers') || 0),
})

const normalizeResponse = (response = {}) => ({
  summary: normalizeSummary(getValue(response, 'summary')),
  users: (getValue(response, 'users') || []).map(normalizeUser).map(mergeSavedPassword),
  roles: (getValue(response, 'roles') || []).map(role => String(role)),
})

const buildUserPayload = ({ fullName, email, username, password, phoneNo, role, status }, { editing = false } = {}) => ({
  fullName: fullName.trim(),
  email: email.trim(),
  username: username.trim(),
  ...(editing && !password ? {} : { password }),
  phoneNo: phoneNo?.trim() || null,
  role,
  status,
})


const buildMockResponse = ({ search = '', status = '' } = {}) => {
  const term = String(search || '').trim().toLowerCase()
  const activeStatus = String(status || '').trim().toLowerCase()
  const users = systemUsers
    .map(normalizeUser)
    .filter(user => !activeStatus || activeStatus === 'all' || user.status === activeStatus)
    .filter(user => (
      !term ||
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    ))
    .map(mergeSavedPassword)

  return {
    summary: {
      totalAdministrators: users.length,
      activeUsers: users.filter(user => user.status === 'active').length,
      inactiveUsers: users.filter(user => user.status !== 'active').length,
    },
    users,
    roles: userRoles.map(role => role.name),
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

export const dashboardUsersApi = {
  async list({ search = '', status = '', signal } = {}) {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status && status !== 'all') params.set('status', status)

    const query = params.toString()
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardUsers${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return normalizeResponse(response)
      },
      () => buildMockResponse({ search, status })
    )
  },

  async create(form) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/DashboardUsers', {
          method: 'POST',
          body: JSON.stringify(buildUserPayload(form)),
        })

        return rememberPassword(normalizeUser(response), form.password)
      },
      () => rememberPassword(normalizeUser({
        ...form,
        id: Date.now(),
        name: form.fullName,
        createdAt: new Date().toISOString(),
      }), form.password)
    )
  },

  async update(id, form) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardUsers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(buildUserPayload(form, { editing: true })),
        })

        return rememberPassword(normalizeUser(response), form.password)
      },
      () => rememberPassword(normalizeUser({
        ...form,
        id,
        name: form.fullName,
      }), form.password)
    )
  },

  async uploadProfileImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardUsers/${id}/profile-image`, {
          method: 'PUT',
          body: formData,
        })

        return withProfileCacheBust(rememberPassword(normalizeUser(response), readSavedPasswords()[id]?.password))
      },
      () => {
        const previewUrl = URL.createObjectURL(file)
        return {
          id,
          avatar: previewUrl,
          profileImage: previewUrl,
          avatarUrl: previewUrl,
        }
      }
    )
  },

  async clearProfileImage(id) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardUsers/${id}/profile-image`, {
          method: 'DELETE',
        })

        return rememberPassword(normalizeUser(response), readSavedPasswords()[id]?.password)
      },
      () => ({
        id,
        avatar: null,
        profileImage: null,
        avatarUrl: null,
      })
    )
  },

  async checkProfileImageStorage() {
    return withMockFallback(
      () => adminApiRequest('/api/Settings/storage-check', {
        method: 'GET',
      }),
      () => ({
        bucketName: 'profile-images',
        bucketsStatus: 200,
        objectsStatus: 200,
        testUploadStatus: 200,
        testUploadResponse: 'Mock storage check passed.',
      })
    )
  },

  async delete(id) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardUsers/${id}`, {
          method: 'DELETE',
        })

        forgetPassword(id)
        return response
      },
      () => {
        forgetPassword(id)
        return null
      }
    )
  },
}
