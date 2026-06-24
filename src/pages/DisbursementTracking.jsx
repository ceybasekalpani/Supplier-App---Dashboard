import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  Leaf,
  Package,
  Printer,
  RefreshCw,
  Search,
  Sprout,
  Undo2,
  X,
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Combobox from '../components/ui/Combobox'
import { disbursementApi } from '../services/disbursementApi'
import { downloadDocReport, printReportAsPdf } from '../utils/reports'

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

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
    ['Delivery Note', item.deliveryNoteNo || '-'],
    ['Dispatched Date', formatOptionalDate(item.dispatchedAt)],
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
              <StatusBadge status={item.currentStatus || 'awaiting'} className="px-2.5 py-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeliveryNoteDetailsModal({ note, loading, onClose }) {
  if (!note && !loading) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-300">Delivery note</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {loading ? 'Loading...' : note.deliveryNoteNo}
            </h3>
            {!loading && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {note.borrowerName} / {note.totalRecords} dispatched record{note.totalRecords === 1 ? '' : 's'}
              </p>
            )}
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
          {loading ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <RefreshCw size={15} className="animate-spin" />
              Loading delivery note details...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Dispatch Date', formatDateTime(note.dispatchDate)],
                  ['Borrower Role', note.borrowerRole],
                  ['Vehicle No', note.vehicleNo || '-'],
                  ['Route', note.routeName || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left">RegNo</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Amount / Qty</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {note.details.map(detail => (
                      <tr key={detail.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-4 py-3 font-mono font-semibold text-green-700 dark:text-green-400">{detail.supplierRegNo}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{detail.supplierName || '-'}</p>
                          <p className="text-xs text-slate-500">{detail.routeName || '-'}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">{detail.itemType}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                          {detail.amount != null ? formatCurrency(detail.amount) : formatQuantity(detail.quantity, detail.unit)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={detail.status || 'dispatched'} className="px-2.5 py-1" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DisbursementTracking() {
  const [trackingRows, setTrackingRows] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(null)
  const [showError, setShowError] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(true)
  const [receivingId, setReceivingId] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')
  const [deliveryLoading, setDeliveryLoading] = useState(true)
  const [deliveryActionId, setDeliveryActionId] = useState(null)
  const [viewingDeliveryNote, setViewingDeliveryNote] = useState(null)
  const [deliveryDetailsLoading, setDeliveryDetailsLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    disbursementApi
      .getTracking({
        issuedType: typeFilter,
        status: statusFilter,
        search: searchTerm,
        fromDate: dateFrom,
        toDate: dateTo,
        signal: controller.signal,
      })
      .then(result => {
        setTrackingRows(result)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setShowError(error.message || 'Unable to load disbursement tracking')
          setTimeout(() => setShowError(null), 3000)
        }
      })
      .finally(() => {
        setTrackingLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [dateFrom, dateTo, searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    const controller = new AbortController()

    disbursementApi
      .getDeliveryNotes({
        status: deliveryStatusFilter,
        search: searchTerm,
        fromDate: dateFrom,
        toDate: dateTo,
        signal: controller.signal,
      })
      .then(result => {
        setDeliveryNotes(result)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setShowError(error.message || 'Unable to load delivery notes')
          setTimeout(() => setShowError(null), 3000)
        }
      })
      .finally(() => {
        setDeliveryLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [dateFrom, dateTo, deliveryStatusFilter, searchTerm])

  const markReceived = async (id) => {
    const completedBy = getCompletedUser()
    const completedDevice = getDeviceName()

    setReceivingId(id)
    setShowError(null)

    try {
      const updated = await disbursementApi.markReceived({ id, completedBy, completedDevice })

      setTrackingRows(prev => prev.map(item => (
        item.id === id ? updated : item
      )))
      setViewingItem(current => current?.id === id ? updated : current)
      if (statusFilter === 'awaiting') {
        setTrackingLoading(true)
        setStatusFilter('all')
      }
      setShowSuccess('Receipt confirmed successfully')
      setTimeout(() => setShowSuccess(null), 2500)
    } catch (error) {
      setShowError(error.message || 'Unable to confirm receipt')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setReceivingId(null)
    }
  }

  const viewDetails = (item) => {
    setViewingItem(item)
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

  const viewDeliveryNote = async (note) => {
    setViewingDeliveryNote(null)
    setDeliveryDetailsLoading(true)

    try {
      const details = await disbursementApi.getDeliveryNote(note.id)
      setViewingDeliveryNote(details)
    } catch (error) {
      setShowError(error.message || 'Unable to load delivery note details')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setDeliveryDetailsLoading(false)
    }
  }

  const updateDeliveryNoteStatus = async (note, nextStatus) => {
    setDeliveryActionId(`${nextStatus}-${note.id}`)
    setShowError(null)

    try {
      const updated = nextStatus === 'completed'
        ? await disbursementApi.markDeliveryNoteCompleted({ id: note.id, remarks: 'Signed delivery note received by admin.' })
        : await disbursementApi.markDeliveryNoteReturned({ id: note.id, remarks: 'Borrower returned signed delivery note.' })

      const updatedRow = {
        id: updated.id,
        deliveryNoteNo: updated.deliveryNoteNo,
        dispatchDate: updated.dispatchDate,
        borrowerName: updated.borrowerName,
        borrowerRole: updated.borrowerRole,
        vehicleNo: updated.vehicleNo,
        routeName: updated.routeName,
        status: updated.status,
        totalRecords: updated.totalRecords,
        printUrl: updated.printUrl,
      }

      setDeliveryNotes(prev => prev.map(row => row.id === note.id ? updatedRow : row))
      setViewingDeliveryNote(current => current?.id === note.id ? updated : current)
      setTrackingRows(prev => prev.map(row => (
        row.deliveryNoteId === note.id
          ? {
              ...row,
              currentStatus: updated.status,
              completedDate: updated.status === 'completed' ? String(updated.completedAt || '').slice(0, 10) : row.completedDate,
            }
          : row
      )))
      setShowSuccess(nextStatus === 'completed' ? 'Delivery note completed successfully' : 'Delivery note marked as returned')
      setTimeout(() => setShowSuccess(null), 2500)
    } catch (error) {
      setShowError(error.message || 'Unable to update delivery note')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setDeliveryActionId(null)
    }
  }

  const buildTrackingReport = () => ({
      filename: 'disbursement-tracking-report',
      title: 'Disbursement Tracking Report',
      subtitle: `Type: ${typeFilter === 'all' ? 'All Types' : typeFilter} | Status: ${statusFilter === 'all' ? 'All Status' : statusFilter} | Date range: ${dateFrom || 'Any'} to ${dateTo || 'Any'} | Search: ${searchTerm || 'None'}`,
      rows: filteredRows,
      summary: [
        { label: 'Tracking Records', value: filteredRows.length },
        { label: 'Suppliers', value: new Set(filteredRows.map(row => row.regNo)).size },
        { label: 'Awaiting', value: awaitingCount },
        { label: 'Dispatched', value: dispatchedCount },
        { label: 'Completed', value: completedCount },
      ],
      totals: [
        { label: 'Supplier Count', value: new Set(filteredRows.map(row => row.regNo)).size },
        { label: 'Advance Count', value: filteredRows.filter(row => row.issuedType === 'advance').length },
        { label: 'Fertilizer Count', value: filteredRows.filter(row => row.issuedType === 'fertilizer').length },
        { label: 'Item Count', value: filteredRows.filter(row => row.issuedType === 'items').length },
        { label: 'Awaiting Count', value: awaitingCount },
        { label: 'Dispatched Count', value: dispatchedCount },
        { label: 'Completed Count', value: completedCount },
      ],
      columns: [
        { label: 'Request No', value: 'requestNo', width: 1.1 },
        { label: 'Reg No', value: 'regNo', width: 0.8 },
        { label: 'Supplier Name', value: 'supplierName', width: 1.7 },
        { label: 'Type', value: 'issuedType', width: 0.8 },
        { label: 'Item / Detail', value: row => parseTrackingValue(row).name, width: 1.4 },
        { label: 'Amount / Qty', value: row => row.issuedType === 'advance' ? formatCurrency(parseTrackingValue(row).value) : formatQuantity(parseTrackingValue(row).value, parseTrackingValue(row).unit), width: 1 },
        { label: 'Method', value: 'method', width: 1 },
        { label: 'Issue Date', value: 'issueDate', width: 0.9 },
        { label: 'Status', value: 'currentStatus', width: 0.8 },
      ],
  })

  const handleTrackingReportFormat = (format) => {
    if (!format) return
    if (format === 'doc') {
      downloadDocReport(buildTrackingReport())
      return
    }
    if (!printReportAsPdf(buildTrackingReport())) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const getDeliveryNoteReportRows = () => {
    const noteIds = new Set(deliveryNotes.map(note => note.id))
    return trackingRows.filter(row => noteIds.has(row.deliveryNoteId))
  }

  const buildDeliveryNoteReport = () => {
    const detailRows = getDeliveryNoteReportRows()

    return ({
      filename: 'delivery-note-tracking-report',
      title: 'Delivery Note Tracking Report',
      subtitle: `Status: ${deliveryStatusFilter === 'all' ? 'All DN Status' : deliveryStatusFilter} | Date range: ${dateFrom || 'Any'} to ${dateTo || 'Any'} | Search: ${searchTerm || 'None'}`,
      rows: deliveryNotes,
      summary: [
        { label: 'Delivery Notes', value: deliveryNotes.length },
        { label: 'Suppliers', value: new Set(detailRows.map(row => row.regNo)).size || '-' },
        { label: 'Issued', value: deliveryNotes.filter(note => note.status === 'issued').length },
        { label: 'Returned', value: deliveryNotes.filter(note => note.status === 'returned').length },
        { label: 'Completed', value: deliveryNotes.filter(note => note.status === 'completed').length },
      ],
      totals: [
        { label: 'Supplier Count', value: new Set(detailRows.map(row => row.regNo)).size || '-' },
        { label: 'Advance Count', value: detailRows.filter(row => row.issuedType === 'advance').length },
        { label: 'Fertilizer Count', value: detailRows.filter(row => row.issuedType === 'fertilizer').length },
        { label: 'Item Count', value: detailRows.filter(row => row.issuedType === 'items').length },
        { label: 'Delivery Note Count', value: deliveryNotes.length },
        { label: 'Total Dispatched Records', value: deliveryNotes.reduce((sum, note) => sum + Number(note.totalRecords || 0), 0) },
      ],
      columns: [
        { label: 'DN No', value: 'deliveryNoteNo', width: 1.15 },
        { label: 'Dispatch Date', value: row => formatDateTime(row.dispatchDate), width: 1.3 },
        { label: 'Borrower Name', value: 'borrowerName', width: 1.5 },
        { label: 'Borrower Role', value: 'borrowerRole', width: 1.1 },
        { label: 'Vehicle No', value: 'vehicleNo', width: 0.85 },
        { label: 'Route', value: 'routeName', width: 1.35 },
        { label: 'Records', value: 'totalRecords', width: 0.65 },
        { label: 'Status', value: 'status', width: 0.8 },
      ],
    })
  }

  const handleDeliveryNoteReportFormat = (format) => {
    if (!format) return
    if (format === 'doc') {
      downloadDocReport(buildDeliveryNoteReport())
      return
    }
    if (!printReportAsPdf(buildDeliveryNoteReport())) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const filteredRows = trackingRows

  const completedCount = filteredRows.filter(item => item.currentStatus === 'completed').length
  const awaitingCount = filteredRows.filter(item => item.currentStatus === 'awaiting').length
  const dispatchedCount = filteredRows.filter(item => item.currentStatus === 'dispatched').length
  const physicalCount = filteredRows.filter(item => item.method === 'Physical Delivery').length

  return (
    <div className="space-y-6 p-6">
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle size={16} /> {showSuccess}
        </div>
      )}
      {showError && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle size={16} /> {showError}
        </div>
      )}

      {trackingLoading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading disbursement tracking records...
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Tracking</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Confirm supplier receipts and monitor issued advances, fertilizer, and items</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Combobox
            value=""
            onChange={handleDeliveryNoteReportFormat}
            disabled={deliveryNotes.length === 0}
            placeholder="DN Report"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'doc', label: 'DOC' },
            ]}
            className="min-w-36"
            buttonClassName="bg-white dark:bg-slate-800"
          />
          <Combobox
            value=""
            onChange={handleTrackingReportFormat}
            disabled={filteredRows.length === 0}
            placeholder="Tracking Report"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'doc', label: 'DOC' },
            ]}
            className="min-w-44"
            buttonClassName="bg-green-700 text-slate-200 hover:bg-green-800 dark:bg-green-700 dark:text-slate-200 [&>span]:!text-slate-200"
          />
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
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Dispatched records</p>
          <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{dispatchedCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setTrackingLoading(true)
                setDeliveryLoading(true)
                setSearchTerm(e.target.value)
              }}
              placeholder="Search supplier, reg no, or item"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <Combobox
            value={typeFilter}
            onChange={(value) => {
              setTrackingLoading(true)
              setTypeFilter(value)
            }}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'advance', label: 'Advance' },
              { value: 'fertilizer', label: 'Fertilizer' },
              { value: 'items', label: 'Items' },
            ]}
            className="min-w-36"
            buttonClassName="bg-slate-50 dark:bg-slate-700"
          />
          <Combobox
            value={statusFilter}
            onChange={(value) => {
              setTrackingLoading(true)
              setStatusFilter(value)
            }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'awaiting', label: 'Awaiting' },
              { value: 'dispatched', label: 'Dispatched' },
              { value: 'returned', label: 'Returned' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="min-w-36"
            buttonClassName="bg-slate-50 dark:bg-slate-700"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setTrackingLoading(true)
                setDeliveryLoading(true)
                setDateFrom(e.target.value)
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setTrackingLoading(true)
                setDeliveryLoading(true)
                setDateTo(e.target.value)
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Delivery Note Tracking</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mark borrower returned notes and complete signed disbursements</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Combobox
                value=""
                onChange={handleDeliveryNoteReportFormat}
                disabled={deliveryNotes.length === 0}
                placeholder="Download"
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'doc', label: 'DOC' },
                ]}
                className="min-w-32"
                buttonClassName="bg-slate-50 py-2 text-xs dark:bg-slate-700"
              />
              <Combobox
                value={deliveryStatusFilter}
                onChange={(value) => {
                  setDeliveryLoading(true)
                  setDeliveryStatusFilter(value)
                }}
                options={[
                  { value: 'all', label: 'All DN Status' },
                  { value: 'issued', label: 'Issued' },
                  { value: 'returned', label: 'Returned' },
                  { value: 'completed', label: 'Completed' },
                ]}
                className="min-w-44"
                buttonClassName="bg-slate-50 dark:bg-slate-700"
              />
            </div>
          </div>
        </div>

        {deliveryLoading ? (
          <div className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" />
              Loading delivery notes...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">DN No</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Dispatch</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Borrower</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Route / Vehicle</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Records</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryNotes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-500">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      No delivery notes found
                    </td>
                  </tr>
                ) : deliveryNotes.map(note => (
                  <tr key={note.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-green-700 dark:text-green-400">{note.deliveryNoteNo}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatDateTime(note.dispatchDate)}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{note.borrowerName}</p>
                      <p className="text-xs text-slate-500">{note.borrowerRole}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <p>{note.routeName || '-'}</p>
                      <p className="text-xs text-slate-500">{note.vehicleNo || '-'}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{note.totalRecords}</td>
                    <td className="py-3 px-4"><StatusBadge status={note.status || 'issued'} className="px-2.5 py-1" /></td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => viewDeliveryNote(note)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => openPrintHtml(note.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Printer size={12} /> Print
                        </button>
                        {note.status === 'issued' && (
                          <button
                            type="button"
                            onClick={() => updateDeliveryNoteStatus(note, 'returned')}
                            disabled={deliveryActionId === `returned-${note.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deliveryActionId === `returned-${note.id}` ? <RefreshCw size={12} className="animate-spin" /> : <Undo2 size={12} />}
                            Mark Returned
                          </button>
                        )}
                        {note.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => updateDeliveryNoteStatus(note, 'completed')}
                            disabled={deliveryActionId === `completed-${note.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deliveryActionId === `completed-${note.id}` ? <RefreshCw size={12} className="animate-spin" /> : <ClipboardCheck size={12} />}
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Receipt Confirmation Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">{physicalCount} physical delivery records in current view</p>
            </div>
            <Combobox
              value=""
              onChange={handleTrackingReportFormat}
              disabled={filteredRows.length === 0}
              placeholder="Download"
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'doc', label: 'DOC' },
              ]}
              className="min-w-32"
              buttonClassName="bg-slate-50 py-2 text-xs dark:bg-slate-700"
            />
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
                  const typeStyle = typeStyles[item.issuedType] || typeStyles.items
                  const TypeIcon = typeStyle.icon
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeStyle.className}`}>
                          <TypeIcon size={12} />
                          {parsedValue.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{quantityOrAmount}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatDisplayDate(item.issueDate)}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.method}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.currentStatus || 'awaiting'} className="px-2.5 py-1" />
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
                              disabled={receivingId === item.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {receivingId === item.id ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                              Mark Received
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
      <DeliveryNoteDetailsModal
        note={viewingDeliveryNote}
        loading={deliveryDetailsLoading}
        onClose={() => {
          setViewingDeliveryNote(null)
          setDeliveryDetailsLoading(false)
        }}
      />
    </div>
  )
}
