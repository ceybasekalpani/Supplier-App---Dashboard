import { AlertCircle, CheckCircle2, Eye, RefreshCw } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatByUnit } from '../utils/trackingFormatters'
import { getDisbursementCategoryLabel, getReceiptRowKey, getReceiptStatus, normalizeId } from '../utils/trackingDataHelpers'
import EmptyTableRow from './EmptyTableRow'

export default function SupplierReceiptTable({
  selectedGroup,
  selectedBorrowerName,
  selectedBorrowerRoute,
  rows,
  receivingId,
  canUpdateTracking,
  onViewDetails,
  onMarkReceived,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Supplier Receipt Confirmation</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {selectedGroup ? `${getDisbursementCategoryLabel(selectedGroup)} for ${selectedBorrowerName} / ${selectedBorrowerRoute}` : 'Select a summary row to show supplier records'}
            </p>
          </div>
          {selectedGroup && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {rows.length} supplier record{rows.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left">Supplier Name</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-left">Disbursement</th>
              <th className="px-4 py-3 text-left">Amount / Qty</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {!selectedGroup ? (
              <EmptyTableRow colSpan={7} icon={AlertCircle} message="Select a borrower summary row first" />
            ) : rows.length === 0 ? (
              <EmptyTableRow colSpan={7} icon={AlertCircle} message="No suppliers found for this disbursement category" />
            ) : rows.map(row => {
              const receiptStatus = getReceiptStatus(row.status)
              const canMarkReceived = receiptStatus !== 'completed'
              const actionDisabled = normalizeId(receivingId) === normalizeId(row.trackingId) || !row.trackingId || !canUpdateTracking

              return (
                <tr key={getReceiptRowKey(row)} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{row.supplierName}</p>
                    <button
                      type="button"
                      onClick={() => onViewDetails(row)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 dark:text-green-400"
                    >
                      <Eye size={11} /> View details
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-green-700 dark:text-green-400">{row.regNo}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{row.issuedType === 'advance' ? 'Advance' : row.categoryName || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{formatByUnit(row.value, row.unit)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.route}</td>
                  <td className="px-4 py-3">
                    {canMarkReceived ? (
                      <button
                        type="button"
                        onClick={() => onMarkReceived(row)}
                        disabled={actionDisabled}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                        title={!row.trackingId ? 'Tracking record not matched for this detail' : 'Mark received'}
                      >
                        {normalizeId(receivingId) === normalizeId(row.trackingId) ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Mark Received
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400">Receipt confirmed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={receiptStatus} className="px-2.5 py-1" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
