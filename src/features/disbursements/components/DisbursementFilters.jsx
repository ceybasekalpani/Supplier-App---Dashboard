import { Truck } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import { focusNextFieldOnEnter } from '../../../utils/keyboardNav'

export default function DisbursementFilters({
  selectedRoute,
  onSelectedRouteChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  routeOptions,
  issueTab,
  advancePaymentFilter,
  onAdvancePaymentFilterChange,
  onClearFilters,
}) {
  const showClear = dateFrom || dateTo || selectedRoute !== 'all' || statusFilter !== 'approved' || advancePaymentFilter !== 'all'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800" onKeyDown={focusNextFieldOnEnter}>
      <div className="flex flex-wrap items-center gap-3">
        <Truck size={18} className="text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Disbursement filters</span>
        <Combobox
          value={selectedRoute}
          onChange={onSelectedRouteChange}
          options={routeOptions.map(route => ({ value: route.id, label: route.name }))}
          className="min-w-48"
          buttonClassName="bg-slate-50 px-4 py-2 text-sm dark:bg-slate-700"
        />
        <Combobox
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'awaiting', label: 'Awaiting' },
            { value: 'approved', label: 'Approved' },
            { value: 'dispatched', label: 'Dispatched' },
            { value: 'completed', label: 'Completed' },
          ]}
          className="min-w-44"
          buttonClassName="bg-slate-50 px-4 py-2 text-sm dark:bg-slate-700"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={event => onDateFromChange(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          To
          <input
            type="date"
            value={dateTo}
            onChange={event => onDateToChange(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          />
        </label>
        {showClear && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Clear Filters
          </button>
        )}
        {issueTab === 'advance' && (
          <Combobox
            value={advancePaymentFilter}
            onChange={onAdvancePaymentFilterChange}
            options={[
              { value: 'all', label: 'All Payment Methods' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Account Transfer', label: 'Account Transfer' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'unselected', label: 'Not Selected' },
            ]}
            className="min-w-48"
            buttonClassName="bg-slate-50 px-4 py-2 text-sm dark:bg-slate-700"
          />
        )}
      </div>
    </div>
  )
}
