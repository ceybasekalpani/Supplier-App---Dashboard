export default function StatCards({ borrowerCount, completedCount, awaitingCount, dispatchedCount }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Borrowers</p>
        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{borrowerCount}</p>
      </div>
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900/50 dark:bg-green-900/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Confirmed receipts</p>
        <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{completedCount}</p>
      </div>
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-900/50 dark:bg-orange-900/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Awaiting receipts</p>
        <p className="mt-2 text-3xl font-bold text-orange-800 dark:text-orange-200">{awaitingCount}</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Dispatched records</p>
        <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{dispatchedCount}</p>
      </div>
    </div>
  )
}
