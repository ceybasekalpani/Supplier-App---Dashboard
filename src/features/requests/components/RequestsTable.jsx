import { Inbox, RefreshCw } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { currency, selectedRowClass } from '../utils/requestsHelpers'

export default function RequestsTable({ tab, filtered, requestLoading, selected, onSelectRow, tableColumnCount }) {
  return (
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
              onClick={() => onSelectRow(row)}
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
  )
}
