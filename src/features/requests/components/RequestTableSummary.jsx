import { Banknote, Package, Sprout } from 'lucide-react'
import { currency, summarizeQuantityByType } from '../utils/requestsHelpers'

export default function RequestTableSummary({ rows, tab }) {
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

  const totalQuantity = quantityBreakdown.reduce((sum, item) => sum + Number(item.qty || 0), 0)

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div className={`grid grid-cols-1 gap-3 ${isAdvance ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Supplier count</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{supplierCount}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Request count</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{requestCount}</p>
        </div>

        {isAdvance && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-green-800 dark:border-green-900/50 dark:bg-green-900/15 dark:text-green-200">
            <div className="flex items-center gap-2">
              <Icon size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{valueLabel}</p>
            </div>
            <p className="mt-1 text-xl font-bold">{totalAmount}</p>
          </div>
        )}
      </div>

      {!isAdvance && (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-700 ring-1 ring-green-100 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/40">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">{valueLabel}</p>
                <p className="text-[11px] text-slate-400">{quantityBreakdown.length} types in current filter</p>
              </div>
            </div>

            <div className="rounded-md bg-green-50 px-3 py-1.5 text-right text-green-800 ring-1 ring-green-100 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/40">
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Total Qty</p>
              <p className="text-sm font-bold">{totalQuantity.toLocaleString()}</p>
            </div>
          </div>

          {quantityBreakdown.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {quantityBreakdown.map(item => (
                <div
                  key={`${item.type}-${item.unit}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.type}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.unit || 'units'}</p>
                  </div>

                  <span className="rounded-md border border-green-200 bg-white px-3 py-1 text-sm font-bold text-green-800 shadow-sm dark:border-green-900/50 dark:bg-slate-950/30 dark:text-green-300">
                    {item.qty.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-sm font-semibold text-slate-400">
              No quantity available
            </div>
          )}
        </div>
      )}
    </div>
  )
}
