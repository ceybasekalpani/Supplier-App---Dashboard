import { adminApiRequest } from './adminApiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeIssuedType = (issuedType) => {
  const value = String(issuedType || '').trim().toLowerCase()

  if (value.includes('advance')) return 'advance'
  if (value.includes('fertilizer') || value.includes('fertiliser')) return 'fertilizer'
  if (value === 'item' || value === 'items' || value.includes('item')) return 'items'

  return value
}

const normalizePaymentMethod = (method) => {
  const value = String(method || '').trim()
  const lowerValue = value.toLowerCase()

  if (!value) return ''
  if (lowerValue.includes('cash')) return 'Cash'
  if (lowerValue.includes('cheque') || lowerValue.includes('check')) return 'Cheque'
  if (lowerValue.includes('account')) return 'Account Transfer'
  if (lowerValue.includes('bank')) return 'Bank Transfer'

  return value
}

const isKnownIssuedType = (value) => ['advance', 'fertilizer', 'fertilizers', 'fertiliser', 'fertilisers', 'item', 'items'].includes(String(value || '').trim().toLowerCase())

const fertilizerNameHints = ['urea', 'compost', 'potash', 'tsp', 'mop', 'npk', 'dolomite', 'phosphate', 'fertilizer', 'fertiliser']

const looksLikeFertilizerName = (value) => {
  const text = String(value || '').trim().toLowerCase()
  return fertilizerNameHints.some(hint => text.includes(hint))
}

const inferIssuedType = (row, fallbackType = '') => {
  const issuedType = getValue(row, 'issuedType') || getValue(row, 'disbursementType')
  const genericType = getValue(row, 'type')
  const itemType = getValue(row, 'itemType')

  if (issuedType) return normalizeIssuedType(issuedType)
  if (isKnownIssuedType(genericType)) return normalizeIssuedType(genericType)
  if (isKnownIssuedType(itemType)) return normalizeIssuedType(itemType)
  if (getValue(row, 'fertilizerType') || getValue(row, 'fertilizerName')) return 'fertilizer'
  if (looksLikeFertilizerName(itemType) || looksLikeFertilizerName(genericType) || looksLikeFertilizerName(getValue(row, 'itemName'))) return 'fertilizer'
  if (getValue(row, 'itemName') || itemType || getValue(row, 'itemTypeName')) return 'items'

  return normalizeIssuedType(fallbackType)
}

const dateOnly = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const dateTime = (value) => value ? String(value) : ''

const normalizeQueueRow = (row, fallbackType = '') => {
  const issuedType = normalizeIssuedType(getValue(row, 'issuedType') || fallbackType)

  return {
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
    paymentMethod: issuedType === 'advance'
      ? normalizePaymentMethod(
          getValue(row, 'paymentMethod')
          || getValue(row, 'payMode', 'PayMode')
          || getValue(row, 'payment')
        )
      : 'Physical Delivery',
    trackingStatus: getValue(row, 'trackingStatus') || '',
    trackingId: getValue(row, 'trackingId') || getValue(row, 'disbursementRecordId') || getValue(row, 'disbursementTrackingId') || null,
    issuedType,
  }
}

const normalizeQueueResponse = (response) => ({
  advance: (getValue(response, 'advances') || []).map(row => normalizeQueueRow(row, 'advance')),
  fertilizer: (getValue(response, 'fertilizers') || []).map(row => normalizeQueueRow(row, 'fertilizer')),
  items: (getValue(response, 'items') || []).map(row => normalizeQueueRow(row, 'items')),
})

