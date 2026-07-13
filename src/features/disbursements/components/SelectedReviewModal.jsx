import { RefreshCw, Send, X } from 'lucide-react'
import { focusNextFieldOnEnter } from '../../../utils/keyboardNav'
import { getRowLabel, getRowValue, rowKey } from '../utils/disbursementHelpers'

export default function SelectedReviewModal({
  borrower,
  eligibleRows,
  generating,
  canGenerate,
  onBorrowerChange,
  onClose,
  onGenerate,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
      onKeyDown={focusNextFieldOnEnter}
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
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Borrower name
              <input
                value={borrower.borrowerName}
                onChange={event => onBorrowerChange('borrowerName', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Borrower role
              <input
                value={borrower.borrowerRole}
                onChange={event => onBorrowerChange('borrowerRole', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Vehicle no
              <input
                value={borrower.vehicleNo}
                onChange={event => onBorrowerChange('vehicleNo', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Route
              <input
                value={borrower.routeName}
                onChange={event => onBorrowerChange('routeName', event.target.value)}
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
            disabled={generating || eligibleRows.length === 0 || !canGenerate}
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
