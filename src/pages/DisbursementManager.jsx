import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle,
  CheckCircle2,
  Download,
  Leaf,
  Package,
  Printer,
  RefreshCw,
  Send,
  Sprout,
  Truck,
  X,
} from 'lucide-react'
import Combobox from '../components/ui/Combobox'
import StatusBadge from '../components/ui/StatusBadge'
import { disbursementApi } from '../services/disbursementApi'
import { downloadDocReport, printReportAsPdf } from '../utils/reports'

const typeConfig = {
  advance: { label: 'Advance', icon: Banknote, tone: 'amber' },
  fertilizer: { label: 'Fertilizer', icon: Sprout, tone: 'emerald' },
  items: { label: 'Item', icon: Package, tone: 'teal' },
}

const paymentOptions = [
  { value: '', label: 'Select Method' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Account Transfer', label: 'Account Transfer' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
]

const formatDisplayDate = (date) => {
  if (!date) return 'Not set'
  return new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const formatQuantity = (value, unit) => `${Number(value || 0).toLocaleString()} ${unit || ''}`.trim()

const rowKey = (type, id) => `${type}-${id}`

const isPhysicalAdvance = (row, paymentMethods) => (
  row.issuedType === 'advance' && getAdvanceMethod(row, paymentMethods) === 'Cash'
)

const isDeliveryNoteEligible = (row, paymentMethods) => (
  row.issuedType === 'fertilizer' || row.issuedType === 'items' || isPhysicalAdvance(row, paymentMethods)
)

const isNonCashAdvanceMethod = (method) => ['Account Transfer', 'Bank Transfer', 'Cheque'].includes(method)

const getRowLabel = (row) => {
  if (row.issuedType === 'advance') return 'Advance'
  if (row.issuedType === 'fertilizer') return row.fertilizerType || 'Fertilizer'
  return row.itemType || 'Item'
}

const getRowValue = (row) => {
  if (row.issuedType === 'advance') return formatCurrency(row.approvedAmount)
  return formatQuantity(row.approvedQty, row.unit)
}

const getReportPaymentMethod = (row, paymentMethods) => {
  if (row.issuedType !== 'advance') return 'Physical Delivery'
  return getAdvanceMethod(row, paymentMethods) || 'Not Selected'
}

const getAdvanceMethod = (row, paymentMethods) => (
  Object.prototype.hasOwnProperty.call(paymentMethods, row.id)
    ? paymentMethods[row.id]
    : row.paymentMethod || ''
)

const getReportSupplier = (row) => (
  row.route ? `${row.supplierName} / ${row.route}` : row.supplierName
)

const getManagementStatus = (row) => {
  const trackingStatus = String(row.trackingStatus || '').trim().toLowerCase()
  if (trackingStatus === 'issued') return 'dispatched'
  if (trackingStatus) return trackingStatus
  return row.issued ? 'dispatched' : 'approved'
}

const matchesStatusFilter = (row, statusFilter) => (
  !statusFilter || statusFilter === 'all' || getManagementStatus(row) === statusFilter
)

function Toast({ type, message }) {
  if (!message) return null
  const isError = type === 'error'
  const Icon = isError ? AlertCircle : CheckCircle

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-lg ${isError ? 'bg-red-600' : 'bg-green-700'}`}>
      <Icon size={16} /> {message}
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, className }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <Icon size={22} />
      </div>
    </div>
  )
}

function SelectedReviewModal({
  borrower,
  eligibleRows,
  generating,
  onBorrowerChange,
  onClose,
  onGenerate,
}) {
  const focusNextField = (event) => {
    if (event.key !== 'Enter') return

    event.preventDefault()

    const fields = Array.from(event.currentTarget.closest('[data-review-fields]')?.querySelectorAll('[data-review-field]') || [])
    const currentIndex = fields.indexOf(event.currentTarget)
    const nextField = fields[currentIndex + 1]

    if (nextField) nextField.focus()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-300">Generate delivery note</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Review selected disbursements</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {eligibleRows.length} record{eligibleRows.length === 1 ? '' : 's'} will be dispatched
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4" data-review-fields>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Borrower name
              <input
                data-review-field
                value={borrower.borrowerName}
                onChange={event => onBorrowerChange('borrowerName', event.target.value)}
                onKeyDown={focusNextField}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Borrower role
              <input
                data-review-field
                value={borrower.borrowerRole}
                onChange={event => onBorrowerChange('borrowerRole', event.target.value)}
                onKeyDown={focusNextField}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Vehicle no
              <input
                data-review-field
                value={borrower.vehicleNo}
                onChange={event => onBorrowerChange('vehicleNo', event.target.value)}
                onKeyDown={focusNextField}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Route
              <input
                data-review-field
                value={borrower.routeName}
                onChange={event => onBorrowerChange('routeName', event.target.value)}
                onKeyDown={focusNextField}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>

          <label className="mt-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Remarks
            <textarea
              value={borrower.remarks}
              onChange={event => onBorrowerChange('remarks', event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <div className="mt-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 bg-green-50 px-4 py-3 dark:border-slate-700 dark:bg-green-900/10">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Included in delivery note</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left">RegNo</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Amount / Qty</th>
                      <th className="px-4 py-3 text-left">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleRows.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No eligible records selected</td>
                      </tr>
                    ) : eligibleRows.map(row => (
                      <tr key={rowKey(row.issuedType, row.id)} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-4 py-3 font-mono font-semibold text-green-700 dark:text-green-400">{row.regNo}</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{row.supplierName}</td>
                        <td className="px-4 py-3">{getRowLabel(row)}</td>
                        <td className="px-4 py-3 font-semibold">{getRowValue(row)}</td>
                        <td className="px-4 py-3">{row.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || eligibleRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {generating ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            Generate and Dispatch
          </button>
        </div>
      </div>
    </div>
  )
}

function DisbursementTable({
  rows,
  type,
  selectedRows,
  paymentMethods,
  issuingKey,
  onSelect,
  onSelectAll,
  onPaymentMethod,
  onIssueTransfer,
}) {
  const config = typeConfig[type]
  const Icon = config.icon
  const selectableRows = rows.filter(row => (
    !row.issued && isDeliveryNoteEligible(row, paymentMethods)
  ))
  const selectedCount = selectableRows.filter(row => selectedRows[rowKey(type, row.id)]).length
  const allSelected = selectableRows.length > 0 && selectedCount === selectableRows.length

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Icon size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">{config.label} Dispatch Queue</h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {rows.filter(row => !row.issued).length} approved requests ready for dispatch / {selectedCount} selected in this tab
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectAll(type, selectableRows, true)}
              disabled={selectableRows.length === 0 || allSelected}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30"
            >
              <CheckCircle2 size={12} />
              Select All
            </button>
            <button
              type="button"
              onClick={() => onSelectAll(type, selectableRows, false)}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <X size={12} />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={selectableRows.length === 0}
                  onChange={event => onSelectAll(type, selectableRows, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Select all visible rows"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">RegNo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Approved Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                  <Icon size={32} className="mx-auto mb-2 opacity-30" />
                  No {config.label.toLowerCase()} requests available
                </td>
              </tr>
            ) : rows.map(row => {
              const key = rowKey(type, row.id)
              const selected = Boolean(selectedRows[key])
              const method = type === 'advance' ? getAdvanceMethod(row, paymentMethods) : 'Physical Delivery'
              const canSelect = !row.issued && isDeliveryNoteEligible(row, paymentMethods)
              const status = getManagementStatus(row)

              return (
                <tr key={key} className={`border-b border-slate-100 transition-colors dark:border-slate-700/50 ${row.issued ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!canSelect}
                      onChange={event => onSelect(type, row, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-green-700 dark:text-green-400">{row.regNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{row.supplierName}</p>
                    <p className="text-xs text-slate-500">{row.route}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDisplayDate(row.approvedDate)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{getRowLabel(row)}</p>
                    <p className="text-xs text-slate-500">{getRowValue(row)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {type === 'advance' && !row.issued ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Combobox
                          value={method}
                          onChange={(value) => onPaymentMethod(row.id, value)}
                          options={paymentOptions}
                          className="min-w-44"
                          buttonClassName="bg-slate-50 py-1.5 text-sm dark:bg-slate-700"
                        />
                        {isNonCashAdvanceMethod(method) && (
                          <button
                            type="button"
                            onClick={() => onIssueTransfer(row)}
                            disabled={issuingKey === key}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {issuingKey === key ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                            Dispatch Payment
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-300">{method}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} className="px-2.5 py-1" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DisbursementManager() {
  const [selectedRoute, setSelectedRoute] = useState('all')
  const [issueTab, setIssueTab] = useState('advance')
  const [advancePaymentFilter, setAdvancePaymentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('approved')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentMethods, setPaymentMethods] = useState({})
  const [selectedRows, setSelectedRows] = useState({})
  const [showSuccess, setShowSuccess] = useState(null)
  const [showError, setShowError] = useState(null)
  const [queueError, setQueueError] = useState('')
  const [queueLoading, setQueueLoading] = useState(true)
  const [issuingKey, setIssuingKey] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [lastDeliveryNote, setLastDeliveryNote] = useState(null)
  const [borrower, setBorrower] = useState({
    borrowerName: '',
    borrowerRole: '',
    vehicleNo: '',
    routeName: '',
    remarks: '',
  })

  const [advancesState, setAdvancesState] = useState([])
  const [fertilizersState, setFertilizersState] = useState([])
  const [itemsState, setItemsState] = useState([])
  const [routeNames, setRouteNames] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    disbursementApi
      .getQueue({
        route: selectedRoute,
        fromDate: dateFrom,
        toDate: dateTo,
        signal: controller.signal,
      })
      .then(result => {
        setQueueError('')
        setAdvancesState(result.advance)
        setFertilizersState(result.fertilizer)
        setItemsState(result.items)
        setRouteNames(previous => {
          const routes = [...result.advance, ...result.fertilizer, ...result.items]
            .map(item => item.route)
            .filter(Boolean)

          return Array.from(new Set([...previous, ...routes])).sort()
        })
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setQueueError(error.message || 'Unable to load disbursement queue')
        }
      })
      .finally(() => {
        setQueueLoading(false)
      })

    return () => controller.abort()
  }, [dateFrom, dateTo, selectedRoute])

  const allRows = useMemo(() => (
    [...advancesState, ...fertilizersState, ...itemsState]
  ), [advancesState, fertilizersState, itemsState])

  const selectedList = useMemo(() => (
    Object.values(selectedRows)
      .map(selection => {
        const row = allRows.find(item => item.issuedType === selection.issuedType && item.id === selection.id)
        if (!row) return null
        const method = row.issuedType === 'advance' ? getAdvanceMethod(row, paymentMethods) : 'Physical Delivery'
        return { ...row, method }
      })
      .filter(Boolean)
  ), [allRows, paymentMethods, selectedRows])

  const eligibleSelectedRows = selectedList.filter(row => isDeliveryNoteEligible(row, paymentMethods))

  const routeOptions = useMemo(() => ([
    { id: 'all', name: 'All Routes' },
    ...routeNames.map(route => ({ id: route, name: route })),
  ]), [routeNames])

  const selectedRoutes = Array.from(new Set(eligibleSelectedRows.map(row => row.route).filter(Boolean)))

  const updateRows = (type, updater) => {
    if (type === 'advance') setAdvancesState(updater)
    if (type === 'fertilizer') setFertilizersState(updater)
    if (type === 'items') setItemsState(updater)
  }

  const updatePaymentMethod = (id, method) => {
    setPaymentMethods(prev => ({ ...prev, [id]: method }))
    setSelectedRows(prev => {
      const key = rowKey('advance', id)
      if (!prev[key] || method) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const selectRow = (type, row, checked) => {
    const key = rowKey(type, row.id)
    setSelectedRows(prev => {
      const next = { ...prev }
      if (checked) {
        next[key] = { id: row.id, issuedType: type }
      } else {
        delete next[key]
      }
      return next
    })
  }

  const selectAllRows = (type, rows, checked) => {
    setSelectedRows(prev => {
      const next = { ...prev }

      rows.forEach(row => {
        const key = rowKey(type, row.id)
        if (checked) {
          next[key] = { id: row.id, issuedType: type }
        } else {
          delete next[key]
        }
      })

      return next
    })
  }

  const issueBankTransfer = async (row) => {
    const key = rowKey('advance', row.id)
    const method = getAdvanceMethod(row, paymentMethods) || 'Bank Transfer'
    setIssuingKey(key)
    setShowError(null)

    try {
      const tracking = await disbursementApi.issue({
        issuedType: 'advance',
        requestId: row.id,
        method,
      })

      setAdvancesState(previous => previous.map(item => (
        item.id === row.id
          ? {
              ...item,
              issued: true,
              paymentMethod: tracking.method || method,
              trackingStatus: 'dispatched',
              trackingId: tracking.id,
            }
          : item
      )))
      setSelectedRows(previous => {
        const next = { ...previous }
        delete next[key]
        return next
      })
      setShowSuccess(`${method} dispatched for ${row.supplierName}`)
      setTimeout(() => setShowSuccess(null), 3000)
    } catch (error) {
      setShowError(error.message || `Unable to dispatch ${method.toLowerCase()}`)
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setIssuingKey('')
    }
  }

  const openPrintHtml = async (deliveryNoteId) => {
    try {
      const html = await disbursementApi.getDeliveryNotePrintHtml(deliveryNoteId)
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setShowError('Popup blocked. Please allow popups to print the delivery note.')
        setTimeout(() => setShowError(null), 3000)
        return
      }
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    } catch (error) {
      setShowError(error.message || 'Unable to print delivery note')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const generateDeliveryNote = async () => {
    if (!borrower.borrowerName.trim() || !borrower.borrowerRole.trim()) {
      setShowError('Borrower name and role are required')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    if (eligibleSelectedRows.length === 0) {
      setShowError('Select at least one delivery-note eligible record')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    setGenerating(true)
    setShowError(null)

    try {
      const deliveryNote = await disbursementApi.generateDeliveryNote({
        records: eligibleSelectedRows.map(row => ({
          issuedType: row.issuedType,
          requestId: row.id,
          method: row.method,
        })),
        ...borrower,
      })

      const dispatchedKeys = new Set(deliveryNote.details.map(detail => rowKey(detail.itemType, detail.requestId)))
      const dispatchedMethods = deliveryNote.details.reduce((methods, detail) => {
        methods[rowKey(detail.itemType, detail.requestId)] = detail.paymentType || ''
        return methods
      }, {})
      const dispatchedTrackingIds = deliveryNote.details.reduce((ids, detail) => {
        ids[rowKey(detail.itemType, detail.requestId)] = detail.disbursementRecordId || detail.trackingId || detail.id || null
        return ids
      }, {})

      ;['advance', 'fertilizer', 'items'].forEach(type => {
        updateRows(type, previous => previous.map(row => (
          dispatchedKeys.has(rowKey(type, row.id))
            ? {
                ...row,
                issued: true,
                paymentMethod: dispatchedMethods[rowKey(type, row.id)] || (type === 'advance' ? getAdvanceMethod(row, paymentMethods) : 'Physical Delivery'),
                trackingStatus: 'dispatched',
                trackingId: dispatchedTrackingIds[rowKey(type, row.id)] || row.trackingId || null,
              }
            : row
        )))
      })

      setSelectedRows(previous => {
        const next = { ...previous }
        dispatchedKeys.forEach(key => delete next[key])
        return next
      })
      setLastDeliveryNote(deliveryNote)
      setShowReview(false)
      setShowSuccess(`Delivery note ${deliveryNote.deliveryNoteNo} generated`)
      setTimeout(() => setShowSuccess(null), 3000)
    } catch (error) {
      setShowError(error.message || 'Unable to generate delivery note')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setGenerating(false)
    }
  }

  const buildQueueReport = () => {
    const reportRows = currentRows.map(row => ({
      ...row,
      paymentMethod: getReportPaymentMethod(row, paymentMethods),
    }))
    const supplierCount = new Set(reportRows.map(row => row.regNo)).size
    const typeCountLabel = `${typeConfig[issueTab]?.label || 'Disbursement'} Count`
    const selectedInCurrentTab = selectedList.filter(row => row.issuedType === issueTab)
    const eligibleInCurrentTab = selectedInCurrentTab.filter(row => isDeliveryNoteEligible(row, paymentMethods))
    const approvedCount = reportRows.filter(row => getManagementStatus(row) === 'approved').length
    const dispatchedCount = reportRows.filter(row => getManagementStatus(row) === 'dispatched').length
    const completedCount = reportRows.filter(row => getManagementStatus(row) === 'completed').length
    const advanceTotal = reportRows
      .filter(row => row.issuedType === 'advance')
      .reduce((sum, row) => sum + Number(row.approvedAmount || 0), 0)
    const physicalQuantity = reportRows
      .filter(row => row.issuedType !== 'advance')
      .reduce((sum, row) => sum + Number(row.approvedQty || 0), 0)
    const methodSummary = Array.from(new Set(reportRows.map(row => row.paymentMethod).filter(Boolean))).join(', ') || '-'

    return {
      filename: `disbursement-${issueTab}-queue-report`,
      title: `${typeConfig[issueTab]?.label || 'Disbursement'} Queue Report`,
      subtitle: `Route: ${selectedRoute === 'all' ? 'All Routes' : selectedRoute} | Status: ${statusFilter === 'all' ? 'All' : statusFilter} | Date range: ${dateFrom || 'Any'} to ${dateTo || 'Any'}${issueTab === 'advance' ? ` | Payment method: ${advancePaymentFilter === 'all' ? 'All' : advancePaymentFilter}` : ''}`,
      rows: reportRows,
      summary: [
        { label: 'Total Rows', value: reportRows.length },
        { label: 'Suppliers', value: supplierCount },
        { label: 'Selected', value: selectedInCurrentTab.length },
        { label: 'DN Eligible', value: eligibleInCurrentTab.length },
        { label: 'Approved', value: approvedCount },
        { label: 'Dispatched', value: dispatchedCount },
        { label: 'Completed', value: completedCount },
        { label: issueTab === 'advance' ? 'Advance Total' : 'Total Qty', value: issueTab === 'advance' ? formatCurrency(advanceTotal) : formatQuantity(physicalQuantity) },
      ],
      totals: [
        { label: 'Supplier Count', value: supplierCount },
        { label: typeCountLabel, value: reportRows.length },
        { label: 'Selected Count', value: selectedInCurrentTab.length },
        { label: 'Delivery Note Eligible Count', value: eligibleInCurrentTab.length },
        { label: 'Approved Count', value: approvedCount },
        { label: 'Dispatched Count', value: dispatchedCount },
        { label: 'Completed Count', value: completedCount },
        { label: 'Advance Total', value: formatCurrency(advanceTotal) },
        { label: 'Physical Quantity', value: formatQuantity(physicalQuantity) },
        { label: 'Methods Included', value: methodSummary },
      ],
      columns: [
        { label: 'Request', value: row => row.requestNo || row.id, width: 0.95 },
        { label: 'Reg No', value: 'regNo', width: 0.78 },
        { label: 'Supplier / Route', value: row => getReportSupplier(row), width: 1.9 },
        { label: 'Approved', value: row => formatDisplayDate(row.approvedDate), width: 0.95 },
        { label: 'Detail', value: row => getRowLabel(row), width: 1.35 },
        { label: 'Amount / Qty', value: row => getRowValue(row), width: 1.05 },
        { label: 'Method', value: 'paymentMethod', width: 1.05 },
        { label: 'Status', value: row => getManagementStatus(row), width: 0.82 },
      ],
    }
  }

  const handleQueueReportFormat = (format) => {
    if (!format) return
    if (format === 'doc') {
      downloadDocReport(buildQueueReport())
      return
    }
    if (!printReportAsPdf(buildQueueReport())) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const filteredAdvances = advancesState.filter(row => {
    if (advancePaymentFilter === 'all') return true
    const method = getAdvanceMethod(row, paymentMethods)
    if (advancePaymentFilter === 'unselected') return !method
    return method === advancePaymentFilter
  }).filter(row => matchesStatusFilter(row, statusFilter))
  const filteredFertilizers = fertilizersState.filter(row => matchesStatusFilter(row, statusFilter))
  const filteredItems = itemsState.filter(row => matchesStatusFilter(row, statusFilter))
  const filteredAllRows = [...filteredAdvances, ...filteredFertilizers, ...filteredItems]
  const pendingTotalCount = filteredAllRows.filter(item => !item.issued).length
  const issuedTotalCount = filteredAllRows.filter(item => item.issued).length

  const currentRows = {
    advance: filteredAdvances,
    fertilizer: filteredFertilizers,
    items: filteredItems,
  }[issueTab]

  return (
    <div className="space-y-6 p-6">
      <Toast type="success" message={showSuccess} />
      <Toast type="error" message={showError} />

      {queueLoading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading approved disbursement queue...
          </span>
        </div>
      )}

      {!queueLoading && queueError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Disbursement queue could not be loaded</p>
              <p className="mt-0.5 text-xs opacity-90">{queueError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-700">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate delivery notes for cash, fertilizer, and item dispatches</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Combobox
            value=""
            onChange={handleQueueReportFormat}
            disabled={currentRows.length === 0}
            placeholder="Download Report"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'doc', label: 'DOC' },
            ]}
            className="min-w-44"
            buttonClassName="bg-white dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={() => {
              if (selectedRoutes.length === 1 && !borrower.routeName) {
                setBorrower(prev => ({ ...prev, routeName: selectedRoutes[0] }))
              }
              setShowReview(true)
            }}
            disabled={eligibleSelectedRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            Generate Delivery Note ({eligibleSelectedRows.length})
          </button>
        </div>
      </div>

      {lastDeliveryNote && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm dark:border-green-900/50 dark:bg-green-900/10">
          <div>
            <p className="text-sm font-bold text-green-900 dark:text-green-200">Generated {lastDeliveryNote.deliveryNoteNo}</p>
            <p className="text-xs text-green-700 dark:text-green-300">{lastDeliveryNote.totalRecords} records dispatched to delivery note tracking</p>
          </div>
          <button
            type="button"
            onClick={() => openPrintHtml(lastDeliveryNote.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-xs font-semibold text-green-800 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-slate-800 dark:text-green-200 dark:hover:bg-green-900/20"
          >
            <Printer size={14} />
            Print Delivery Note
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Approved Queue" value={filteredAllRows.length} icon={Truck} className="border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <MetricCard label="Selected" value={selectedList.length} icon={CheckCircle2} className="border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200" />
        <MetricCard label="Eligible For DN" value={eligibleSelectedRows.length} icon={Download} className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200" />
        <MetricCard label="Still Pending" value={pendingTotalCount} icon={AlertCircle} className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-200" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <Truck size={18} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Disbursement filters</span>
          <Combobox
            value={selectedRoute}
            onChange={(value) => {
              setQueueLoading(true)
              setSelectedRoute(value)
            }}
            options={routeOptions.map(route => ({ value: route.id, label: route.name }))}
            className="min-w-48"
            buttonClassName="bg-slate-50 px-4 py-2 text-sm dark:bg-slate-700"
          />
          <Combobox
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value || 'all')
              setSelectedRows({})
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'awaiting', label: 'Awaiting' },
              { value: 'approved', label: 'Approved' },
              { value: 'dispatched', label: 'Dispatched' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="min-w-44"
            buttonClassName="bg-slate-50 px-4 py-2 text-sm dark:bg-slate-700"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={event => {
                setQueueLoading(true)
                setDateFrom(event.target.value)
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            To
            <input
              type="date"
              value={dateTo}
              onChange={event => {
                setQueueLoading(true)
                setDateTo(event.target.value)
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            />
          </label>
          {(dateFrom || dateTo || selectedRoute !== 'all' || statusFilter !== 'approved' || advancePaymentFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                if (dateFrom || dateTo || selectedRoute !== 'all') {
                  setQueueLoading(true)
                }
                setSelectedRoute('all')
                setStatusFilter('approved')
                setAdvancePaymentFilter('all')
                setDateFrom('')
                setDateTo('')
                setSelectedRows({})
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear Filters
            </button>
          )}
          {issueTab === 'advance' && (
            <Combobox
              value={advancePaymentFilter}
              onChange={setAdvancePaymentFilter}
              options={[
                { value: 'all', label: 'All Payment Methods' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Account Transfer', label: 'Account Transfer' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'unselected', label: 'Not Selected' },
              ]}
              className="min-w-48"
              buttonClassName="bg-slate-50 px-4 py-2 text-sm dark:bg-slate-700"
            />
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon
            const count = { advance: filteredAdvances, fertilizer: filteredFertilizers, items: filteredItems }[type].filter(row => !row.issued).length

            return (
              <button
                key={type}
                type="button"
                onClick={() => setIssueTab(type)}
                className={`flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                  issueTab === type
                    ? 'border-green-600 bg-white text-green-700 dark:bg-slate-800 dark:text-green-300'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={16} />
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <DisbursementTable
        rows={currentRows}
        type={issueTab}
        selectedRows={selectedRows}
        paymentMethods={paymentMethods}
        issuingKey={issuingKey}
        onSelect={selectRow}
        onSelectAll={selectAllRows}
        onPaymentMethod={updatePaymentMethod}
        onIssueTransfer={issueBankTransfer}
      />

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">{issuedTotalCount}</span> records already dispatched. Only cash advances, fertilizer, and item records are saved to delivery notes; cheque, account transfer, and bank transfer payments stay outside the delivery note.
      </div>

      {showReview && (
        <SelectedReviewModal
          borrower={borrower}
          eligibleRows={eligibleSelectedRows}
          generating={generating}
          onBorrowerChange={(field, value) => setBorrower(prev => ({ ...prev, [field]: value }))}
          onClose={() => setShowReview(false)}
          onGenerate={generateDeliveryNote}
        />
      )}
    </div>
  )
}
