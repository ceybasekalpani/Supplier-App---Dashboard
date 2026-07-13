import { RefreshCw, Search } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import StatusBadge from '../../../components/ui/StatusBadge'
import { focusNextFieldOnEnter } from '../../../utils/keyboardNav'
import { EMPTY_DASH } from '../utils/supplierHelpers'

export default function SupplierTable({
  search,
  onSearchChange,
  activeOnly,
  onActiveOnlyChange,
  loading,
  suppliers,
  selected,
  onSelectSupplier,
  onRefresh,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700"
        onKeyDown={focusNextFieldOnEnter}
      >
        <div className="flex min-w-72 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search by reg no, name, or route"
            className="w-full bg-transparent py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={event => onActiveOnlyChange(event.target.checked)}
              className="h-4 w-4 accent-green-700"
            />
            Active only
          </label>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              {['Reg No', 'Supplier', 'Route', 'Phone', 'Payment', 'Status'].map(heading => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  Loading suppliers...
                </td>
              </tr>
            ) : suppliers.length > 0 ? (
              suppliers.map(supplier => {
                const isSelected = String(selected?.id) === String(supplier.id)

                return (
                  <tr
                    key={supplier.id || supplier.regNo}
                    onClick={() => onSelectSupplier(supplier)}
                    className={`cursor-pointer border-b border-slate-50 transition-colors last:border-0 dark:border-slate-700/60 ${
                      isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-green-700">{supplier.regNo}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={supplier.name} size="xs" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{supplier.name || EMPTY_DASH}</p>
                          <p className="text-xs text-slate-400">{supplier.address || 'No address'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{supplier.route || EMPTY_DASH}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{supplier.phone || EMPTY_DASH}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{supplier.payment || EMPTY_DASH}</td>
                    <td className="px-4 py-3"><StatusBadge status={supplier.status} /></td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No suppliers found for this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
