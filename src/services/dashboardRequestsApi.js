import { env } from '../config/env'
import { advanceRequests, fertilizerRequests, itemRequests } from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

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

const buildMockResponse = ({ status = '', search = '', fromDate = '', toDate = '' } = {}) => {
  const term = String(search || '').trim().toLowerCase()
  const activeStatus = String(status || '').trim().toLowerCase()

  const filterRows = rows => rows
    .filter(row => !activeStatus || activeStatus === 'all' || normalizeStatus(row.status) === activeStatus)
    .filter(row => (
      !term ||
      String(row.regNo || '').toLowerCase().includes(term) ||
      String(row.name || '').toLowerCase().includes(term) ||
      String(row.type || row.paymentType || '').toLowerCase().includes(term)
    ))
    .filter(row => {
      const rowDate = String(row.date || '').slice(0, 10)
      if (fromDate && rowDate < fromDate) return false
      if (toDate && rowDate > toDate) return false
      return true
    })

  const advance = filterRows(advanceRequests).map(row => normalizeRequestRow({
    ...row,
    requestNo: row.requestNo || `ADV-${String(row.id).padStart(4, '0')}`,
    type: row.paymentType || 'Advance',
  }))
  const fertilizer = filterRows(fertilizerRequests).map(row => normalizeRequestRow({
    ...row,
    requestNo: row.requestNo || `FER-${String(row.id).padStart(4, '0')}`,
  }))
  const items = filterRows(itemRequests).map(row => normalizeRequestRow({
    ...row,
    requestNo: row.requestNo || `ITM-${String(row.id).padStart(4, '0')}`,
  }))
  const supplierCount = new Set([...advance, ...fertilizer, ...items].map(row => row.regNo)).size

  return {
    advance,
    fertilizer,
    items,
    totals: {
      advanceCount: advance.length,
      fertilizerCount: fertilizer.length,
      itemCount: items.length,
      supplierCount,
      totalCount: advance.length + fertilizer.length + items.length,
      totalAdvanceAmount: advance.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      totalFertilizerQuantity: fertilizer.reduce((sum, row) => sum + Number(row.qty || 0), 0),
      totalItemQuantity: items.reduce((sum, row) => sum + Number(row.qty || 0), 0),
    },
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

export const dashboardRequestsApi = {
  async list({ status = '', search = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()

    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    if (fromDate) params.set('fromDate', fromDate)
    if (toDate) params.set('toDate', toDate)

    const query = params.toString()

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardRequests${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return normalizeResponse(response)
      },
      () => buildMockResponse({ status, search, fromDate, toDate })
    )
  },

  async updateStatus({ requestType, id, status, remarks = '' }) {
    const normalizedType = normalizeRequestType(requestType)

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/DashboardRequests/${normalizedType}/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            status,
            remarks,
          }),
        })

        return normalizeRequestRow(response)
      },
      () => {
        const source = normalizedType === 'advance'
          ? advanceRequests
          : normalizedType === 'fertilizer'
            ? fertilizerRequests
            : itemRequests
        const row = source.find(item => Number(item.id) === Number(id)) || { id }

        return normalizeRequestRow({
          ...row,
          requestNo: row.requestNo || `${normalizedType.toUpperCase()}-${String(id).padStart(4, '0')}`,
          status,
          remarks,
          checkedBy: 'Local Admin',
        })
      }
    )
  },

}
