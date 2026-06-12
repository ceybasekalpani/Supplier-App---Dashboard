import { adminApiRequest } from './adminApiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeIssuedType = (issuedType) => {
  const value = String(issuedType || '').trim().toLowerCase()

  if (value === 'item') return 'items'
  if (value === 'fertilizers') return 'fertilizer'

  return value
}

const dateOnly = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const normalizeQueueRow = (row, fallbackType = '') => ({
  id: Number(getValue(row, 'id') || 0),
  requestNo: String(getValue(row, 'requestNo') || ''),
  regNo: String(getValue(row, 'regNo') || ''),
  supplierName: String(getValue(row, 'supplierName') || ''),
  route: String(getValue(row, 'route') || ''),
  approvedDate: dateOnly(getValue(row, 'approvedDate')),
  approvedAmount: getValue(row, 'approvedAmount') == null ? null : Number(getValue(row, 'approvedAmount')),
  fertilizerType: getValue(row, 'fertilizerType') || '',
  itemType: getValue(row, 'itemType') || '',
  approvedQty: getValue(row, 'approvedQty') == null ? null : Number(getValue(row, 'approvedQty')),
  unit: String(getValue(row, 'unit') || ''),
  issued: Boolean(getValue(row, 'issued')),
  paymentMethod: getValue(row, 'paymentMethod') || '',
  trackingStatus: getValue(row, 'trackingStatus') || '',
  issuedType: normalizeIssuedType(getValue(row, 'issuedType') || fallbackType),
})

const normalizeQueueResponse = (response) => ({
  advance: (getValue(response, 'advances') || []).map(row => normalizeQueueRow(row, 'advance')),
  fertilizer: (getValue(response, 'fertilizers') || []).map(row => normalizeQueueRow(row, 'fertilizer')),
  items: (getValue(response, 'items') || []).map(row => normalizeQueueRow(row, 'items')),
})

const normalizeTrackingRow = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  issuedType: normalizeIssuedType(getValue(row, 'issuedType')),
  requestId: Number(getValue(row, 'requestId') || 0),
  requestNo: String(getValue(row, 'requestNo') || ''),
  regNo: String(getValue(row, 'regNo') || ''),
  supplierName: String(getValue(row, 'supplierName') || ''),
  route: String(getValue(row, 'route') || ''),
  issuedDetails: String(getValue(row, 'issuedDetails') || ''),
  itemName: getValue(row, 'itemName') || '',
  amount: getValue(row, 'amount') == null ? null : Number(getValue(row, 'amount')),
  qty: getValue(row, 'qty') == null ? null : Number(getValue(row, 'qty')),
  unit: String(getValue(row, 'unit') || ''),
  requestDate: dateOnly(getValue(row, 'requestDate')),
  approvedDate: dateOnly(getValue(row, 'approvedDate')),
  issueDate: dateOnly(getValue(row, 'issueDate')),
  method: String(getValue(row, 'method') || ''),
  currentStatus: String(getValue(row, 'currentStatus') || 'awaiting').trim().toLowerCase(),
  completedDate: dateOnly(getValue(row, 'completedDate')),
  completedBy: getValue(row, 'completedBy') || '',
  completedDevice: getValue(row, 'completedDevice') || '',
})

const appendDateFilters = (params, { fromDate = '', toDate = '' } = {}) => {
  if (fromDate) params.set('fromDate', fromDate)
  if (toDate) params.set('toDate', toDate)
}

export const disbursementApi = {
  async getQueue({ route = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()

    if (route && route !== 'all') params.set('route', route)
    appendDateFilters(params, { fromDate, toDate })

    const query = params.toString()
    const response = await adminApiRequest(`/api/Disbursement/queue${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return normalizeQueueResponse(response)
  },

  async issue({ issuedType, requestId, method }) {
    const normalizedType = normalizeIssuedType(issuedType)

    const response = await adminApiRequest(`/api/Disbursement/${normalizedType}/${requestId}/issue`, {
      method: 'POST',
      body: JSON.stringify({
        method,
      }),
    })

    return normalizeTrackingRow(response)
  },

  async getTracking({ issuedType = '', status = '', search = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()
    const normalizedType = normalizeIssuedType(issuedType)

    if (normalizedType && normalizedType !== 'all') params.set('issuedType', normalizedType)
    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    appendDateFilters(params, { fromDate, toDate })

    const query = params.toString()
    const response = await adminApiRequest(`/api/Disbursement/tracking${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return (response || []).map(normalizeTrackingRow)
  },

  async markReceived({ id, completedBy, completedDevice }) {
    const response = await adminApiRequest(`/api/Disbursement/tracking/${id}/received`, {
      method: 'POST',
      body: JSON.stringify({
        completedBy,
        completedDevice,
      }),
    })

    return normalizeTrackingRow(response)
  },
}
