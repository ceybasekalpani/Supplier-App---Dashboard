import { Banknote, Package, Sprout } from 'lucide-react'

export const tabs = [
  { id: 'advance', label: 'Advance Requests', icon: Banknote },
  { id: 'fertilizer', label: 'Fertilizer Requests', icon: Sprout },
  { id: 'items', label: 'Item Requests', icon: Package },
]

export const validTabs = tabs.map(tab => tab.id)
export const validFilters = ['all', 'pending', 'approved', 'rejected']

export const requestActionPermissions = {
  approve: {
    advance: ['cashRequests.approve'],
    fertilizer: ['fertilizerRequests.approve'],
    items: ['itemRequests.approve'],
  },
  reject: {
    advance: ['cashRequests.approve'],
    fertilizer: ['fertilizerRequests.approve'],
    items: ['itemRequests.approve'],
  },
  approveRejected: {
    advance: ['cashRequests.approve'],
    fertilizer: ['fertilizerRequests.approve'],
    items: ['itemRequests.approve'],
  },
  rejectApproved: {
    advance: ['cashRequests.approve'],
    fertilizer: ['fertilizerRequests.approve'],
    items: ['itemRequests.approve'],
  },
}

export const tabActiveClass = {
  advance: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm',
  fertilizer: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm',
  items: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm',
}

export const filterActiveClass = {
  advance: 'bg-amber-50 text-amber-700 border-amber-300',
  fertilizer: 'bg-green-50 text-green-700 border-green-300',
  items: 'bg-teal-50 text-teal-700 border-teal-300',
}

export const selectedRowClass = {
  advance: 'bg-amber-50 dark:bg-amber-900/10',
  fertilizer: 'bg-green-50 dark:bg-green-900/10',
  items: 'bg-teal-50 dark:bg-teal-900/10',
}

export function normalizeTab(value) {
  const tab = String(value || '').trim().toLowerCase()

  if (tab === 'item') return 'items'
  if (validTabs.includes(tab)) return tab

  return 'advance'
}

export function normalizeFilter(value) {
  const filter = String(value || '').trim().toLowerCase()
  return validFilters.includes(filter) ? filter : 'all'
}

export function initials(name = '') {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function currency(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`
}

export function isInDateRange(date, from, to) {
  if (!date) return true
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

export function parseDateParts(dateString) {
  const [year, month, day] = String(dateString || '').split('-').map(Number)
  return { year, month, day }
}

export function formatDateParts(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function addMonthsToYearMonth(year, month, monthsToAdd) {
  const zeroBased = month - 1 + monthsToAdd

  return {
    year: year + Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  }
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export function nextMonthSameDay(dateString) {
  const { year, month, day } = parseDateParts(dateString)

  if (!year || !month || !day) return ''

  const nextMonth = addMonthsToYearMonth(year, month, 1)
  const safeDay = Math.min(day, daysInMonth(nextMonth.year, nextMonth.month))

  return formatDateParts(nextMonth.year, nextMonth.month, safeDay)
}

export function requestLabel(request, tab) {
  if (tab === 'advance') return currency(request.amount)
  return `${request.type || 'Request'} - ${Number(request.qty || 0).toLocaleString()} ${request.unit || ''}`
}

export function summarizeQuantityByType(rows) {
  const totals = rows.reduce((acc, row) => {
    const key = `${row.type || 'Item'}__${row.unit || 'units'}`

    if (!acc[key]) {
      acc[key] = {
        type: row.type || 'Item',
        unit: row.unit || 'units',
        qty: 0,
      }
    }

    acc[key].qty += Number(row.qty || 0)

    return acc
  }, {})

  return Object.values(totals)
}

const requestReportLabels = {
  advance: 'Advance Requests',
  fertilizer: 'Fertilizer Requests',
  items: 'Item Requests',
}

export function buildRequestsReport(rows, tab, { filter, fromDate, toDate, search }) {
  const label = requestReportLabels[tab] || 'Requests'
  const isAdvance = tab === 'advance'
  const approvedCount = rows.filter(row => row.status === 'approved').length
  const pendingCount = rows.filter(row => row.status === 'pending').length
  const rejectedCount = rows.filter(row => row.status === 'rejected').length
  const supplierCount = new Set(rows.map(row => row.regNo)).size
  const totalAmount = isAdvance
    ? rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    : 0
  const quantityBreakdown = isAdvance ? [] : summarizeQuantityByType(rows)
  const totalQuantity = quantityBreakdown.reduce((sum, item) => sum + Number(item.qty || 0), 0)

  return {
    filename: `${tab}-requests-report`,
    title: `${label} Report`,
    subtitle: `Status: ${filter === 'all' ? 'All' : filter} | Date range: ${fromDate || 'Any'} to ${toDate || 'Any'}${search ? ` | Search: ${search}` : ''}`,
    rows,
    summary: [],
    totals: [
      { label: 'Supplier Count', value: supplierCount },
      { label: 'Approved Count', value: approvedCount },
      { label: 'Pending Count', value: pendingCount },
      { label: 'Rejected Count', value: rejectedCount },
      { label: isAdvance ? 'Total Advance Amount' : 'Total Quantity', value: isAdvance ? currency(totalAmount) : totalQuantity.toLocaleString() },
      ...(isAdvance ? [] : quantityBreakdown.map(item => ({
        label: `Total ${item.type} Quantity`,
        value: `${item.qty.toLocaleString()} ${item.unit}`.trim(),
      }))),
    ],
    columns: isAdvance
      ? [
          { label: 'Request No', value: row => row.requestNo || row.id, width: 0.95 },
          { label: 'Reg No', value: 'regNo', width: 0.78 },
          { label: 'Supplier', value: row => row.name || '-', width: 1.6 },
          { label: 'Amount', value: row => currency(row.amount), width: 1 },
          { label: 'Date', value: 'date', width: 0.9 },
          { label: 'Status', value: 'status', width: 0.8 },
          { label: 'Remarks', value: row => row.remarks || '-', width: 1.4 },
          { label: 'Checked By', value: row => row.checkedBy || '-', width: 1 },
        ]
      : [
          { label: 'Request No', value: row => row.requestNo || row.id, width: 0.95 },
          { label: 'Reg No', value: 'regNo', width: 0.78 },
          { label: 'Supplier', value: row => row.name || '-', width: 1.5 },
          { label: 'Type', value: row => row.type || '-', width: 1.1 },
          { label: 'Quantity', value: row => `${Number(row.qty || 0).toLocaleString()} ${row.unit || ''}`.trim(), width: 1 },
          { label: 'Date', value: 'date', width: 0.9 },
          { label: 'Status', value: 'status', width: 0.8 },
          { label: 'Remarks', value: row => row.remarks || '-', width: 1.3 },
          { label: 'Checked By', value: row => row.checkedBy || '-', width: 1 },
        ],
  }
}
