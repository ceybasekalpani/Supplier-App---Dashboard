import { CheckCircle2, RefreshCw, Send, X } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import {
  formatDisplayDate, getAdvanceMethod, getRowLabel, getRowValue, isDeliveryNoteEligible,
  isNonCashAdvanceMethod, paymentOptions, rowKey, typeConfig,
} from '../utils/disbursementHelpers'

export default function DisbursementTable({
  rows,
  type,
  selectedRows,
  paymentMethods,
  issuingKey,
  canDispatch,
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
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                  <Icon size={32} className="mx-auto mb-2 opacity-30" />
                  No {config.label.toLowerCase()} requests available
                </td>
              </tr>
            ) : rows.map(row => {
              const key = rowKey(type, row.id)
              const selected = Boolean(selectedRows[key])
              const method = type === 'advance' ? getAdvanceMethod(row, paymentMethods) : 'Physical Delivery'
              const canSelect = !row.issued && isDeliveryNoteEligible(row, paymentMethods)

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
                            disabled={issuingKey === key || !canDispatch}
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
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
