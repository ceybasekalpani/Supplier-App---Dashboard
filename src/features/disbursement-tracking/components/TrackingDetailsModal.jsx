import { X } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatCurrency, formatOptionalDate, formatQuantity } from '../utils/trackingFormatters'
import { parseTrackingValue } from '../utils/trackingDataHelpers'

export default function TrackingDetailsModal({ item, onClose }) {
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
            type="button"
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
