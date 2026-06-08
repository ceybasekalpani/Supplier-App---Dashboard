import { useMemo, useState } from 'react'
import {
  Search, Check, X, Eye, Inbox, Info, User, Landmark,
  TreePine, Leaf, Pencil, WalletCards, Banknote,
  Sprout, Package
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  suppliers,
  advanceRequests,
  fertilizerRequests,
  itemRequests,
  leafDeliveries,
  leafRates,
} from '../data/mockData'

const STATUS_STYLES = {
  pending: { pill: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-400' },
  approved: { pill: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500' },
  rejected: { pill: 'bg-red-50 text-red-600 border border-red-200', dot: 'bg-red-400' },
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#16a34a',
  rejected: '#dc2626',
}

const tabs = [
  { id: 'advance', label: 'Advance Requests', icon: Banknote },
  { id: 'fertilizer', label: 'Fertilizer Requests', icon: Sprout },
  { id: 'items', label: 'Item Requests', icon: Package },
]

const tabActiveClass = {
  advance: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm',
  fertilizer: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm',
  items: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 shadow-sm',
}

const filterActiveClass = {
  advance: 'bg-amber-50 text-amber-700 border-amber-300',
  fertilizer: 'bg-green-50 text-green-700 border-green-300',
  items: 'bg-sky-50 text-sky-700 border-sky-300',
}

const selectedRowClass = {
  advance: 'bg-amber-50 dark:bg-amber-900/10',
  fertilizer: 'bg-green-50 dark:bg-green-900/10',
  items: 'bg-sky-50 dark:bg-sky-900/10',
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, size = 'md' }) {
  const classes = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'

  return (
    <div className={`${classes} rounded-full bg-green-100 flex items-center justify-center font-semibold text-green-700 flex-shrink-0`}>
      {initials(name)}
    </div>
  )
}

function currency(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`
}

function isInDateRange(date, from, to) {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

function parseDateParts(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
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
  return formatDateParts(year, month, daysInMonth(year, month))
}

function nextMonthStart(dateString) {
  const { year, month } = parseDateParts(dateString)
  const nextMonth = addMonthsToYearMonth(year, month, 1)
  return formatDateParts(nextMonth.year, nextMonth.month, 1)
}

function nextMonthSameDay(dateString) {
  const { year, month, day } = parseDateParts(dateString)
  const nextMonth = addMonthsToYearMonth(year, month, 1)
  const safeDay = Math.min(day, daysInMonth(nextMonth.year, nextMonth.month))
  return formatDateParts(nextMonth.year, nextMonth.month, safeDay)
}

function monthKey(date) {
  return date.slice(0, 7)
}

function rateFor(date) {
  return leafRates.find(r => r.month === monthKey(date)) || { superRate: 0, normalRate: 0 }
}

function summarizeRows(rows) {
  return rows.reduce((acc, row) => ({
    superNet: acc.superNet + row.superNet,
    normalNet: acc.normalNet + row.normalNet,
    total: acc.total + row.total,
  }), { superNet: 0, normalNet: 0, total: 0 })
}

function buildAdvanceRows(regNo, from, to) {
  return leafDeliveries
    .filter(r => r.regNo === regNo && isInDateRange(r.date, from, to))
    .map(r => {
      const rate = rateFor(r.date)
      return {
        ...r,
        superRate: rate.superRate,
        normalRate: rate.normalRate,
        total: (rate.superRate * r.superNet) + (rate.normalRate * r.normalNet),
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
      { key: 'selected', label: 'Selected month', from: salaryFrom, to: selectedMonthTo, rows: selectedRows, ...selected },
      { key: 'next', label: 'Next month', from: nextMonthFrom, to: calculationTo, rows: nextRows, ...next },
    ],
  }
}

function requestLabel(req, tab) {
  if (tab === 'advance') return currency(req.amount)
  return `${req.type} - ${req.qty} ${req.unit}`
}

function summarizeQuantityByType(rows) {
  const totals = rows.reduce((acc, row) => {
    const key = `${row.type || 'Item'}__${row.unit || 'units'}`
    if (!acc[key]) {
      acc[key] = { type: row.type || 'Item', unit: row.unit || 'units', qty: 0 }
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
  const tone = isAdvance
    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-200'
    : tab === 'fertilizer'
      ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/15 dark:text-green-200'
      : 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-900/15 dark:text-sky-200'

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Supplier count</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{supplierCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Request count</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{requestCount}</p>
        </div>
        <div className={`rounded-lg border px-3 py-3 ${tone}`}>
          <div className="flex items-center gap-2">
            <Icon size={15} />
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{valueLabel}</p>
          </div>
          {isAdvance ? (
            <p className="mt-1 text-xl font-bold">{totalAmount}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quantityBreakdown.length > 0 ? quantityBreakdown.map(item => (
                <span key={`${item.type}-${item.unit}`} className="rounded-md bg-white/70 px-2 py-1 text-xs font-bold ring-1 ring-black/5 dark:bg-slate-950/30">
                  {item.type}: {item.qty.toLocaleString()} {item.unit}
                </span>
              )) : (
                <span className="text-sm font-bold">No quantity</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SupplierWindow({ regNo, tab, requestsByType, onClose }) {
  const supplier = suppliers.find(s => s.regNo === regNo)
  const [salaryFrom, setSalaryFrom] = useState('2026-05-10')
  const [summaryStatus, setSummaryStatus] = useState('all')

  if (!supplier) return null

  const limit = calculateAdvanceLimit(regNo, salaryFrom)
  const isAdvanceView = tab === 'advance'
  const leafNetWeight = limit.superNet + limit.normalNet
  const allSupplierRequests = [
    ...requestsByType.advance.map(r => ({ ...r, category: 'Advance' })),
    ...requestsByType.fertilizer.map(r => ({ ...r, category: 'Fertilizer' })),
    ...requestsByType.items.map(r => ({ ...r, category: 'Item' })),
  ].filter(r => r.regNo === regNo)

  const summarySource = summaryStatus === 'all'
    ? allSupplierRequests
    : allSupplierRequests.filter(r => r.status === summaryStatus)

  const summary = ['approved', 'pending', 'rejected'].map(status => ({
    name: status,
    value: summarySource.filter(r => r.status === status).length,
  })).filter(item => item.value > 0)
  const requestCounts = {
    advance: requestsByType.advance.filter(req => req.regNo === regNo).length,
    fertilizer: requestsByType.fertilizer.filter(req => req.regNo === regNo).length,
    items: requestsByType.items.filter(req => req.regNo === regNo).length,
  }

  const showBank = tab === 'advance' && requestsByType.advance.some(req =>
    req.regNo === regNo && ['Bank Transfer', 'Cheque'].includes(req.paymentType)
  )

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
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-[0_24px_90px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
        <header className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-500" />
          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-base font-bold text-white shadow-lg dark:bg-white dark:text-slate-950">
                {initials(supplier.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-bold text-slate-950 dark:text-white">{supplier.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/25 dark:text-emerald-300 dark:ring-emerald-900/50">
                    {supplier.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{supplier.regNo}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{supplier.route}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{supplier.payment}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:flex">
                Salary date
                <input
                  type="date"
                  value={salaryFrom}
                  onChange={e => setSalaryFrom(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none dark:text-white"
                />
              </label>
              <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
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
                    <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="max-w-[58%] text-right text-xs font-semibold text-slate-800 dark:text-slate-100">{value}</span>
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
                    <div key={label} className="rounded-md bg-amber-50 px-2.5 py-1.5 ring-1 ring-amber-100 dark:bg-amber-900/15 dark:ring-amber-900/40">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {showBank && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <Landmark size={15} className="text-sky-600" />
                    Bank profile
                  </div>
                  <div className="space-y-2">
                    {bankRows.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{value}</span>
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
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{salaryFrom} to {limit.cycleEnd}</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Leaf net weight</p>
                      <p className="mt-0.5 text-xl font-bold text-emerald-800 dark:text-emerald-200">{leafNetWeight.toLocaleString()} kg</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{salaryFrom} to {limit.cycleEnd}</p>
                    </>
                  )}
                </div>

                <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:hidden">
                  Salary date
                  <input
                    type="date"
                    value={salaryFrom}
                    onChange={e => setSalaryFrom(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none dark:text-white"
                  />
                </label>
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
                            <Cell key={item.name} fill={STATUS_COLORS[item.name]} />
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
                      ['Items', requestCounts.items, 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300'],
                    ].map(([label, value, tone]) => (
                      <div key={label} className={`rounded-md px-2 py-1.5 text-center ${tone}`}>
                        <p className="text-base font-bold">{value}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1">
                    {summarySource.map(req => (
                      <div key={`${req.category}-${req.id}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/70">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{req.category} / {requestLabel(req, req.category === 'Advance' ? 'advance' : 'items')}</p>
                          <p className="text-[11px] text-slate-400">{req.date}</p>
                        </div>
                        <StatusBadge status={req.status} />
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

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-sm sticky top-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <Avatar name={req.name} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{req.name}</p>
          <p className="text-xs text-slate-400">{req.regNo} / {req.date}</p>
        </div>
      </div>

      <button
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

      {canEdit && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <Pencil size={14} className="text-green-700 flex-shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-300">Only remarks can be edited for pending and rejected requests.</p>
        </div>
      )}

      <div>
        <label className="block">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Remarks</span>
          <textarea
            value={draft.remarks ?? ''}
            disabled={!canEdit}
            onChange={e => onDraftChange('remarks', e.target.value)}
            rows={4}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-70 focus:border-green-500"
            placeholder="Add review remarks"
          />
        </label>
      </div>

      {canEdit ? (
        <div className="flex gap-2">
          <button
            onClick={() => onReject(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <X size={13} /> Reject
          </button>
          <button
            onClick={() => onApprove(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            <Check size={13} /> Approve
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-md">
          <Info size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This request is <strong className="font-semibold capitalize">{req.status}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Requests() {
  const [tab, setTab] = useState('advance')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState({})
  const [supplierWindow, setSupplierWindow] = useState(null)

  const [advance, setAdvance] = useState(advanceRequests)
  const [fertilizer, setFertilizer] = useState(fertilizerRequests)
  const [items, setItems] = useState(itemRequests)

  const allData = useMemo(() => ({ advance, fertilizer, items }), [advance, fertilizer, items])
  const selected = selectedId ? allData[tab].find(r => r.id === selectedId) || null : null

  const filtered = allData[tab].filter(r =>
    (filter === 'all' || r.status === filter) &&
    isInDateRange(r.date, fromDate, toDate) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.regNo.toLowerCase().includes(search.toLowerCase()))
  )

  const tabRows = allData[tab]
  const requestStats = [
    { label: 'All Requests', value: tabRows.length, tone: 'text-slate-900 dark:text-white' },
    { label: 'Pending Review', value: tabRows.filter(r => r.status === 'pending').length, tone: 'text-amber-700 dark:text-amber-300' },
    { label: 'Approved', value: tabRows.filter(r => r.status === 'approved').length, tone: 'text-green-700 dark:text-green-300' },
    { label: 'Rejected', value: tabRows.filter(r => r.status === 'rejected').length, tone: 'text-red-600 dark:text-red-300' },
  ]

  function countFor(status) {
    const data = allData[tab].filter(r => isInDateRange(r.date, fromDate, toDate))
    return status === 'all' ? data.length : data.filter(r => r.status === status).length
  }

  function selectRow(row) {
    const nextSelected = selectedId === row.id ? null : row
    setSelectedId(nextSelected?.id ?? null)
    setDraft(nextSelected ? { ...nextSelected } : {})
  }

  function updateTabData(updater) {
    const setter = tab === 'advance' ? setAdvance : tab === 'fertilizer' ? setFertilizer : setItems
    setter(prev => updater(prev))
  }

  function updateStatus(id, status) {
    updateTabData(prev => prev.map(r => r.id === id ? { ...r, status, checkedBy: 'Current User', remarks: draft.remarks ?? r.remarks } : r))
    setDraft(prev => ({ ...prev, status, checkedBy: 'Current User' }))
  }

  function handleDraftChange(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }))
    if (key === 'remarks' && selectedId) {
      updateTabData(prev => prev.map(r => r.id === selectedId ? { ...r, remarks: value } : r))
    }
  }

  function resetFiltersForTab(nextTab) {
    setTab(nextTab)
    setSelectedId(null)
    setDraft({})
    setFilter('all')
    setSearch('')
  }

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold mb-3">
              <Leaf size={13} /> Tea Supplier Operations
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review advances, fertilizer, and item requests with supplier production context.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {requestStats.map(stat => (
              <div key={stat.label} className="min-w-28 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.tone}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit shadow-sm">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => resetFiltersForTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
              tab === t.id ? tabActiveClass[t.id] : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by RegNo / Name..."
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 w-56 focus:border-green-500 transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-500">
              From
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-green-500"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              To
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-green-500"
              />
            </label>

            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => { setFilter(status); setSelectedId(null); setDraft({}) }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors border ${
                  filter === status
                    ? filterActiveClass[tab]
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {status} ({countFor(status)})
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                    {[
                      'RegNo', 'Name',
                      ...(tab === 'advance' ? ['Amount'] : ['Type', 'Qty']),
                      'Date', 'Status', 'Remarks', 'Checked By',
                    ].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-3 px-4 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Inbox size={24} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No requests found</p>
                      </td>
                    </tr>
                  ) : filtered.map(r => (
                    <tr
                      key={r.id}
                      onClick={() => selectRow(r)}
                      className={`border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors ${
                        selected?.id === r.id ? selectedRowClass[tab] : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">{r.regNo}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{r.name}</td>

                      {tab === 'advance' ? (
                        <>
                          <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-300">{currency(r.amount)}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.type}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.qty} {r.unit}</td>
                        </>
                      )}

                      <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">{r.date}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs max-w-48">
                        <span className="line-clamp-2">{r.remarks || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{r.checkedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <RequestTableSummary rows={filtered} tab={tab} />
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <SidePanel
            req={selected}
            draft={draft}
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
          onClose={() => setSupplierWindow(null)}
        />
      )}
    </div>
  )
}
