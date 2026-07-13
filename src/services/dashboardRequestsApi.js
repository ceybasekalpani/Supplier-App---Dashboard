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
  salaryDate: String(getValue(row, 'salaryDate') || getValue(row, 'month') || getValue(row, 'date') || ''),
  month: String(getValue(row, 'month') || getValue(row, 'salaryDate') || ''),
  date: String(getValue(row, 'date') || getValue(row, 'salaryDate') || getValue(row, 'month') || ''),
  status: normalizeStatus(getValue(row, 'status')),
  checkedBy: String(getValue(row, 'checkedBy') || getValue(row, 'approvedBy') || '-'),
  approvedBy: String(getValue(row, 'approvedBy') || getValue(row, 'checkedBy') || ''),
  remarks: String(getValue(row, 'remarks') || ''),
  createdAt: getValue(row, 'createdAt') || '',
  updatedAt: getValue(row, 'updatedAt') || '',
})

const normalizeResponse = (response) => ({
  advance: (getValue(response, 'advance') || []).map(normalizeRequestRow),
  fertilizer: (getValue(response, 'fertilizer') || []).map(normalizeRequestRow),
  items: (getValue(response, 'items') || []).map(normalizeRequestRow),
  totals: {
    advanceCount: Number(getValue(getValue(response, 'totals') || {}, 'advanceCount') || 0),
    fertilizerCount: Number(getValue(getValue(response, 'totals') || {}, 'fertilizerCount') || 0),
    itemCount: Number(getValue(getValue(response, 'totals') || {}, 'itemCount') || 0),
    supplierCount: Number(getValue(getValue(response, 'totals') || {}, 'supplierCount') || 0),
    totalCount: Number(getValue(getValue(response, 'totals') || {}, 'totalCount') || 0),
    totalAdvanceAmount: Number(getValue(getValue(response, 'totals') || {}, 'totalAdvanceAmount') || 0),
    totalFertilizerQuantity: Number(getValue(getValue(response, 'totals') || {}, 'totalFertilizerQuantity') || 0),
    totalItemQuantity: Number(getValue(getValue(response, 'totals') || {}, 'totalItemQuantity') || 0),
  },
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

  async getAdvanceLimit(regNo, salaryDate, { signal } = {}) {
    const params = new URLSearchParams()
    if (salaryDate) params.set('salaryDate', salaryDate)
    const query = params.toString()

    const response = await adminApiRequest(`/api/DashboardRequests/advance-limit/${regNo}${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    const limit = getValue(response, 'limit')
    return limit === null || limit === undefined ? null : Number(limit)
  },

}
