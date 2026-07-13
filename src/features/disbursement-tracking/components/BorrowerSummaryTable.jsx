import { AlertCircle, RefreshCw } from 'lucide-react'
import { formatByUnit, formatDateTime } from '../utils/trackingFormatters'
import { getDisbursementCategoryLabel, typeStyles } from '../utils/trackingDataHelpers'
import EmptyTableRow from './EmptyTableRow'

export default function BorrowerSummaryTable({
  selectedNote,
  selectedBorrowerName,
  selectedBorrowerRoute,
  selectedBorrowerDetailsCount,
  selectedDetailsLoading,
  borrowerSummaryGroups,
  selectedGroup,
  onSelectSummaryGroup,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Selected Borrower Disbursement Summary</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Click Advance / Fertilizer / Item row to load supplier-wise receipt table below
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
              <p className="font-semibold uppercase tracking-wide text-slate-400">Name</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedBorrowerName}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
              <p className="font-semibold uppercase tracking-wide text-slate-400">Route</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedBorrowerRoute}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
              <p className="font-semibold uppercase tracking-wide text-slate-400">Vehicle</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedNote?.vehicleNo || '-'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
              <p className="font-semibold uppercase tracking-wide text-slate-400">Records</p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedBorrowerDetailsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {selectedDetailsLoading ? (
        <div className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading selected borrower disbursements...
          </span>
        </div>
      ) : (
        <div className="max-h-72 overflow-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left">Disbursement Category</th>
                <th className="px-4 py-3 text-left">Net Amount / Qty</th>
                <th className="px-4 py-3 text-left">Unit Type</th>
                <th className="px-4 py-3 text-left">Dispatch Date / Time</th>
                <th className="px-4 py-3 text-left">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {!selectedNote ? (
                <EmptyTableRow colSpan={5} icon={AlertCircle} message="Select a borrower from the first table" />
              ) : borrowerSummaryGroups.length === 0 ? (
                <EmptyTableRow colSpan={5} icon={AlertCircle} message="No disbursement records found for selected borrower" />
              ) : borrowerSummaryGroups.map(group => {
                const typeStyle = typeStyles[group.issuedType] || typeStyles.items
                const TypeIcon = typeStyle.icon
                const isSelected = selectedGroup?.key === group.key

                return (
                  <tr
                    key={group.key}
                    onClick={() => onSelectSummaryGroup(group)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors dark:border-slate-700/50 ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyle.className}`}>
                        <TypeIcon size={12} />
                        {getDisbursementCategoryLabel(group)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{formatByUnit(group.total, group.unit)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{group.unit || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDateTime(group.dispatchDate)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{group.approvedBy || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
