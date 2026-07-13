import { adminApiRequest } from './adminApiClient'

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
    createdAt: getValue(row, 'createdAt') || getValue(row, 'created') || '',
    expiry: dateOnly(getValue(row, 'expiry')) || 'No expiry',
    status: normalizeStatus(getValue(row, 'status'), isActive),
    priority: Number(getValue(row, 'priority') || 1),
    isActive,
    showPopup: Boolean(getValue(row, 'showPopup')),
    startDate: dateOnly(getValue(row, 'startDate')),
    endDate: dateOnly(getValue(row, 'endDate')),
    audienceType: String(getValue(row, 'audienceType') || 'AllSuppliers'),
    targetRegNo: getValue(row, 'targetRegNo') ?? null,
    targetRoute: getValue(row, 'targetRoute') || '',
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
    createdAt: getValue(row, 'createdAt') || getValue(row, 'created') || getValue(row, 'sentAt') || '',
    priority: Number(getValue(row, 'priority') || 1),
    isActive,
    startDate: dateOnly(getValue(row, 'startDate')),
    endDate: dateOnly(getValue(row, 'endDate')),
    audienceType: String(getValue(row, 'audienceType') || 'AllSuppliers'),
    targetRegNo: getValue(row, 'targetRegNo') ?? null,
    targetRoute: getValue(row, 'targetRoute') || '',
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

const buildNewsPayload = ({ title, description, expiryDate, active, audienceType, targetRegNo, targetRoute }) => ({
  title: title.trim(),
  description: description.trim(),
  content: description.trim(),
  expiryDate: toNullableDateTime(expiryDate),
  startDate: null,
  isActive: active,
  publishNow: active,
  audienceType: audienceType || 'AllSuppliers',
  targetRegNo: audienceType === 'SpecificSupplier' ? toNullableRegNo(targetRegNo) : null,
  targetRoute: audienceType === 'Route' ? String(targetRoute || '').trim() || null : null,
  showPopup: false,
  priority: 1,
})

const buildNotificationPayload = ({ title, message, schedule, type, audienceType, targetRegNo, targetRoute }) => ({
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
  targetRoute: audienceType === 'Route' ? String(targetRoute || '').trim() || null : null,
})

export const communicationsApi = {
  async getAll({ signal } = {}) {
    const response = await adminApiRequest('/api/Communications', {
      method: 'GET',
      signal,
    })

    return normalizeDashboard(response)
  },

  async getNews({ status = '', signal } = {}) {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    const query = params.toString()

    const response = await adminApiRequest(`/api/Communications/news${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return (response || []).map(normalizeNews)
  },

  async createNews(form) {
    const response = await adminApiRequest('/api/Communications/news', {
      method: 'POST',
      body: JSON.stringify(buildNewsPayload(form)),
    })

    return normalizeNews(response)
  },

  async updateNews(id, form) {
    const response = await adminApiRequest(`/api/Communications/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildNewsPayload(form)),
    })

    return normalizeNews(response)
  },

  async deleteNews(id) {
    return adminApiRequest(`/api/Communications/news/${id}`, {
      method: 'DELETE',
    })
  },

  async getNotifications({ status = '', signal } = {}) {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    const query = params.toString()

    const response = await adminApiRequest(`/api/Communications/notifications${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return (response || []).map(normalizeNotification)
  },

  async createNotification(form) {
    const response = await adminApiRequest('/api/Communications/notifications', {
      method: 'POST',
      body: JSON.stringify(buildNotificationPayload(form)),
    })

    return normalizeNotification(response)
  },

  async updateNotification(id, form) {
    const response = await adminApiRequest(`/api/Communications/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildNotificationPayload(form)),
    })

    return normalizeNotification(response)
  },

  async deleteNotification(id) {
    return adminApiRequest(`/api/Communications/notifications/${id}`, {
      method: 'DELETE',
    })
  },
}
