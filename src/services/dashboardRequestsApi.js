import { adminApiRequest } from './adminApiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeStatus = (status) => String(status || 'pending').trim().toLowerCase()

const normalizeRequestRow = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  requestNo: String(getValue(row, 'requestNo') || ''),
  regNo: String(getValue(row, 'regNo') || ''),
  name: String(getValue(row, 'name') || ''),
  type: String(getValue(row, 'type') || ''),
  amount: Number(getValue(row, 'amount') || 0),
  qty: Number(getValue(row, 'qty') || 0),
  unit: String(getValue(row, 'unit') || ''),
  month: String(getValue(row, 'month') || ''),
  date: String(getValue(row, 'date') || ''),
  status: normalizeStatus(getValue(row, 'status')),
  checkedBy: String(getValue(row, 'checkedBy') || '-'),
  remarks: String(getValue(row, 'remarks') || ''),
  createdAt: getValue(row, 'createdAt') || '',
  updatedAt: getValue(row, 'updatedAt') || '',
})

const normalizeResponse = (response) => ({
  advance: (getValue(response, 'advance') || []).map(normalizeRequestRow),
  fertilizer: (getValue(response, 'fertilizer') || []).map(normalizeRequestRow),
  items: (getValue(response, 'items') || []).map(normalizeRequestRow),
})

const normalizeRequestType = (requestType) => {
  const type = String(requestType || '').trim().toLowerCase()

  if (type === 'advance' || type === 'cash') return 'advance'
  if (type === 'fertilizer') return 'fertilizer'
  if (type === 'item' || type === 'items') return 'items'

  return type
}

export const dashboardRequestsApi = {
  async list({ status = '', search = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()

    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    if (fromDate) params.set('fromDate', fromDate)
    if (toDate) params.set('toDate', toDate)

    const query = params.toString()

    const response = await adminApiRequest(`/api/DashboardRequests${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return normalizeResponse(response)
  },

  async updateStatus({ requestType, id, status, remarks = '' }) {
    const normalizedType = normalizeRequestType(requestType)

    const response = await adminApiRequest(`/api/DashboardRequests/${normalizedType}/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        remarks,
      }),
    })

    return normalizeRequestRow(response)
  },
}