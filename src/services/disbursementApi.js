import { env } from '../config/env'
import {
  approvedAdvances,
  approvedFertilizers,
  approvedItems,
  disbursementTrackingRows,
} from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

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

const buildMockQueue = ({ route = '', fromDate = '', toDate = '' } = {}) => {
  const filterRows = rows => rows
    .filter(row => !route || route === 'all' || String(row.route || '') === route)
    .filter(row => {
      const rowDate = String(row.approvedDate || '').slice(0, 10)
      if (fromDate && rowDate < fromDate) return false
      if (toDate && rowDate > toDate) return false
      return true
    })

  return {
    advance: filterRows(approvedAdvances).map(row => normalizeQueueRow(row, 'advance')),
    fertilizer: filterRows(approvedFertilizers).map(row => normalizeQueueRow(row, 'fertilizer')),
    items: filterRows(approvedItems).map(row => normalizeQueueRow(row, 'items')),
  }
}

const buildMockDeliveryNotes = () => ([
  {
    id: 1,
    deliveryNoteNo: 'DN-LOCAL-0001',
    dispatchDate: '2026-06-23T09:30:00',
    borrowerName: 'Local Driver',
    borrowerRole: 'Driver',
    vehicleNo: 'LOCAL-001',
    routeName: 'Route A - Kandy',
    status: 'issued',
    totalRecords: 3,
    printUrl: '',
  },
])

const withMockFallback = async (request, mockFactory) => {
  if (!shouldUseApi()) return mockFactory()

  try {
    return await request()
  } catch (error) {
    if (error.name === 'AbortError' || !env.enableMockData) throw error
    return mockFactory()
  }
}

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
  deliveryNoteId: getValue(row, 'deliveryNoteId') == null ? null : Number(getValue(row, 'deliveryNoteId')),
  deliveryNoteNo: getValue(row, 'deliveryNoteNo') || '',
  dispatchedAt: dateOnly(getValue(row, 'dispatchedAt')),
})

