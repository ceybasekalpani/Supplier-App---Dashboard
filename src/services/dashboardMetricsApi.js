import { env } from '../config/env'
import { getDashboardMetrics } from '../data/dashboardMetrics'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeTone = (tone, key = '') => {
  const normalized = String(tone || key || '').toLowerCase()

  if (normalized.includes('pending') || normalized.includes('amber')) return 'amber'
  if (normalized.includes('approved') || normalized.includes('emerald')) return 'green'
  if (normalized.includes('leaf') || normalized.includes('sky') || normalized.includes('teal')) return 'teal'
  if (normalized.includes('supplier') || normalized.includes('green')) return 'green'

  return 'slate'
}

const normalizeQueueKey = (value) => {
  const key = String(value || '').trim().toLowerCase()

  if (key === 'advance') return 'advance'
  if (key === 'fertilizer') return 'fertilizer'
  if (key === 'item' || key === 'items') return 'items'

  return key || 'unknown'
}

const normalizeStats = (stats = []) => stats.map((stat, index) => {
  const key = String(getValue(stat, 'key') || `stat-${index}`)
  const hasKpiValue = getValue(stat, 'value') !== undefined && getValue(stat, 'value') !== null

  if (hasKpiValue) {
    return {
      id: key,
      key,
      label: String(getValue(stat, 'label') || ''),
      value: String(getValue(stat, 'value') || '0'),
      description: String(getValue(stat, 'description') || ''),
      tone: normalizeTone(getValue(stat, 'tone'), key),
    }
  }

  return {
    id: key,
    key,
    label: String(getValue(stat, 'label') || ''),
    pending: Number(getValue(stat, 'pending') || 0),
    approved: Number(getValue(stat, 'approved') || 0),
    rejected: Number(getValue(stat, 'rejected') || 0),
    total: Number(getValue(stat, 'total') || 0),
  }
})

const normalizeMonthly = (rows = []) => rows.map(row => ({
  name: String(getValue(row, 'month') || ''),
  advance: Number(getValue(row, 'advance') || 0),
  fertilizer: Number(getValue(row, 'fertilizer') || 0),
  items: Number(getValue(row, 'items') || 0),
  total: Number(getValue(row, 'total') || 0),
}))

const queueDefaults = [
  { id: 'advance', key: 'advance', label: 'Advance', pending: 0, approved: 0, rejected: 0, total: 0, path: '' },
  { id: 'fertilizer', key: 'fertilizer', label: 'Fertilizer', pending: 0, approved: 0, rejected: 0, total: 0, path: '' },
  { id: 'items', key: 'items', label: 'Items', pending: 0, approved: 0, rejected: 0, total: 0, path: '' },
]

const normalizeQueue = (rows = []) => {
  const normalizedRows = rows.map(row => {
    const key = normalizeQueueKey(
      getValue(row, 'key') ||
      getValue(row, 'id') ||
      getValue(row, 'requestType') ||
      getValue(row, 'category') ||
      getValue(row, 'type')
    )

    return {
      id: key,
      key,
      label: String(getValue(row, 'label') || (key === 'items' ? 'Items' : key)),
      pending: Number(getValue(row, 'pending') || 0),
      approved: Number(getValue(row, 'approved') || 0),
      rejected: Number(getValue(row, 'rejected') || 0),
      total: Number(getValue(row, 'total') || 0),
      path: String(getValue(row, 'path') || ''),
    }
  })

  const byKey = new Map(queueDefaults.map(row => [row.key, { ...row }]))
  normalizedRows.forEach(row => {
    if (row.key && row.key !== 'unknown') byKey.set(row.key, row)
  })

  return Array.from(byKey.values())
}

const normalizeActivities = (rows = []) => rows.map((activity, index) => ({
  id: String(getValue(activity, 'id') || `${getValue(activity, 'category')}-${getValue(activity, 'requestNo')}-${index}`),
  user: String(getValue(activity, 'supplierName') || getValue(activity, 'regNo') || 'Supplier'),
  action: String(getValue(activity, 'description') || getValue(activity, 'requestNo') || ''),
  category: String(getValue(activity, 'category') || '').toLowerCase(),
  status: String(getValue(activity, 'status') || 'pending').toLowerCase(),
  time: String(getValue(activity, 'date') || ''),
  checkedBy: String(getValue(activity, 'checkedBy') || '-'),
  requestNo: String(getValue(activity, 'requestNo') || ''),
  activityAt: getValue(activity, 'activityAt') || '',
}))

const normalizeMetrics = (response) => ({
  stats: normalizeStats(getValue(response, 'stats') || []),
  monthlyRequestVolume: normalizeMonthly(getValue(response, 'monthlyRequestVolume') || []),
  requestQueue: normalizeQueue(getValue(response, 'requestQueue') || []),
  recentActivities: normalizeActivities(getValue(response, 'recentActivities') || []),
  source: 'api',
})

const normalizeMockMetrics = () => {
  const mock = getDashboardMetrics()

  return {
    ...mock,
    stats: normalizeStats(mock.stats || []),
    monthlyRequestVolume: normalizeMonthly(mock.monthlyRequestVolume || []),
    requestQueue: normalizeQueue(mock.requestQueue || []),
    recentActivities: normalizeActivities(mock.recentActivities || []),
    source: 'mock',
  }
}

const withMockFallback = async (request) => {
  if (!shouldUseApi()) return normalizeMockMetrics()

  try {
    return await request()
  } catch (error) {
    if (error.name === 'AbortError') throw error

    if (env.enableMockData) {
      return {
        ...normalizeMockMetrics(),
        warning: error.message,
      }
    }

    throw error
  }
}

export const dashboardMetricsApi = {
  getMetrics: ({ months = 6, recent = 10, signal } = {}) => (
    withMockFallback(async () => {
      const params = new URLSearchParams({
        months: String(months),
        recent: String(recent),
      })

      const response = await adminApiRequest(`/api/Dashboard/metrics?${params.toString()}`, {
        method: 'GET',
        signal,
      })

      return normalizeMetrics(response)
    })
  ),
}
