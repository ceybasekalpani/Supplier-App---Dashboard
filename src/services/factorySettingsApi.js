import { adminApiRequest } from './adminApiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeSettings = (response) => ({
  salaryDate: String(getValue(response, 'salaryDate') || '').slice(0, 10),
})

export const factorySettingsApi = {
  async getSettings({ signal } = {}) {
    const response = await adminApiRequest('/api/Factory/settings', {
      method: 'GET',
      signal,
    })

    return normalizeSettings(response)
  },

  async updateSalaryDate(salaryDate) {
    const response = await adminApiRequest('/api/Factory/salary-date', {
      method: 'PUT',
      body: JSON.stringify({ salaryDate }),
    })

    return normalizeSettings(response)
  },
}
