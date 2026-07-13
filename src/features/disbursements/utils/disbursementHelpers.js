import { Banknote, Package, Sprout } from 'lucide-react'

export const typeConfig = {
  advance: { label: 'Advance', icon: Banknote, tone: 'amber' },
  fertilizer: { label: 'Fertilizer', icon: Sprout, tone: 'emerald' },
  items: { label: 'Item', icon: Package, tone: 'teal' },
}

export const paymentOptions = [
  { value: '', label: 'Select Method' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Account Transfer', label: 'Account Transfer' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
]

export const formatDisplayDate = (date) => {
  if (!date) return 'Not set'
  return new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

export const formatQuantity = (value, unit) => `${Number(value || 0).toLocaleString()} ${unit || ''}`.trim()

export const rowKey = (type, id) => `${type}-${id}`

export const getAdvanceMethod = (row, paymentMethods) => (
  Object.prototype.hasOwnProperty.call(paymentMethods, row.id)
    ? paymentMethods[row.id]
    : row.paymentMethod || ''
)

export const isPhysicalAdvance = (row, paymentMethods) => (
  row.issuedType === 'advance' && getAdvanceMethod(row, paymentMethods) === 'Cash'
)

export const isDeliveryNoteEligible = (row, paymentMethods) => (
  row.issuedType === 'fertilizer' || row.issuedType === 'items' || isPhysicalAdvance(row, paymentMethods)
)

export const isNonCashAdvanceMethod = (method) => ['Account Transfer', 'Bank Transfer', 'Cheque'].includes(method)

export const getRowLabel = (row) => {
  if (row.issuedType === 'advance') return 'Advance'
  if (row.issuedType === 'fertilizer') return row.fertilizerType || 'Fertilizer'
  return row.itemType || 'Item'
}

export const getRowValue = (row) => {
  if (row.issuedType === 'advance') return formatCurrency(row.approvedAmount)
  return formatQuantity(row.approvedQty, row.unit)
}

export const getReportPaymentMethod = (row, paymentMethods) => {
  if (row.issuedType !== 'advance') return 'Physical Delivery'
  return getAdvanceMethod(row, paymentMethods) || 'Not Selected'
}

export const getManagementStatus = (row) => {
  const trackingStatus = String(row.trackingStatus || '').trim().toLowerCase()
  if (trackingStatus === 'issued') return 'dispatched'
  if (trackingStatus) return trackingStatus
  return row.issued ? 'dispatched' : 'approved'
}

export const matchesStatusFilter = (row, statusFilter) => (
  !statusFilter || statusFilter === 'all' || getManagementStatus(row) === statusFilter
)
