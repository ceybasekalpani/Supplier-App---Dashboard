import { env } from '../config/env'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeSettings = (response) => ({
  salaryDate: String(getValue(response, 'salaryDate') || '').slice(0, 10),
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

export const factorySettingsApi = {
  async getSettings({ signal } = {}) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/Factory/settings', {
          method: 'GET',
          signal,
        })

        return normalizeSettings(response)
      },
      () => ({ salaryDate: '' })
    )
  },

  async updateSalaryDate(salaryDate) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest('/api/Factory/salary-date', {
          method: 'PUT',
          body: JSON.stringify({ salaryDate }),
        })

        return normalizeSettings(response)
      },
      () => ({ salaryDate })
    )
  },
}
