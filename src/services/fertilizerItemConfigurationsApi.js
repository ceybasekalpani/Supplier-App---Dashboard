import { env } from '../config/env'
import { fertilizerTypes, itemTypes } from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeCategory = (category) => {
  const value = String(category || '').trim().toLowerCase()

  if (value === 'item') return 'items'
  if (value === 'fertilizers') return 'fertilizer'

  return value
}

const normalizeRow = (row, fallbackCategory = '') => {
  const isActive = Boolean(getValue(row, 'isActive'))
  const status = String(getValue(row, 'status') || (isActive ? 'active' : 'inactive')).trim().toLowerCase()

  return {
    id: Number(getValue(row, 'id') || 0),
    category: normalizeCategory(getValue(row, 'category') || fallbackCategory),
    name: String(getValue(row, 'name') || ''),
    status,
    isActive,
    createdAt: getValue(row, 'createdAt') || '',
    updatedAt: getValue(row, 'updatedAt') || '',
  }
}

const normalizeResponse = (response) => ({
  fertilizer: (getValue(response, 'fertilizers') || []).map(row => normalizeRow(row, 'fertilizer')),
  items: (getValue(response, 'items') || []).map(row => normalizeRow(row, 'items')),
})

const mockRows = {
  fertilizer: fertilizerTypes.map(row => normalizeRow({
    ...row,
    category: 'fertilizer',
    isActive: row.status === 'active',
  })),
  items: itemTypes.map(row => normalizeRow({
    ...row,
    category: 'items',
    isActive: row.status === 'active',
  })),
}

const buildMockResponse = ({ includeInactive = true } = {}) => ({
  fertilizer: mockRows.fertilizer.filter(row => includeInactive || row.isActive),
  items: mockRows.items.filter(row => includeInactive || row.isActive),
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

export const fertilizerItemConfigurationsApi = {
  async list({ includeInactive = true, signal } = {}) {
    const params = new URLSearchParams()
    params.set('includeInactive', String(includeInactive))

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/FertilizerItemConfiguration?${params.toString()}`, {
          method: 'GET',
          signal,
        })

        return normalizeResponse(response)
      },
      () => buildMockResponse({ includeInactive })
    )
  },

  async create({ category, name }) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/FertilizerItemConfiguration', {
          method: 'POST',
          body: JSON.stringify({
            category: normalizeCategory(category),
            name,
          }),
        })

        return normalizeRow(response, category)
      },
      () => normalizeRow({
        id: Date.now(),
        category,
        name,
        isActive: true,
      }, category)
    )
  },

  async update({ category, id, name, isActive }) {
    const normalizedCategory = normalizeCategory(category)

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/FertilizerItemConfiguration/${normalizedCategory}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            isActive,
          }),
        })

        return normalizeRow(response, normalizedCategory)
      },
      () => normalizeRow({
        id,
        category: normalizedCategory,
        name,
        isActive,
      }, normalizedCategory)
    )
  },

  async setActive({ category, id, isActive }) {
    const normalizedCategory = normalizeCategory(category)

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/FertilizerItemConfiguration/${normalizedCategory}/${id}/active`, {
          method: 'PATCH',
          body: JSON.stringify({
            isActive,
          }),
        })

        return normalizeRow(response, normalizedCategory)
      },
      () => {
        const current = mockRows[normalizedCategory]?.find(row => Number(row.id) === Number(id))
        return normalizeRow({
          ...current,
          id,
          category: normalizedCategory,
          isActive,
          status: isActive ? 'active' : 'inactive',
        }, normalizedCategory)
      }
    )
  },
}
