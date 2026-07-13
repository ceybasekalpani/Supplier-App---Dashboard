import { Banknote, Package, Sprout } from 'lucide-react'
import { adminAuthStorage } from '../../../services/adminApiClient'

export const typeStyles = {
  advance: {
    label: 'Advance',
    icon: Banknote,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  fertilizer: {
    label: 'Fertilizer',
    icon: Sprout,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  items: {
    label: 'Item',
    icon: Package,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  },
}

export const normalizeText = (value) => String(value || '').trim().toLowerCase()

export const normalizeId = (value) => (
  value === undefined || value === null ? '' : String(value).trim()
)

export const getRequestId = (item = {}) => normalizeId(
  item.requestId
  || item.requestID
  || item.disbursementRequestId
  || item.disbursementRequestID
  || item.sourceRequestId
)

export const getDeliveryNoteId = (item = {}) => normalizeId(
  item.deliveryNoteId
  || item.deliveryNoteID
  || item.deliveryNote?.id
  || item.deliveryNoteNo
  || item.deliveryNoteNumber
)

export const getExplicitTrackingId = (item = {}) => normalizeId(
  item.trackingId
  || item.trackingID
  || item.disbursementRecordId
  || item.disbursementRecordID
  || item.disbursementTrackingId
  || item.disbursementTrackingID
  || item.trackingRecordId
  || item.trackingRecordID
)

export const getDeliveryDetailId = (item = {}) => normalizeId(
  item.deliveryNoteDetailId
  || item.deliveryNoteDetailID
  || item.detailId
  || item.detailID
  || item.id
)

export const getTrackingId = (item = {}) => normalizeId(
  getExplicitTrackingId(item)
  || item.id
)

export const normalizeDisbursementType = (value) => {
  const type = String(value || '').trim().toLowerCase()

  if (type.includes('advance')) return 'advance'
  if (type.includes('fertilizer') || type.includes('fertiliser')) return 'fertilizer'
  if (type === 'item' || type === 'items' || type.includes('item')) return 'items'
  return 'items'
}

export const isKnownDisbursementType = (value) => {
  const type = String(value || '').trim().toLowerCase()
  return ['advance', 'fertilizer', 'fertilizers', 'fertiliser', 'fertilisers', 'item', 'items'].includes(type)
}

export const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent || ''
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown platform'
  const browser = (() => {
    if (/Edg\//.test(ua)) return 'Microsoft Edge'
    if (/Chrome\//.test(ua)) return 'Chrome'
    if (/Firefox\//.test(ua)) return 'Firefox'
    if (/Safari\//.test(ua)) return 'Safari'
    return 'Unknown browser'
  })()

  return `${platform} - ${browser}`
}

export const getCompletedUser = () => {
  if (typeof window === 'undefined') return 'Unknown user'

  const admin = adminAuthStorage.getUser()
  const value = admin?.fullName
    || admin?.name
    || admin?.displayName
    || admin?.username
    || admin?.userName
    || admin?.email
    || (admin?.id ? `Admin #${admin.id}` : '')

  return String(value || '').trim() || 'Unknown user'
}

const pickPersonName = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value

  return value.name
    || value.fullName
    || value.displayName
    || value.userName
    || value.username
    || value.email
    || ''
}

export const getApprovedBy = (...items) => {
  for (const item of items.filter(Boolean)) {
    const value = item.checkedBy
      || item.CheckedBy
      || item.checkedByName
      || item.CheckedByName
      || item.checkedByUserName
      || item.CheckedByUserName
      || pickPersonName(item.checkedByUser)
      || pickPersonName(item.CheckedByUser)
      || pickPersonName(item.approvedBy)
      || pickPersonName(item.ApprovedBy)
      || item.approvedByName
      || item.ApprovedByName
      || item.approvedByFullName
      || item.ApprovedByFullName
      || item.approvedByUserName
      || item.ApprovedByUserName
      || item.approvedUserName
      || item.ApprovedUserName
      || pickPersonName(item.approvedUser)
      || pickPersonName(item.ApprovedUser)
      || pickPersonName(item.approvedByUser)
      || pickPersonName(item.ApprovedByUser)
      || item.requestApprovedBy
      || item.requestApprovedByName
      || item.requestApprovedUserName
      || pickPersonName(item.requestApprovedUser)
      || item.approvalBy
      || item.approvalByName
      || item.approvalUserName
      || pickPersonName(item.approvalUser)
      || item.approverName
      || item.approvedName
      || item.reviewedBy
      || item.reviewedByName
      || item.authorizedBy
      || item.authorizedByName
      || item.actionBy
      || item.updatedBy

    const textValue = String(value || '').trim()
    if (textValue && textValue !== '-') return value
  }

  return '-'
}

export const getRequestApprovedBy = (request) => {
  if (!request) return ''
  const value = request.checkedBy
    || request.CheckedBy
    || request.approvedBy
    || request.ApprovedBy
    || request.checkedByName
    || request.approvedByName
    || ''
  const textValue = String(value || '').trim()
  return textValue && textValue !== '-' ? textValue : ''
}

export const getSupplierName = (item) => item.supplierName || item.supplier || item.name || '-'

export const getRegNo = (item) => item.regNo || item.supplierRegNo || item.registrationNo || '-'

export const getRouteName = (item) => item.route || item.routeName || '-'

export const getDeliveryNoteNo = (item = {}) => normalizeId(
  item.deliveryNoteNo
  || item.deliveryNoteNumber
  || item.deliveryNote?.deliveryNoteNo
)

export const getReceiptStatus = (status) => String(status || '').toLowerCase() === 'completed' ? 'completed' : 'awaiting'

export const normalizeTrackingStatus = (status) => {
  const value = String(status || '').trim().toLowerCase()
  if (value === 'issued') return 'dispatched'
  return value || 'awaiting'
}

export const matchesStatusFilter = (row = {}, statusFilter = 'all') => {
  if (!statusFilter || statusFilter === 'all') return true

  const status = normalizeTrackingStatus(row.currentStatus || row.status)

  return status === statusFilter
}

export const normalizePaymentMethod = (value) => {
  const text = String(value || '').trim().toLowerCase()

  if (!text) return ''
  if (text.includes('cash')) return 'cash'
  if (text.includes('cheque') || text.includes('check')) return 'cheque'
  if (text.includes('account')) return 'account-transfer'
  if (text.includes('bank')) return 'bank-transfer'
  return text.replace(/\s+/g, '-')
}

export const paymentMethodLabels = {
  cash: 'Cash',
  cheque: 'Cheque',
  'account-transfer': 'Account Transfer',
  'bank-transfer': 'Bank Transfer',
}

export const getPaymentMethod = (row = {}) => row.paymentType || row.method || row.paymentMethod || '-'

export const getDisplayStatus = (status) => normalizeTrackingStatus(status)

export const getReceiptRowKey = (row = {}) => [
  row.trackingId || getTrackingId(row),
  row.deliveryNoteDetailId || getDeliveryDetailId(row),
  row.requestId || getRequestId(row),
  row.deliveryNoteNo || getDeliveryNoteNo(row),
  row.issuedType,
  normalizeText(row.categoryName),
  normalizeText(row.regNo),
].filter(Boolean).join('|')