const normalizeDeliveryNoteDetail = (row) => ({
  id: Number(getValue(row, 'id') || 0),
  supplierRegNo: String(getValue(row, 'supplierRegNo') || ''),
  supplierName: String(getValue(row, 'supplierName') || ''),
  routeName: String(getValue(row, 'routeName') || ''),
  disbursementRecordId: Number(getValue(row, 'disbursementRecordId') || 0),
  requestId: Number(getValue(row, 'requestId') || 0),
  itemType: normalizeIssuedType(getValue(row, 'itemType')),
  amount: getValue(row, 'amount') == null ? null : Number(getValue(row, 'amount')),
  quantity: getValue(row, 'quantity') == null ? null : Number(getValue(row, 'quantity')),
  unit: getValue(row, 'unit') || '',
  paymentType: getValue(row, 'paymentType') || '',
  status: String(getValue(row, 'status') || '').trim().toLowerCase(),
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
  completedAt: getValue(row, 'completedAt') || '',
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
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/queue${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return normalizeQueueResponse(response)
      },
      () => buildMockQueue({ route, fromDate, toDate })
    )
  },

  async issue({ issuedType, requestId, method }) {
    const normalizedType = normalizeIssuedType(issuedType)

    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/${normalizedType}/${requestId}/issue`, {
          method: 'POST',
          body: JSON.stringify({
            method,
          }),
        })

        return normalizeTrackingRow(response)
      },
      () => normalizeTrackingRow({
        id: Date.now(),
        issuedType: normalizedType,
        requestId,
        requestNo: `LOCAL-${requestId}`,
        regNo: '',
        supplierName: 'Local Supplier',
        issuedDetails: method || 'Issued',
        issueDate: new Date().toISOString(),
        method,
        currentStatus: method === 'Bank Transfer' ? 'completed' : 'awaiting',
      })
    )
  },

  async getTracking({ issuedType = '', status = '', search = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()
    const normalizedType = normalizeIssuedType(issuedType)

    if (normalizedType && normalizedType !== 'all') params.set('issuedType', normalizedType)
    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    appendDateFilters(params, { fromDate, toDate })

    const query = params.toString()
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/tracking${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return (response || []).map(normalizeTrackingRow)
      },
      () => disbursementTrackingRows
        .map(normalizeTrackingRow)
        .filter(row => !normalizedType || normalizedType === 'all' || row.issuedType === normalizedType)
        .filter(row => !status || status === 'all' || row.currentStatus === status)
        .filter(row => {
          const term = search.trim().toLowerCase()
          return !term ||
            row.supplierName.toLowerCase().includes(term) ||
            row.regNo.toLowerCase().includes(term) ||
            row.issuedDetails.toLowerCase().includes(term)
        })
        .filter(row => {
          if (fromDate && row.issueDate < fromDate) return false
          if (toDate && row.issueDate > toDate) return false
          return true
        })
    )
  },

  async markReceived({ id, completedBy, completedDevice }) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/tracking/${id}/received`, {
          method: 'POST',
          body: JSON.stringify({
            completedBy,
            completedDevice,
          }),
        })

        return normalizeTrackingRow(response)
      },
      () => normalizeTrackingRow({
        ...(disbursementTrackingRows.find(row => Number(row.id) === Number(id)) || { id }),
        currentStatus: 'completed',
        completedDate: new Date().toISOString(),
        completedBy,
        completedDevice,
      })
    )
  },

  async generateDeliveryNote({ records, borrowerName, borrowerRole, vehicleNo = '', routeName = '', remarks = '' }) {
    return withMockFallback(
      async () => {
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
      () => normalizeDeliveryNote({
        id: Date.now(),
        deliveryNoteNo: `DN-LOCAL-${String(records.length).padStart(4, '0')}`,
        dispatchDate: new Date().toISOString(),
        borrowerName,
        borrowerRole,
        vehicleNo,
        routeName,
        remarks,
        status: 'issued',
        totalRecords: records.length,
      })
    )
  },

  async getDeliveryNotes({ status = '', search = '', fromDate = '', toDate = '', signal } = {}) {
    const params = new URLSearchParams()

    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    appendDateFilters(params, { fromDate, toDate })

    const query = params.toString()
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/delivery-notes${query ? `?${query}` : ''}`, {
          method: 'GET',
          signal,
        })

        return (response || []).map(normalizeDeliveryNoteTracking)
      },
      () => buildMockDeliveryNotes().map(normalizeDeliveryNoteTracking)
    )
  },

  async getDeliveryNote(id) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/delivery-notes/${id}`, {
          method: 'GET',
        })

        return normalizeDeliveryNote(response)
      },
      () => normalizeDeliveryNote({
        ...buildMockDeliveryNotes()[0],
        id,
        details: disbursementTrackingRows.slice(0, 3).map(row => ({
          id: row.id,
          supplierRegNo: row.regNo,
          supplierName: row.supplierName,
          routeName: row.route,
          disbursementRecordId: row.id,
          requestId: row.requestId || row.id,
          itemType: row.issuedType,
          amount: row.amount,
          quantity: row.qty,
          unit: row.unit,
          paymentType: row.method,
          status: 'dispatched',
        })),
      })
    )
  },

  async getDeliveryNotePrintHtml(id) {
    return withMockFallback(
      () => adminApiRequest(`/api/Disbursement/delivery-notes/${id}/print`, {
        method: 'GET',
      }),
      () => '<html><body><h1>Local Delivery Note Preview</h1><p>Backend API is offline.</p></body></html>'
    )
  },

  async markDeliveryNoteReturned({ id, remarks = '' }) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/delivery-notes/${id}/returned`, {
          method: 'POST',
          body: JSON.stringify({ remarks }),
        })

        return normalizeDeliveryNote(response)
      },
      () => normalizeDeliveryNote({
        ...buildMockDeliveryNotes()[0],
        id,
        status: 'returned',
        remarks,
      })
    )
  },

  async markDeliveryNoteCompleted({ id, remarks = '' }) {
    return withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/Disbursement/delivery-notes/${id}/completed`, {
          method: 'POST',
          body: JSON.stringify({ remarks }),
        })

        return normalizeDeliveryNote(response)
      },
      () => normalizeDeliveryNote({
        ...buildMockDeliveryNotes()[0],
        id,
        status: 'completed',
        completedAt: new Date().toISOString(),
        remarks,
      })
    )
  },
}
