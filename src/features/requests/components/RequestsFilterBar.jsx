import { Search } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import { filterActiveClass, validFilters } from '../utils/requestsHelpers'

export default function RequestsFilterBar({
  search,
  onSearchChange,
  tab,
  filter,
  onFilterChange,
  countFor,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClearAllFilters,
  onClearDates,
  filteredCount,
  onRequestReportFormat,
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex min-w-72 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search by reg no, supplier, request no, or type"
            className="w-full bg-transparent py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {validFilters.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => onFilterChange(status)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                filter === status
                  ? filterActiveClass[tab]
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {status} ({countFor(status)})
            </button>
          ))}

          {(search || fromDate || toDate || filter !== 'all') && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear Filters
            </button>
          )}

          <Combobox
            value=""
            onChange={onRequestReportFormat}
            disabled={filteredCount === 0}
            placeholder="Download Report"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'doc', label: 'DOC' },
            ]}
            className="min-w-44"
            buttonClassName="bg-slate-50 py-2 text-sm dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          From
          <input
            type="date"
            value={fromDate}
            onChange={event => onFromDateChange(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          To
          <input
            type="date"
            value={toDate}
            onChange={event => onToDateChange(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>

        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={onClearDates}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Clear dates
          </button>
        )}
      </div>
    </>
  )
}
