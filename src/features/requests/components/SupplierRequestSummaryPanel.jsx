import { Banknote, Leaf, Package, Sprout } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import StatusBadge, { getStatusChartColor } from '../../../components/ui/StatusBadge'
import { requestLabel } from '../utils/requestsHelpers'

export default function SupplierRequestSummaryPanel({
  allSupplierRequests,
  summarySource,
  summary,
  summaryStatus,
  onSummaryStatusChange,
  summaryCategory,
  onSummaryCategoryChange,
  requestCounts,
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-700 ring-1 ring-green-100 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/40">
            <Leaf size={16} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">Supplier request summary</p>
            <p className="text-[11px] text-slate-400">{summarySource.length} of {allSupplierRequests.length} requests shown</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {['all', 'approved', 'pending', 'rejected'].map(status => (
            <button
              key={status}
              type="button"
              onClick={() => onSummaryStatusChange(status)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                summaryStatus === status
                  ? 'border-green-700 bg-green-700 text-white'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[190px_1fr] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="h-40">
            {summary.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary} dataKey="value" nameKey="name" innerRadius={34} outerRadius={58} paddingAngle={3}>
                    {summary.map(item => (
                      <Cell key={item.name} fill={getStatusChartColor(item.name)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No requests</div>
            )}
          </div>

          {summary.length > 0 && (
            <div className="space-y-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700">
              {summary.map(item => (
                <div key={item.name} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold capitalize text-slate-600 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getStatusChartColor(item.name) }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: 'Advance',
                category: 'Advance',
                value: requestCounts.advance,
                base: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30',
              },
              {
                label: 'Fertilizer',
                category: 'Fertilizer',
                value: requestCounts.fertilizer,
                base: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30',
              },
              {
                label: 'Items',
                category: 'Item',
                value: requestCounts.items,
                base: 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/30',
              },
            ].map(tile => {
              const isActive = summaryCategory === tile.category

              return (
                <button
                  key={tile.label}
                  type="button"
                  onClick={() => onSummaryCategoryChange(isActive ? 'all' : tile.category)}
                  className={`rounded-md px-2 py-1.5 text-center transition-colors ${
                    isActive
                      ? 'bg-green-700 text-white ring-2 ring-green-700 ring-offset-1 dark:ring-offset-slate-900'
                      : tile.base
                  }`}
                >
                  <p className="text-base font-bold">{tile.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide">{tile.label}</p>
                </button>
              )
            })}
          </div>

          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/60 p-2 pr-1.5 dark:border-slate-800 dark:bg-slate-800/40">
            {summarySource.map(request => {
              const CategoryIcon = request.category === 'Advance'
                ? Banknote
                : request.category === 'Fertilizer'
                  ? Sprout
                  : Package

              const categoryTone = request.category === 'Advance'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                : request.category === 'Fertilizer'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'

              return (
                <div
                  key={`${request.category}-${request.id}`}
                  className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-2.5 py-2 shadow-xs dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${categoryTone}`}>
                    <CategoryIcon size={13} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {request.category} / {requestLabel(request, request.category === 'Advance' ? 'advance' : 'items')}
                    </p>
                    <p className="text-[11px] text-slate-400">{request.date}</p>
                  </div>

                  <StatusBadge status={request.status} />
                </div>
              )
            })}

            {summarySource.length === 0 && (
              <div className="flex h-full items-center justify-center py-8 text-center text-sm text-slate-400">No matching requests</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