const normalizeTrackingRow = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  issuedType: inferIssuedType(row),
  requestId: Number(getValue(row, 'requestId') || 0),
  requestNo: String(getValue(row, 'requestNo') || ''),
  regNo: String(getValue(row, 'regNo') || ''),
  supplierName: String(getValue(row, 'supplierName') || ''),
  route: String(getValue(row, 'route') || ''),
  issuedDetails: String(getValue(row, 'issuedDetails') || ''),
  itemName: getValue(row, 'itemName') || getValue(row, 'fertilizerType') || getValue(row, 'fertilizerName') || getValue(row, 'itemTypeName') || (!isKnownIssuedType(getValue(row, 'itemType')) ? getValue(row, 'itemType') : '') || (!isKnownIssuedType(getValue(row, 'type')) ? getValue(row, 'type') : '') || '',
  fertilizerType: getValue(row, 'fertilizerType') || getValue(row, 'fertilizerName') || '',
  itemType: getValue(row, 'itemType') || getValue(row, 'itemTypeName') || '',
  amount: getValue(row, 'amount') == null ? null : Number(getValue(row, 'amount')),
  qty: getValue(row, 'qty') == null ? null : Number(getValue(row, 'qty')),
  unit: String(getValue(row, 'unit') || ''),
  requestDate: dateOnly(getValue(row, 'requestDate')),
  approvedDate: dateOnly(getValue(row, 'approvedDate')),
  approvedBy: getValue(row, 'approvedBy') || getValue(row, 'checkedBy') || getValue(row, 'reviewedBy') || '',
  approvedByName: getValue(row, 'approvedByName') || getValue(row, 'checkedByName') || getValue(row, 'reviewedByName') || '',
  approvedByUserName: getValue(row, 'approvedByUserName') || getValue(row, 'approvedUserName') || getValue(row, 'checkedByUserName') || '',
  checkedBy: getValue(row, 'checkedBy') || getValue(row, 'approvedBy') || '',
  checkedByName: getValue(row, 'checkedByName') || getValue(row, 'approvedByName') || '',
  checkedByUserName: getValue(row, 'checkedByUserName') || getValue(row, 'approvedByUserName') || getValue(row, 'approvedUserName') || '',
  issueDate: dateTime(getValue(row, 'issueDate')),
  method: String(getValue(row, 'method') || ''),
  currentStatus: String(getValue(row, 'currentStatus') || 'awaiting').trim().toLowerCase(),
  completedDate: dateTime(getValue(row, 'completedDate')),
  completedBy: getValue(row, 'completedBy') || '',
  completedDevice: getValue(row, 'completedDevice') || '',
  deliveryNoteId: getValue(row, 'deliveryNoteId') == null ? null : Number(getValue(row, 'deliveryNoteId')),
  deliveryNoteNo: getValue(row, 'deliveryNoteNo') || '',
  dispatchedAt: dateTime(getValue(row, 'dispatchedAt') || getValue(row, 'dispatchDate')),
})

const normalizeDeliveryNoteDetail = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  requestNo: String(getValue(row, 'requestNo') || ''),
  supplierRegNo: String(getValue(row, 'supplierRegNo') || ''),
  supplierName: String(getValue(row, 'supplierName') || ''),
  routeName: String(getValue(row, 'routeName') || ''),
  disbursementRecordId: Number(getValue(row, 'disbursementRecordId') || getValue(row, 'trackingId') || getValue(row, 'trackingRecordId') || getValue(row, 'disbursementTrackingId') || 0),
  requestId: Number(getValue(row, 'requestId') || 0),
  issuedType: inferIssuedType(row),
  issuedDetails: String(getValue(row, 'issuedDetails') || ''),
  itemName: getValue(row, 'itemName') || getValue(row, 'fertilizerType') || getValue(row, 'fertilizerName') || getValue(row, 'itemTypeName') || (!isKnownIssuedType(getValue(row, 'itemType')) ? getValue(row, 'itemType') : '') || (!isKnownIssuedType(getValue(row, 'type')) ? getValue(row, 'type') : '') || '',
  fertilizerType: getValue(row, 'fertilizerType') || getValue(row, 'fertilizerName') || '',
  itemType: getValue(row, 'itemType') || getValue(row, 'itemTypeName') || '',
  amount: getValue(row, 'amount') == null ? null : Number(getValue(row, 'amount')),
  quantity: getValue(row, 'quantity') == null ? null : Number(getValue(row, 'quantity')),
  unit: getValue(row, 'unit') || '',
  paymentType: getValue(row, 'paymentType') || '',
  approvedBy: getValue(row, 'approvedBy') || getValue(row, 'checkedBy') || getValue(row, 'reviewedBy') || '',
  approvedByName: getValue(row, 'approvedByName') || getValue(row, 'checkedByName') || getValue(row, 'reviewedByName') || '',
  approvedByUserName: getValue(row, 'approvedByUserName') || getValue(row, 'approvedUserName') || getValue(row, 'checkedByUserName') || '',
  checkedBy: getValue(row, 'checkedBy') || getValue(row, 'approvedBy') || '',
  checkedByName: getValue(row, 'checkedByName') || getValue(row, 'approvedByName') || '',
  checkedByUserName: getValue(row, 'checkedByUserName') || getValue(row, 'approvedByUserName') || getValue(row, 'approvedUserName') || '',
  issueDate: dateTime(getValue(row, 'issueDate') || getValue(row, 'issueAt')),
  dispatchedAt: dateTime(getValue(row, 'dispatchedAt') || getValue(row, 'dispatchDate')),
  currentStatus: String(getValue(row, 'currentStatus') || '').trim().toLowerCase(),
  status: String(getValue(row, 'status') || '').trim().toLowerCase(),
  completedDate: dateTime(getValue(row, 'completedDate') || getValue(row, 'completedAt')),
  completedBy: getValue(row, 'completedBy') || '',
  completedDevice: getValue(row, 'completedDevice') || '',
  supplierSignatureReceived: Boolean(getValue(row, 'supplierSignatureReceived')),
  remarks: getValue(row, 'remarks') || '',
})

