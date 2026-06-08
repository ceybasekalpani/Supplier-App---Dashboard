import { Leaf, ListChecks, TrendingUp } from 'lucide-react'

export default function DashboardHeader({ stats }) {
  const totalRequests = stats.reduce((total, item) => total + item.total, 0)
  const pendingRequests = stats.reduce((total, item) => total + item.pending, 0)

  return (
    <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-800">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-500" />
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Leaf size={24} />
          </div>
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              Tea supplier operations
            </div>
            <h1 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Factory Dashboard</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Supplier requests, leaf intake, and approval movement at a glance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <TrendingUp size={14} />
              <span className="text-[11px] font-bold uppercase">Total Requests</span>
            </div>
            <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white tabular-nums">{totalRequests}</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <ListChecks size={14} />
              <span className="text-[11px] font-bold uppercase">Pending</span>
            </div>
            <p className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-200 tabular-nums">{pendingRequests}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
