import { env } from '../config/env'
import { newsItems, notifications } from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const dateOnly = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const normalizeStatus = (status, isActive = true) => (
  String(status || (isActive ? 'active' : 'draft')).trim().toLowerCase()
)

const normalizeNews = (row) => {
  const isActive = Boolean(getValue(row, 'isActive'))

  return {
    id: Number(getValue(row, 'id') || 0),
    title: String(getValue(row, 'title') || ''),
    description: String(getValue(row, 'description') || ''),
    content: String(getValue(row, 'content') || ''),
    created: dateOnly(getValue(row, 'created')),
    expiry: dateOnly(getValue(row, 'expiry')) || 'No expiry',
    status: normalizeStatus(getValue(row, 'status'), isActive),
    priority: Number(getValue(row, 'priority') || 1),
    isActive,
    showPopup: Boolean(getValue(row, 'showPopup')),
    startDate: dateOnly(getValue(row, 'startDate')),
    endDate: dateOnly(getValue(row, 'endDate')),
    audienceType: String(getValue(row, 'audienceType') || 'AllSuppliers'),
    targetRegNo: getValue(row, 'targetRegNo') ?? null,
    createdBy: String(getValue(row, 'createdBy') || ''),
    dismissedCount: Number(getValue(row, 'dismissedCount') || 0),
  }
}

const normalizeNotification = (row) => {
  const isActive = Boolean(getValue(row, 'isActive'))

  return {
    id: Number(getValue(row, 'id') || 0),
    title: String(getValue(row, 'title') || ''),
    message: String(getValue(row, 'message') || ''),
    type: String(getValue(row, 'type') || 'info'),
    status: normalizeStatus(getValue(row, 'status'), isActive),
    scheduledFor: getValue(row, 'scheduledFor') || '',
    sentAt: getValue(row, 'sentAt') || '',
    priority: Number(getValue(row, 'priority') || 1),
    isActive,
    startDate: dateOnly(getValue(row, 'startDate')),
    endDate: dateOnly(getValue(row, 'endDate')),
    audienceType: String(getValue(row, 'audienceType') || 'AllSuppliers'),
    targetRegNo: getValue(row, 'targetRegNo') ?? null,
    createdBy: String(getValue(row, 'createdBy') || ''),
    readCount: Number(getValue(row, 'readCount') || 0),
    dismissedCount: Number(getValue(row, 'dismissedCount') || 0),
  }
}

const normalizeDashboard = (response) => ({
  news: (getValue(response, 'news') || []).map(normalizeNews),
  notifications: (getValue(response, 'notifications') || []).map(normalizeNotification),
})

const toNullableDateTime = (value) => value || null

const toNullableRegNo = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return null

  const regNo = Number(trimmed)
  return Number.isFinite(regNo) ? regNo : null
}

const buildNewsPayload = ({ title, description, expiryDate, active, audienceType, targetRegNo }) => ({
  title: title.trim(),
  description: description.trim(),
  content: description.trim(),
  expiryDate: toNullableDateTime(expiryDate),
  startDate: null,
  isActive: active,
  publishNow: active,
  audienceType: audienceType || 'AllSuppliers',
  targetRegNo: audienceType === 'SpecificSupplier' ? toNullableRegNo(targetRegNo) : null,
  showPopup: false,
  priority: 1,
})

const buildNotificationPayload = ({ title, message, schedule, type, audienceType, targetRegNo }) => ({
  title: title.trim(),
  message: message.trim(),
  type: type || 'General',
  schedule: toNullableDateTime(schedule),
  startDate: null,
  endDate: null,
  priority: 1,
  isActive: true,
  publishNow: !schedule,
  audienceType: audienceType || 'AllSuppliers',
  targetRegNo: audienceType === 'SpecificSupplier' ? toNullableRegNo(targetRegNo) : null,
})

const mockDashboard = () => ({
  news: newsItems.map(row => normalizeNews({
    ...row,
    isActive: row.status === 'active',
    content: row.description,
  })),
  notifications: notifications.map(row => normalizeNotification({
    ...row,
    isActive: row.status === 'active' || row.status === 'delivered',
    type: row.type || 'General',
  })),
})

const withMockFallback = async (request, mockFactory) => {
  if (!shouldUseApi()) return mockFactory()

  try {
    return await request()
  } catch (error) {
    if (error.name === 'AbortError' || !env.enableMockData) throw error
    return mockFactory()
  }
}

export const communicationsApi = {
  async getAll({ signal } = {}) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/Communications', {
          method: 'GET',
          signal,
        })

        return normalizeDashboard(response)
      },
      mockDashboard
    )
  },

  async getNews({ status = '', signal } = {}) {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    const query = params.toString()

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Communications/news${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return (response || []).map(normalizeNews)
      },
      () => mockDashboard().news.filter(item => !status || status === 'all' || item.status === status)
    )
  },

  async createNews(form) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/Communications/news', {
          method: 'POST',
          body: JSON.stringify(buildNewsPayload(form)),
        })

        return normalizeNews(response)
      },
      () => normalizeNews({
        ...form,
        id: Date.now(),
        description: form.description,
        created: new Date().toISOString(),
        isActive: form.active,
      })
    )
  },

  async updateNews(id, form) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Communications/news/${id}`, {
          method: 'PUT',
          body: JSON.stringify(buildNewsPayload(form)),
        })

        return normalizeNews(response)
      },
      () => normalizeNews({
        ...form,
        id,
        description: form.description,
        isActive: form.active,
      })
    )
  },

  async deleteNews(id) {
    return withMockFallback(
      () => adminApiRequest(`/api/Communications/news/${id}`, {
        method: 'DELETE',
      }),
      () => null
    )
  },

  async getNotifications({ status = '', signal } = {}) {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    const query = params.toString()

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Communications/notifications${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return (response || []).map(normalizeNotification)
      },
      () => mockDashboard().notifications.filter(item => !status || status === 'all' || item.status === status)
    )
  },

  async createNotification(form) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/Communications/notifications', {
          method: 'POST',
          body: JSON.stringify(buildNotificationPayload(form)),
        })

        return normalizeNotification(response)
      },
      () => normalizeNotification({
        ...form,
        id: Date.now(),
        isActive: true,
      })
    )
  },

  async updateNotification(id, form) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Communications/notifications/${id}`, {
          method: 'PUT',
          body: JSON.stringify(buildNotificationPayload(form)),
        })

        return normalizeNotification(response)
      },
      () => normalizeNotification({
        ...form,
        id,
        isActive: true,
      })
    )
  },

  async deleteNotification(id) {
    return withMockFallback(
      () => adminApiRequest(`/api/Communications/notifications/${id}`, {
        method: 'DELETE',
      }),
      () => null
    )
  },
}