const normalizeDeliveryNote = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  deliveryNoteNo: String(getValue(row, 'deliveryNoteNo') || ''),
  dispatchDate: String(getValue(row, 'dispatchDate') || ''),
  borrowerName: String(getValue(row, 'borrowerName') || ''),
  borrowerRole: String(getValue(row, 'borrowerRole') || ''),
  vehicleNo: getValue(row, 'vehicleNo') || '',
  routeName: getValue(row, 'routeName') || '',
  status: String(getValue(row, 'status') || '').trim().toLowerCase(),
  createdBy: getValue(row, 'createdBy') == null ? null : Number(getValue(row, 'createdBy')),
  createdAt: String(getValue(row, 'createdAt') || ''),
  completedAt: getValue(row, 'completedAt') || getValue(row, 'completedDate') || '',
  completedDate: getValue(row, 'completedDate') || getValue(row, 'completedAt') || '',
  completedBy: getValue(row, 'completedBy') || '',
  completedDevice: getValue(row, 'completedDevice') || '',
  remarks: getValue(row, 'remarks') || '',
  totalRecords: Number(getValue(row, 'totalRecords') || 0),
  totalAmount: Number(getValue(row, 'totalAmount') || 0),
  totalQuantity: Number(getValue(row, 'totalQuantity') || 0),
  printUrl: String(getValue(row, 'printUrl') || ''),
  details: (getValue(row, 'details') || []).map(normalizeDeliveryNoteDetail),
})

const normalizeDeliveryNoteTracking = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  deliveryNoteNo: String(getValue(row, 'deliveryNoteNo') || ''),
  dispatchDate: String(getValue(row, 'dispatchDate') || ''),
  borrowerName: String(getValue(row, 'borrowerName') || ''),
  borrowerRole: String(getValue(row, 'borrowerRole') || ''),
  vehicleNo: getValue(row, 'vehicleNo') || '',
  routeName: getValue(row, 'routeName') || '',
  status: String(getValue(row, 'status') || '').trim().toLowerCase(),
  totalRecords: Number(getValue(row, 'totalRecords') || 0),
  printUrl: String(getValue(row, 'printUrl') || ''),
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

  async generateDeliveryNote({ records, borrowerName, borrowerRole, vehicleNo = '', routeName = '', remarks = '' }) {
    const response = await adminApiRequest('/api/Disbursement/delivery-notes', {
      method: 'POST',
      body: JSON.stringify({
        records: records.map(record => ({
          issuedType: normalizeIssuedType(record.issuedType),
          requestId: Number(record.requestId),
          method: record.method || null,
        })),
        borrowerName,
        borrowerRole,
        vehicleNo,
        routeName,
        remarks,
      }),
    })

    return normalizeDeliveryNote(response)
  },

  async getDeliveryNotes({ status = '', search = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()

    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    appendDateFilters(params, { fromDate, toDate })

    const query = params.toString()
    const response = await adminApiRequest(`/api/Disbursement/delivery-notes${query ? `?${query}` : ''}`, {
      method: 'GET',
      signal,
    })

    return (response || []).map(normalizeDeliveryNoteTracking)
  },

  async getDeliveryNote(id) {
    const response = await adminApiRequest(`/api/Disbursement/delivery-notes/${id}`, {
      method: 'GET',
    })

    return normalizeDeliveryNote(response)
  },

  async getDeliveryNotePrintHtml(id) {
    return adminApiRequest(`/api/Disbursement/delivery-notes/${id}/print`, {
      method: 'GET',
    })
  },

  async markDeliveryNoteReturned({ id, remarks = '' }) {
    const response = await adminApiRequest(`/api/Disbursement/delivery-notes/${id}/returned`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    })

    return normalizeDeliveryNote(response)
  },

  async markDeliveryNoteCompleted({ id, remarks = '', completedBy = '', completedDevice = '' }) {
    const response = await adminApiRequest(`/api/Disbursement/delivery-notes/${id}/completed`, {
      method: 'POST',
      body: JSON.stringify({
        remarks,
        completedBy,
        completedDevice,
      }),
    })

    return normalizeDeliveryNote(response)
  },
}
