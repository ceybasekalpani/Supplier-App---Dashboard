import { Leaf } from 'lucide-react'

export default function RequestsHeader({ requestStats }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold mb-3">
            <Leaf size={13} /> Tea Supplier Operations
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Management</h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review advances, fertilizer, and item requests with supplier production context.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          {requestStats.map(stat => (
            <div
              key={stat.label}
              className="min-w-28 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
