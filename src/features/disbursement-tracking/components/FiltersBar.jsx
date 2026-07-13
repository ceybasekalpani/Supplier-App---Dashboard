import { Search } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import { focusNextFieldOnEnter } from '../../../utils/keyboardNav'

export default function FiltersBar({ searchTerm, onSearchTermChange, statusFilter, onStatusFilterChange, dateFilter, onDateFilterChange, onClearDate }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-3" onKeyDown={focusNextFieldOnEnter}>
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search borrower, route, vehicle no, supplier, reg no, or item"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Status
          <Combobox
            value={statusFilter}
            onChange={(value) => onStatusFilterChange(value || 'all')}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'awaiting', label: 'Awaiting' },
              { value: 'dispatched', label: 'Dispatched' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="min-w-40"
            buttonClassName="bg-slate-50 dark:bg-slate-700"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Dispatch date
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
        </label>

        {dateFilter && (
          <button
            type="button"
            onClick={onClearDate}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Clear Date
          </button>
        )}
      </div>
    </section>
  )
}
