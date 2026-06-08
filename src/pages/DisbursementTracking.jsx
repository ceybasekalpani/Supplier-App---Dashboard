import { useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle,
  CheckCircle2,
  Eye,
  Leaf,
  Package,
  Search,
  Sprout,
  Timer,
  X,
} from 'lucide-react'
import { getStoredTrackingRows, saveTrackingRows } from '../data/disbursementTracking'

const typeStyles = {
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
    label: 'Items',
    icon: Package,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  },
}

const formatDisplayDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('en-LK', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const formatOptionalDate = (date) => date ? formatDisplayDate(date) : '-'

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const formatQuantity = (value, unit) => `${Number(value || 0).toLocaleString()} ${unit || ''}`.trim()

const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent || ''

  if (/Edg\//.test(ua)) return 'Microsoft Edge browser'
  if (/Chrome\//.test(ua)) return 'Chrome browser'
  if (/Firefox\//.test(ua)) return 'Firefox browser'
  if (/Safari\//.test(ua)) return 'Safari browser'
  return navigator.platform || 'Unknown device'
}

const getCompletedUser = () => {
  if (typeof window === 'undefined') return 'Current User'
  return window.localStorage.getItem('supplier-app-current-user') || 'Current User'
}

const parseTrackingValue = (item) => {
  if (item.issuedType === 'advance') {
    const amount = Number(item.amount) || Number(String(item.issuedDetails).replace(/[^\d.]/g, '')) || 0
    return { name: 'Advance', value: amount, unit: '', formatter: formatCurrency }
  }

  if (item.itemName && Number(item.qty)) {
    return {
      name: item.itemName,
      value: Number(item.qty),
      unit: item.unit || '',
      formatter: value => formatQuantity(value, item.unit),
    }
  }

  const match = String(item.issuedDetails || '').match(/^(.*?)\s*-\s*([\d,.]+)\s*(.*)$/)
  const name = match?.[1]?.trim() || item.issuedDetails || 'Item'
  const qty = Number((match?.[2] || '0').replace(/,/g, '')) || 0
  const unit = match?.[3]?.trim() || ''

  return {
    name,
    value: qty,
    unit,
    formatter: value => formatQuantity(value, unit),
  }
}

const getTrackingSummary = (rows) => {
  const completed = rows.filter(item => item.currentStatus === 'completed')
  const awaiting = rows.filter(item => item.currentStatus !== 'completed')

  return {
    expectedPeople: new Set(rows.map(item => item.regNo)).size,
    expectedTotal: rows.reduce((sum, item) => sum + parseTrackingValue(item).value, 0),
    issuedPeople: new Set(completed.map(item => item.regNo)).size,
    issuedTotal: completed.reduce((sum, item) => sum + parseTrackingValue(item).value, 0),
    notIssuedPeople: new Set(awaiting.map(item => item.regNo)).size,
    notIssuedTotal: awaiting.reduce((sum, item) => sum + parseTrackingValue(item).value, 0),
  }
}

const buildSummaryCards = (summary, formatter) => [
  { label: 'People to receive', value: summary.expectedPeople, tone: 'slate' },
  { label: 'Total to distribute', value: formatter(summary.expectedTotal), tone: 'slate' },
  { label: 'People received', value: summary.issuedPeople, tone: 'green' },
  { label: 'Total distributed', value: formatter(summary.issuedTotal), tone: 'green' },
  { label: 'People not received', value: summary.notIssuedPeople, tone: 'orange' },
  { label: 'Balance to distribute', value: formatter(summary.notIssuedTotal), tone: 'orange' },
]

const summaryToneClasses = {
  slate: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white',
  green: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300',
  orange: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300',
}

function SummaryMetricGrid({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
      {cards.map(card => (
        <div key={card.label} className={`rounded-lg border px-3 py-3 ${summaryToneClasses[card.tone]}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{card.label}</p>
          <p className="mt-1 text-lg font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function TrackingDistributionSummary({ rows }) {
  const advanceRows = rows.filter(item => item.issuedType === 'advance')
  const physicalRows = rows.filter(item => item.issuedType === 'fertilizer' || item.issuedType === 'items')
  const groups = physicalRows.reduce((acc, item) => {
    const parsed = parseTrackingValue(item)
    const key = `${item.issuedType}-${parsed.name}-${parsed.unit}`

    if (!acc[key]) {
      acc[key] = {
        type: item.issuedType,
        name: parsed.name,
        unit: parsed.unit,
        formatter: parsed.formatter,
        rows: [],
      }
    }

    acc[key].rows.push(item)
    return acc
  }, {})

  const groupedRows = Object.values(groups)

  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Distribution summary from tracking records
      </p>

      <div className="space-y-3">
        {advanceRows.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-900/10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Advance</h4>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                {advanceRows.length} record{advanceRows.length === 1 ? '' : 's'}
              </span>
            </div>
            <SummaryMetricGrid cards={buildSummaryCards(getTrackingSummary(advanceRows), formatCurrency)} />
          </section>
        )}

        {groupedRows.map(group => (
          <section key={`${group.type}-${group.name}-${group.unit}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/30">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{group.name}</h4>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.type === 'fertilizer' ? 'Fertilizer' : 'Item'} wise tracking
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                {group.rows.length} record{group.rows.length === 1 ? '' : 's'}
              </span>
            </div>
            <SummaryMetricGrid cards={buildSummaryCards(getTrackingSummary(group.rows), group.formatter)} />
          </section>
        ))}

        {advanceRows.length === 0 && groupedRows.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
            No tracking records to summarize
          </div>
        )}
      </div>
    </div>
  )
}

function TrackingDetailsModal({ item, onClose }) {
  if (!item) return null

  const parsedValue = parseTrackingValue(item)
  const amountOrQty = item.issuedType === 'advance'
    ? formatCurrency(parsedValue.value)
    : formatQuantity(parsedValue.value, parsedValue.unit)
  const rows = [
    ['Supplier RegNo', item.regNo],
    ['Supplier Name', item.supplierName],
    ['Amount / Quantity', amountOrQty],
    ['Request Date', formatOptionalDate(item.requestDate || item.issueDate)],
    ['Approved Date', formatOptionalDate(item.approvedDate || item.issueDate)],
    ['Complete Date', formatOptionalDate(item.completedDate)],
    ['Completed By', item.completedBy || '-'],
    ['Completed Device', item.completedDevice || '-'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-300">Disbursement record</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{item.supplierName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{parsedValue.name} / {amountOrQty}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-700">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Current Status</p>
            <div className="mt-2">
              {item.currentStatus === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 size={12} /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  <Timer size={12} /> Awaiting
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DisbursementTracking() {
  const [trackingRows, setTrackingRows] = useState(getStoredTrackingRows)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)

  const markReceived = (id) => {
    const completedDate = new Date().toISOString().slice(0, 10)
    const completedBy = getCompletedUser()
    const completedDevice = getDeviceName()

    setTrackingRows(prev => {
      const nextRows = prev.map(item => (
        item.id === id
          ? { ...item, currentStatus: 'completed', completedDate, completedBy, completedDevice }
          : item
      ))
      saveTrackingRows(nextRows)
      return nextRows
    })
    if (statusFilter === 'awaiting') {
      setStatusFilter('all')
    }
    setShowSuccess('Receipt confirmed successfully')
    setTimeout(() => setShowSuccess(null), 2500)
  }

  const viewDetails = (item) => {
    setViewingItem(item)
  }

  const filteredRows = trackingRows.filter(item => {
    const matchesDateFrom = !dateFrom || item.issueDate >= dateFrom
    const matchesDateTo = !dateTo || item.issueDate <= dateTo
    const matchesStatus = statusFilter === 'all' || item.currentStatus === statusFilter
    const matchesType = typeFilter === 'all' || item.issuedType === typeFilter
    const search = searchTerm.trim().toLowerCase()
    const matchesSearch = !search ||
      item.regNo.toLowerCase().includes(search) ||
      item.supplierName.toLowerCase().includes(search) ||
      item.issuedDetails.toLowerCase().includes(search)

    return matchesDateFrom && matchesDateTo && matchesStatus && matchesType && matchesSearch
  })

  const completedCount = filteredRows.filter(item => item.currentStatus === 'completed').length
  const awaitingCount = filteredRows.filter(item => item.currentStatus === 'awaiting').length
  const advanceCount = filteredRows.filter(item => item.issuedType === 'advance').length
  const physicalCount = filteredRows.filter(item => item.method === 'Physical Delivery').length

  return (
    <div className="space-y-6 p-6">
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle size={16} /> {showSuccess}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Tracking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Confirm supplier receipts and monitor issued advances, fertilizer, and items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracking records</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{filteredRows.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Confirmed receipts</p>
          <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Awaiting confirmation</p>
          <p className="mt-2 text-3xl font-bold text-orange-800 dark:text-orange-200">{awaitingCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Advance records</p>
          <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{advanceCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search supplier, reg no, or item"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="all">All Types</option>
            <option value="advance">Advance</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="items">Items</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="all">All Status</option>
            <option value="awaiting">Awaiting</option>
            <option value="completed">Completed</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Receipt Confirmation Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">{physicalCount} physical delivery records in current view</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">RegNo</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Supplier</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Issued Item</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Qty / Amount</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Issue Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Method</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-500">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-30" />
                    No tracking records found
                  </td>
                </tr>
              ) : (
                filteredRows.map(item => {
                  const TypeIcon = typeStyles[item.issuedType].icon
                  const parsedValue = parseTrackingValue(item)
                  const quantityOrAmount = item.issuedType === 'advance'
                    ? formatCurrency(parsedValue.value)
                    : formatQuantity(parsedValue.value, parsedValue.unit)

                  return (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-green-700 dark:text-green-400">{item.regNo}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{item.supplierName}</p>
                        <p className="text-xs text-slate-500">{item.route}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeStyles[item.issuedType].className}`}>
                          <TypeIcon size={12} />
                          {parsedValue.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{quantityOrAmount}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatDisplayDate(item.issueDate)}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.method}</td>
                      <td className="py-3 px-4">
                        {item.currentStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                            <Timer size={12} /> Awaiting
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => viewDetails(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Eye size={12} /> View
                          </button>
                          {item.currentStatus === 'awaiting' && (
                            <button
                              onClick={() => markReceived(item.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-800"
                            >
                              <CheckCircle2 size={12} /> Mark Received
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <TrackingDistributionSummary rows={filteredRows} />
      </div>

      <TrackingDetailsModal item={viewingItem} onClose={() => setViewingItem(null)} />
    </div>
  )
}
