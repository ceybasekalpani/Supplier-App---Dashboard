import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Check,
  X,
  Eye,
  Inbox,
  Info,
  User,
  Landmark,
  TreePine,
  Leaf,
  Pencil,
  WalletCards,
  Banknote,
  Sprout,
  Package,
  RefreshCw,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  suppliers as mockSuppliers,
  leafDeliveries,
  leafRates,
} from '../data/mockData'
import StatusBadge, { getStatusChartColor } from '../components/ui/StatusBadge'
import { dashboardRequestsApi } from '../services/dashboardRequestsApi'
import { supplierDashboardApi } from '../services/supplierDashboardApi'
import { adminAuthStorage } from '../services/adminApiClient'
import { hasAdminPermission, hasExplicitAdminPermission } from '../services/adminPermissions'
import { dashboardPermissionsApi } from '../services/dashboardPermissionsApi'

const tabs = [
  { id: 'advance', label: 'Advance Requests', icon: Banknote },
  { id: 'fertilizer', label: 'Fertilizer Requests', icon: Sprout },
  { id: 'items', label: 'Item Requests', icon: Package },
]

const validTabs = tabs.map(tab => tab.id)
const validFilters = ['all', 'pending', 'approved', 'rejected']

const requestActionPermissions = {
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

const tabActiveClass = {
  advance: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm',
  fertilizer: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm',
  items: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm',
}

const filterActiveClass = {
  advance: 'bg-amber-50 text-amber-700 border-amber-300',
  fertilizer: 'bg-green-50 text-green-700 border-green-300',
  items: 'bg-teal-50 text-teal-700 border-teal-300',
}

const selectedRowClass = {
  advance: 'bg-amber-50 dark:bg-amber-900/10',
  fertilizer: 'bg-green-50 dark:bg-green-900/10',
  items: 'bg-teal-50 dark:bg-teal-900/10',
}

function normalizeTab(value) {
  const tab = String(value || '').trim().toLowerCase()

  if (tab === 'item') return 'items'
  if (validTabs.includes(tab)) return tab

  return 'advance'
}

function normalizeFilter(value) {
  const filter = String(value || '').trim().toLowerCase()
  return validFilters.includes(filter) ? filter : 'all'
}

function initials(name = '') {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Avatar({ name, size = 'md' }) {
  const classes = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'

  return (
    <div className={`${classes} rounded-full bg-green-100 flex items-center justify-center font-semibold text-green-700 shrink-0`}>
      {initials(name)}
    </div>
  )
}

function currency(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`
}

function isInDateRange(date, from, to) {
  if (!date) return true
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

function parseDateParts(dateString) {
  const [year, month, day] = String(dateString || '').split('-').map(Number)
  return { year, month, day }
}

function formatDateParts(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addMonthsToYearMonth(year, month, monthsToAdd) {
  const zeroBased = month - 1 + monthsToAdd

  return {
    year: year + Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  }
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function monthEnd(dateString) {
  const { year, month } = parseDateParts(dateString)

  if (!year || !month) return ''

  return formatDateParts(year, month, daysInMonth(year, month))
}

function nextMonthStart(dateString) {
  const { year, month } = parseDateParts(dateString)

  if (!year || !month) return ''

  const nextMonth = addMonthsToYearMonth(year, month, 1)
  return formatDateParts(nextMonth.year, nextMonth.month, 1)
}

function nextMonthSameDay(dateString) {
  const { year, month, day } = parseDateParts(dateString)

  if (!year || !month || !day) return ''

  const nextMonth = addMonthsToYearMonth(year, month, 1)
  const safeDay = Math.min(day, daysInMonth(nextMonth.year, nextMonth.month))

  return formatDateParts(nextMonth.year, nextMonth.month, safeDay)
}

function monthKey(date) {
  return String(date || '').slice(0, 7)
}

function rateFor(date) {
  return leafRates.find(rate => rate.month === monthKey(date)) || {
    superRate: 0,
    normalRate: 0,
  }
}

function summarizeRows(rows) {
  return rows.reduce((acc, row) => ({
    superNet: acc.superNet + Number(row.superNet || 0),
    normalNet: acc.normalNet + Number(row.normalNet || 0),
    total: acc.total + Number(row.total || 0),
  }), {
    superNet: 0,
    normalNet: 0,
    total: 0,
  })
}

function buildAdvanceRows(regNo, from, to) {
  return leafDeliveries
    .filter(row => row.regNo === regNo && isInDateRange(row.date, from, to))
    .map(row => {
      const rate = rateFor(row.date)

      return {
        ...row,
        superRate: rate.superRate,
        normalRate: rate.normalRate,
        total: (Number(rate.superRate || 0) * Number(row.superNet || 0)) +
          (Number(rate.normalRate || 0) * Number(row.normalNet || 0)),
      }
    })
}

function calculateAdvanceLimit(regNo, salaryFrom) {
  const selectedMonthTo = monthEnd(salaryFrom)
  const nextMonthFrom = nextMonthStart(salaryFrom)
  const calculationTo = nextMonthSameDay(salaryFrom)
  const cycleEnd = calculationTo

  const selectedRows = buildAdvanceRows(regNo, salaryFrom, selectedMonthTo)
  const nextRows = buildAdvanceRows(regNo, nextMonthFrom, calculationTo)
  const rows = [...selectedRows, ...nextRows]

  const selected = summarizeRows(selectedRows)
  const next = summarizeRows(nextRows)

  return {
    rows,
    superNet: selected.superNet + next.superNet,
    normalNet: selected.normalNet + next.normalNet,
    total: selected.total + next.total,
    calculationFrom: salaryFrom,
    calculationTo,
    cycleEnd,
    periods: [
      {
        key: 'selected',
        label: 'Selected month',
        from: salaryFrom,
        to: selectedMonthTo,
        rows: selectedRows,
        ...selected,
      },
      {
        key: 'next',
        label: 'Next month',
        from: nextMonthFrom,
        to: calculationTo,
        rows: nextRows,
        ...next,
      },
    ],
  }
}

function requestLabel(request, tab) {
  if (tab === 'advance') return currency(request.amount)
  return `${request.type || 'Request'} - ${Number(request.qty || 0).toLocaleString()} ${request.unit || ''}`
}

function summarizeQuantityByType(rows) {
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

function RequestTableSummary({ rows, tab }) {
  const supplierCount = new Set(rows.map(row => row.regNo)).size
  const requestCount = rows.length
  const isAdvance = tab === 'advance'

  const totalAmount = isAdvance
    ? currency(rows.reduce((sum, row) => sum + Number(row.amount || 0), 0))
    : null

  const quantityBreakdown = isAdvance ? [] : summarizeQuantityByType(rows)

  const valueLabel = isAdvance
    ? 'Total advance amount'
    : tab === 'fertilizer'
      ? 'Fertilizer-wise quantity'
      : 'Item-wise quantity'

  const Icon = isAdvance ? Banknote : tab === 'fertilizer' ? Sprout : Package

  const totalQuantity = quantityBreakdown.reduce((sum, item) => sum + Number(item.qty || 0), 0)

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div className={`grid grid-cols-1 gap-3 ${isAdvance ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Supplier count</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{supplierCount}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Request count</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{requestCount}</p>
        </div>

        {isAdvance && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-green-800 dark:border-green-900/50 dark:bg-green-900/15 dark:text-green-200">
            <div className="flex items-center gap-2">
              <Icon size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{valueLabel}</p>
            </div>
            <p className="mt-1 text-xl font-bold">{totalAmount}</p>
          </div>
        )}
      </div>

      {!isAdvance && (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-700 ring-1 ring-green-100 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/40">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">{valueLabel}</p>
                <p className="text-[11px] text-slate-400">{quantityBreakdown.length} types in current filter</p>
              </div>
            </div>

            <div className="rounded-md bg-green-50 px-3 py-1.5 text-right text-green-800 ring-1 ring-green-100 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/40">
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Total Qty</p>
              <p className="text-sm font-bold">{totalQuantity.toLocaleString()}</p>
            </div>
          </div>

          {quantityBreakdown.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {quantityBreakdown.map(item => (
                <div
                  key={`${item.type}-${item.unit}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.type}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.unit || 'units'}</p>
                  </div>

                  <span className="rounded-md border border-green-200 bg-white px-3 py-1 text-sm font-bold text-green-800 shadow-sm dark:border-green-900/50 dark:bg-slate-950/30 dark:text-green-300">
                    {item.qty.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-sm font-semibold text-slate-400">
              No quantity available
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SupplierWindow({ regNo, tab, requestsByType, salaryDate, onClose }) {
  const fallbackSupplier = mockSuppliers.find(supplier => supplier.regNo === regNo)
  const [supplier, setSupplier] = useState(fallbackSupplier || null)
  const [supplierLoading, setSupplierLoading] = useState(false)
  const [summaryStatus, setSummaryStatus] = useState('all')

  useEffect(() => {
    let mounted = true

    setSupplier(fallbackSupplier || null)
    setSupplierLoading(true)

    supplierDashboardApi
      .getSupplier({ regNo, months: 2 })
      .then(result => {
        if (mounted && result) {
          setSupplier({
            ...result,
            land: result.land || fallbackSupplier?.land,
          })
        }
      })
      .catch(() => {
        if (mounted) setSupplier(fallbackSupplier || null)
      })
      .finally(() => {
        if (mounted) setSupplierLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [fallbackSupplier, regNo])

  if (!supplier && supplierLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
        <div className="rounded-lg bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-xl dark:bg-slate-900 dark:text-slate-200">
          Loading supplier details...
        </div>
      </div>
    )
  }

  if (!supplier) return null

  const salaryFrom = salaryDate || new Date().toISOString().slice(0, 10)
  const limit = calculateAdvanceLimit(regNo, salaryFrom)
  const isAdvanceView = tab === 'advance'
  const leafNetWeight = limit.superNet + limit.normalNet

  const allSupplierRequests = [
    ...(requestsByType?.advance || []).map(request => ({ ...request, category: 'Advance' })),
    ...(requestsByType?.fertilizer || []).map(request => ({ ...request, category: 'Fertilizer' })),
    ...(requestsByType?.items || []).map(request => ({ ...request, category: 'Item' })),
  ].filter(request => request.regNo === regNo)

  const summarySource = summaryStatus === 'all'
    ? allSupplierRequests
    : allSupplierRequests.filter(request => request.status === summaryStatus)

  const summary = ['approved', 'pending', 'rejected']
    .map(status => ({
      name: status,
      value: summarySource.filter(request => request.status === status).length,
    }))
    .filter(item => item.value > 0)

  const requestCounts = {
    advance: (requestsByType?.advance || []).filter(request => request.regNo === regNo).length,
    fertilizer: (requestsByType?.fertilizer || []).filter(request => request.regNo === regNo).length,
    items: (requestsByType?.items || []).filter(request => request.regNo === regNo).length,
  }

  const showBank = tab === 'advance' && /(bank|cheque|check)/i.test(supplier.payment || '')

  const activeRequestLabel = tab === 'advance' ? 'Advance' : tab === 'fertilizer' ? 'Fertilizer' : 'Item'
  const ActiveIcon = tab === 'advance' ? WalletCards : tab === 'fertilizer' ? Sprout : Package

  const supplierRows = [
    ['Registration No.', supplier.regNo],
    ['Route', supplier.route],
    ['Address', supplier.address],
    ['Phone', supplier.phone],
    ['Payment', supplier.payment],
    ['Status', supplier.status],
  ]

  const landRows = [
    ['Acres', supplier.land?.acres ?? 0],
    ['Rood', supplier.land?.rood ?? 0],
    ['Perch', supplier.land?.perch ?? 0],
    ['Total Land', `${supplier.land?.acres ?? 0}A ${supplier.land?.rood ?? 0}R ${supplier.land?.perch ?? 0}P`],
  ]

  const bankRows = [
    ['Bank', supplier.bank],
    ['Branch', supplier.branch],
    ['Account No.', supplier.accountNo],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-[0_24px_90px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
        <header className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-lime-400 to-green-700" />

          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-base font-bold text-white shadow-lg dark:bg-white dark:text-slate-950">
                {initials(supplier.name)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-bold text-slate-950 dark:text-white">{supplier.name}</h3>

                  <StatusBadge status={supplier.status || 'active'} className="text-[10px] font-bold uppercase" />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{supplier.regNo}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{supplier.route || '-'}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{supplier.payment || '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:flex">
                Salary date
                <span className="text-xs font-bold text-slate-800 dark:text-white">{salaryFrom}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="max-h-[82vh] overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
            <aside className="space-y-3">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <User size={15} className="text-emerald-600" />
                  Supplier profile
                </div>

                <div className="space-y-2">
                  {supplierRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800"
                    >
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="max-w-[58%] text-right text-xs font-semibold text-slate-800 dark:text-slate-100">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <TreePine size={15} className="text-amber-600" />
                  Land profile
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {landRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md bg-amber-50 px-2.5 py-1.5 ring-1 ring-amber-100 dark:bg-amber-900/15 dark:ring-amber-900/40"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {showBank && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <Landmark size={15} className="text-teal-600" />
                    Bank profile
                  </div>

                  <div className="space-y-2">
                    {bankRows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800"
                      >
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            <main className="space-y-3">
              <section className="grid grid-cols-1 gap-3">
                <div className="relative overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50/80 p-3 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/15">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    {isAdvanceView ? <WalletCards size={15} /> : <ActiveIcon size={15} />}
                    {isAdvanceView ? 'Advance eligibility' : `${activeRequestLabel} eligibility`}
                  </div>

                  {isAdvanceView ? (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Maximum advance limit</p>
                      <p className="mt-0.5 text-xl font-bold text-emerald-800 dark:text-emerald-200">{currency(limit.total)}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{salaryFrom} to {limit.cycleEnd || '-'}</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Leaf net weight</p>
                      <p className="mt-0.5 text-xl font-bold text-emerald-800 dark:text-emerald-200">{leafNetWeight.toLocaleString()} kg</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{salaryFrom} to {limit.cycleEnd || '-'}</p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:hidden">
                  Salary date
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{salaryFrom}</span>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Leaf size={15} className="text-green-700 dark:text-green-300" />
                    Supplier request summary
                  </div>

                  <div className="flex gap-1">
                    {['all', 'approved', 'pending', 'rejected'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSummaryStatus(status)}
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                          summaryStatus === status
                            ? 'border-green-700 bg-green-700 text-white'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[170px_1fr]">
                  <div className="h-36 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
                    {summary.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={summary} dataKey="value" nameKey="name" innerRadius={32} outerRadius={56} paddingAngle={3}>
                            {summary.map(item => (
                              <Cell key={item.name} fill={getStatusChartColor(item.name)} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">No requests</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['Advance', requestCounts.advance, 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'],
                        ['Fertilizer', requestCounts.fertilizer, 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'],
                        ['Items', requestCounts.items, 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'],
                      ].map(([label, value, tone]) => (
                        <div key={label} className={`rounded-md px-2 py-1.5 text-center ${tone}`}>
                          <p className="text-base font-bold">{value}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1">
                      {summarySource.map(request => (
                        <div
                          key={`${request.category}-${request.id}`}
                          className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/70"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                              {request.category} / {requestLabel(request, request.category === 'Advance' ? 'advance' : 'items')}
                            </p>
                            <p className="text-[11px] text-slate-400">{request.date}</p>
                          </div>

                          <StatusBadge status={request.status} />
                        </div>
                      ))}

                      {summarySource.length === 0 && (
                        <div className="py-8 text-center text-sm text-slate-400">No matching requests</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidePanel({
  req,
  draft,
  statusSaving,
  canApprove,
  canReject,
  canApproveRejected,
  canRejectApproved,
  onDraftChange,
  onApprove,
  onReject,
  onOpenSupplier,
}) {
  if (!req) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[220px] shadow-sm">
        <Inbox size={28} className="mb-2 opacity-40" />
        <p className="text-sm">Select a request to view details</p>
      </div>
    )
  }

  const canEdit = req.status === 'pending' || req.status === 'rejected'
  const canApproveRequest = req.status === 'pending'
    ? canApprove
    : req.status === 'rejected'
      ? canApproveRejected
      : false
  const canRejectRequest = req.status === 'pending'
    ? canReject
    : req.status === 'approved'
      ? canRejectApproved
      : false
  const canShowActions = canApproveRequest || canRejectRequest

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-sm sticky top-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <Avatar name={req.name} />

        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{req.name || 'Supplier'}</p>
          <p className="text-xs text-slate-400">{req.regNo} / {req.date}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenSupplier(req.regNo)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
      >
        <Eye size={14} /> Supplier Details
      </button>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Status</p>
          <StatusBadge status={req.status} />
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Date</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{req.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Request No</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{req.requestNo || '-'}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Checked By</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{req.checkedBy || '-'}</p>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <Pencil size={14} className="text-green-700 flex-shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-300">
            Only remarks can be edited for pending and rejected requests.
          </p>
        </div>
      )}

      {(!canApprove || !canReject) && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>Approve, reject, and status-reversal actions depend on your assigned request permissions.</p>
        </div>
      )}

      <div>
        <label className="block">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Remarks</span>

          <textarea
            value={draft.remarks ?? ''}
            disabled={!canEdit}
            onChange={event => onDraftChange('remarks', event.target.value)}
            rows={4}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-70 focus:border-green-500"
            placeholder="Add review remarks"
          />
        </label>
      </div>

      {canShowActions ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={statusSaving || !canRejectRequest}
            onClick={() => onReject(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={13} /> Reject
          </button>

          <button
            type="button"
            disabled={statusSaving || !canApproveRequest}
            onClick={() => onApprove(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-green-700 text-white hover:bg-green-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={13} /> Approve
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-md">
          <Info size={14} className="text-green-600 mt-0.5 shrink-0" />

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This request is <strong className="font-semibold capitalize">{req.status}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Requests() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState(() => normalizeTab(searchParams.get('tab')))
  const [filter, setFilter] = useState(() => normalizeFilter(searchParams.get('filter')))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [salaryDate, setSalaryDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedKey, setSelectedKey] = useState(null)
  const [draft, setDraft] = useState({})
  const [supplierWindow, setSupplierWindow] = useState(null)
  const [requestLoading, setRequestLoading] = useState(true)
  const [requestError, setRequestError] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentAdmin, setCurrentAdmin] = useState(() => adminAuthStorage.getUser())

  const [advance, setAdvance] = useState([])
  const [fertilizer, setFertilizer] = useState([])
  const [items, setItems] = useState([])
  const [requestTotals, setRequestTotals] = useState(null)

  useEffect(() => {
    const admin = adminAuthStorage.getUser()
    if (!admin?.id || admin.isSuperAdmin) {
      return
    }

    let mounted = true
    dashboardPermissionsApi
      .getUserPermissions(admin.id)
      .then(permissions => {
        if (!mounted) return
        const updatedAdmin = {
          ...admin,
          hasPermissionData: true,
          modulePermissions: permissions.modulePermissions || {},
          subPermissions: permissions.subPermissions || {},
        }
        adminAuthStorage.setUser(updatedAdmin)
        setCurrentAdmin(updatedAdmin)
      })
      .catch(() => {
        if (mounted) setCurrentAdmin(admin)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const nextTab = normalizeTab(searchParams.get('tab'))
    const nextFilter = normalizeFilter(searchParams.get('filter'))

    setTab(nextTab)
    setFilter(nextFilter)
    setSelectedKey(null)
    setDraft({})
  }, [searchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    setRequestLoading(true)
    setRequestError('')

    dashboardRequestsApi
      .list({
        search: debouncedSearch,
        fromDate,
        toDate,
        signal: controller.signal,
      })
      .then(result => {
        setAdvance(result.advance)
        setFertilizer(result.fertilizer)
        setItems(result.items)
        setRequestTotals(result.totals)

        setSelectedKey(currentKey => {
          if (!currentKey) return null

          const allRows = [
            ...result.advance.map(row => ({ ...row, requestType: 'advance' })),
            ...result.fertilizer.map(row => ({ ...row, requestType: 'fertilizer' })),
            ...result.items.map(row => ({ ...row, requestType: 'items' })),
          ]

          return allRows.some(row => `${row.requestType}-${row.id}` === currentKey)
            ? currentKey
            : null
        })
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setRequestError(error.message || 'Unable to load dashboard requests')
        }
      })
      .finally(() => {
        setRequestLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [debouncedSearch, fromDate, refreshKey, toDate])

  const allData = useMemo(() => ({
    advance,
    fertilizer,
    items,
  }), [advance, fertilizer, items])

  const selected = useMemo(() => {
    if (!selectedKey) return null

    return allData[tab].find(row => `${tab}-${row.id}` === selectedKey) || null
  }, [allData, selectedKey, tab])

  const filtered = useMemo(() => (
    allData[tab].filter(row => {
      const term = search.trim().toLowerCase()

      const matchesFilter = filter === 'all' || row.status === filter
      const matchesDate = isInDateRange(row.date, fromDate, toDate)
      const matchesSearch = !term ||
        row.name.toLowerCase().includes(term) ||
        row.regNo.toLowerCase().includes(term) ||
        row.requestNo.toLowerCase().includes(term) ||
        row.type.toLowerCase().includes(term)

      return matchesFilter && matchesDate && matchesSearch
    })
  ), [allData, filter, fromDate, search, tab, toDate])

  const tabRows = allData[tab]

  const requestStats = [
    {
      label: 'All Requests',
      value: requestTotals?.totalCount || tabRows.length,
      tone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Pending Review',
      value: tabRows.filter(row => row.status === 'pending').length,
      tone: 'text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Approved',
      value: tabRows.filter(row => row.status === 'approved').length,
      tone: 'text-green-700 dark:text-green-300',
    },
    {
      label: 'Rejected',
      value: tabRows.filter(row => row.status === 'rejected').length,
      tone: 'text-red-600 dark:text-red-300',
    },
  ]

  const canApproveCurrentTab = hasAdminPermission(currentAdmin, requestActionPermissions.approve[tab])
  const canRejectCurrentTab = hasAdminPermission(currentAdmin, requestActionPermissions.reject[tab])
  const canApproveRejectedCurrentTab = hasExplicitAdminPermission(currentAdmin, requestActionPermissions.approveRejected[tab])
  const canRejectApprovedCurrentTab = hasExplicitAdminPermission(currentAdmin, requestActionPermissions.rejectApproved[tab])

  function countFor(status) {
    const data = allData[tab].filter(row => isInDateRange(row.date, fromDate, toDate))
    return status === 'all' ? data.length : data.filter(row => row.status === status).length
  }

  function updateSearchParams(nextTab, nextFilter) {
    const params = {}

    if (nextTab && nextTab !== 'advance') params.tab = nextTab
    if (nextFilter && nextFilter !== 'all') params.filter = nextFilter

    setSearchParams(params)
  }

  function handleTabChange(nextTab) {
    const normalized = normalizeTab(nextTab)

    setTab(normalized)
    setFilter('all')
    setSelectedKey(null)
    setDraft({})
    updateSearchParams(normalized, 'all')
  }

  function handleFilterChange(nextFilter) {
    const normalized = normalizeFilter(nextFilter)

    setFilter(normalized)
    setSelectedKey(null)
    setDraft({})
    updateSearchParams(tab, normalized)
  }

  function selectRow(row) {
    const rowKey = `${tab}-${row.id}`
    const isSame = selectedKey === rowKey

    setSelectedKey(isSame ? null : rowKey)
    setDraft(isSame ? {} : { ...row })
  }

  function updateTabData(updater) {
    if (tab === 'advance') {
      setAdvance(previous => updater(previous))
      return
    }

    if (tab === 'fertilizer') {
      setFertilizer(previous => updater(previous))
      return
    }

    setItems(previous => updater(previous))
  }

  async function refreshAdminPermissionsForAction() {
    const admin = adminAuthStorage.getUser()

    if (!admin?.id || admin.isSuperAdmin) {
      setCurrentAdmin(admin)
      return admin
    }

    try {
      const permissions = await dashboardPermissionsApi.getUserPermissions(admin.id)
      const updatedAdmin = {
        ...admin,
        hasPermissionData: true,
        modulePermissions: permissions.modulePermissions || {},
        subPermissions: permissions.subPermissions || {},
      }

      adminAuthStorage.setUser(updatedAdmin)
      setCurrentAdmin(updatedAdmin)
      return updatedAdmin
    } catch {
      return currentAdmin
    }
  }

  async function updateStatus(id, status) {
    if (statusSaving) return
    const currentRow = allData[tab].find(row => row.id === id)
    const currentStatus = currentRow?.status || 'pending'
    const isApproveRejected = status === 'approved' && currentStatus === 'rejected'
    const isRejectApproved = status === 'rejected' && currentStatus === 'approved'
    const permissionAdmin = isApproveRejected || isRejectApproved
      ? await refreshAdminPermissionsForAction()
      : currentAdmin
    const canApproveRejectedNow = hasExplicitAdminPermission(permissionAdmin, requestActionPermissions.approveRejected[tab])
    const canRejectApprovedNow = hasExplicitAdminPermission(permissionAdmin, requestActionPermissions.rejectApproved[tab])

    if (isApproveRejected && !canApproveRejectedNow) {
      setRequestError('You do not have permission to approve rejected requests.')
      return
    }
    if (status === 'approved' && currentStatus !== 'rejected' && !canApproveCurrentTab) {
      setRequestError('You do not have permission to approve pending requests.')
      return
    }
    if (isRejectApproved && !canRejectApprovedNow) {
      setRequestError('You do not have permission to reject approved requests.')
      return
    }
    if (status === 'rejected' && currentStatus !== 'approved' && !canRejectCurrentTab) {
      setRequestError('You do not have permission to reject pending requests.')
      return
    }

    setStatusSaving(true)
    setRequestError('')

    try {
      const updated = await dashboardRequestsApi.updateStatus({
        requestType: tab,
        id,
        status,
        remarks: draft.remarks ?? '',
      })

      updateTabData(previous => previous.map(row => (
        row.id === id ? updated : row
      )))

      setDraft(updated)
      setSelectedKey(`${tab}-${updated.id}`)
      setRefreshKey(current => current + 1)
      setRequestError('')
    } catch (error) {
      setRequestError(error.message || 'Unable to update request status')
    } finally {
      setStatusSaving(false)
    }
  }

  function handleDraftChange(key, value) {
    setDraft(previous => ({
      ...previous,
      [key]: value,
    }))

    if (key === 'remarks' && selectedKey) {
      updateTabData(previous => previous.map(row => (
        `${tab}-${row.id}` === selectedKey
          ? { ...row, remarks: value }
          : row
      )))
    }
  }

  const tableColumnCount = tab === 'advance' ? 7 : 8

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold mb-3">
              <Leaf size={13} /> Tea Supplier Operations
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Management</h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review advances, fertilizer, and item requests with supplier production context.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {requestStats.map(stat => (
              <div
                key={stat.label}
                className="min-w-28 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.tone}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit shadow-sm">
        {tabs.map(tabItem => {
          const Icon = tabItem.icon

          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => handleTabChange(tabItem.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                tab === tabItem.id
                  ? tabActiveClass[tabItem.id]
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={15} />
              {tabItem.label}
            </button>
          )
        })}
      </div>

      {requestError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/15 dark:text-red-300">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0" />

            <div>
              <p className="font-semibold">Request data could not be synchronized</p>
              <p className="text-xs opacity-80">{requestError}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey(current => current + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <div className="flex min-w-72 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
                <Search size={18} className="text-slate-400" />

                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search by reg no, supplier, request no, or type"
                  className="w-full bg-transparent py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                />
              </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Salary date
                <input
                  type="date"
                  value={salaryDate}
                  onChange={event => setSalaryDate(event.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none dark:text-white"
                />
              </label>

                {validFilters.map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleFilterChange(status)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                      filter === status
                        ? filterActiveClass[tab]
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status} ({countFor(status)})
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setRefreshKey(current => current + 1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <RefreshCw size={16} className={requestLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                From
                <input
                  type="date"
                  value={fromDate}
                  onChange={event => setFromDate(event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                To
                <input
                  type="date"
                  value={toDate}
                  onChange={event => setToDate(event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>

              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate('')
                    setToDate('')
                  }}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Clear dates
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Reg No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Supplier</th>

                    {tab === 'advance' ? (
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Amount</th>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Quantity</th>
                      </>
                    )}

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Remarks</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Checked By</th>
                  </tr>
                </thead>

                <tbody>
                  {requestLoading ? (
                    <tr>
                      <td colSpan={tableColumnCount} className="py-12 text-center text-slate-400">
                        <RefreshCw size={24} className="mx-auto mb-2 animate-spin opacity-50" />
                        <p className="text-sm">Loading requests from database...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumnCount} className="py-12 text-center text-slate-400">
                        <Inbox size={24} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No requests found</p>
                      </td>
                    </tr>
                  ) : filtered.map(row => (
                    <tr
                      key={`${tab}-${row.id}`}
                      onClick={() => selectRow(row)}
                      className={`border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors ${
                        selected?.id === row.id
                          ? selectedRowClass[tab]
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">{row.regNo}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{row.name || '-'}</td>

                      {tab === 'advance' ? (
                        <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-300">{currency(row.amount)}</td>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{row.type || '-'}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {Number(row.qty || 0).toLocaleString()} {row.unit}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-4"><StatusBadge status={row.status} /></td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs max-w-48">
                        <span className="line-clamp-2">{row.remarks || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{row.checkedBy || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <RequestTableSummary rows={filtered} tab={tab} />
          </div>
        </div>

        <div className="w-full xl:w-80 shrink-0">
          <SidePanel
            req={selected}
            draft={draft}
            statusSaving={statusSaving}
            canApprove={canApproveCurrentTab}
            canReject={canRejectCurrentTab}
            canApproveRejected={canApproveRejectedCurrentTab}
            canRejectApproved={canRejectApprovedCurrentTab}
            onDraftChange={handleDraftChange}
            onApprove={id => updateStatus(id, 'approved')}
            onReject={id => updateStatus(id, 'rejected')}
            onOpenSupplier={regNo => setSupplierWindow(regNo)}
          />
        </div>
      </div>

      {supplierWindow && (
        <SupplierWindow
          regNo={supplierWindow}
          tab={tab}
          requestsByType={allData}
          salaryDate={salaryDate}
          onClose={() => setSupplierWindow(null)}
        />
      )}
    </div>
  )
}
