import { adminApiRequest } from './adminApiClient'

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

export const fertilizerItemConfigurationsApi = {
  async list({ includeInactive = true, signal } = {}) {
    const params = new URLSearchParams()
    params.set('includeInactive', String(includeInactive))

    const response = await adminApiRequest(`/api/FertilizerItemConfiguration?${params.toString()}`, {
      method: 'GET',
      signal,
    })

    return normalizeResponse(response)
  },

  async create({ category, name }) {
    const response = await adminApiRequest('/api/FertilizerItemConfiguration', {
      method: 'POST',
      body: JSON.stringify({
        category: normalizeCategory(category),
        name,
      }),
    })

    return normalizeRow(response, category)
  },

  async update({ category, id, name, isActive }) {
    const normalizedCategory = normalizeCategory(category)

    const response = await adminApiRequest(`/api/FertilizerItemConfiguration/${normalizedCategory}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        isActive,
      }),
    })

    return normalizeRow(response, normalizedCategory)
  },

  async setActive({ category, id, isActive }) {
    const normalizedCategory = normalizeCategory(category)

    const response = await adminApiRequest(`/api/FertilizerItemConfiguration/${normalizedCategory}/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({
        isActive,
      }),
    })

    return normalizeRow(response, normalizedCategory)
  },
}
