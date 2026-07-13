import { Check, Pencil, RefreshCw } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { configMeta, themedAccent } from '../utils/configurationConstants'

export default function ConfigurationList({
  tab,
  items,
  loading,
  editingId,
  activeSavingId,
  canUpdate,
  onActiveChange,
  onEdit,
}) {
  const meta = configMeta[tab]
  const TypeIcon = meta.icon

  return (
    <div className="min-w-0 border-b border-slate-200 dark:border-slate-700 xl:border-b-0 xl:border-r">
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{meta.plural}</h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-14 text-center text-slate-400">
          <RefreshCw size={24} className="mb-2 animate-spin opacity-50" />
          <p className="text-sm">Loading configurations from database...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={themedAccent.icon}>
            <TypeIcon size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No names registered</p>
          <p className="text-xs text-slate-400 mt-1">Use the form to add your first {meta.label.toLowerCase()} name.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">Name</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">Status</th>
                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map(item => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  style={editingId === item.id ? themedAccent.selected : undefined}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={themedAccent.icon}>
                        <TypeIcon size={15} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400">Registered {meta.label.toLowerCase()} name</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status || (item.isActive ? 'active' : 'inactive')} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onActiveChange(item)}
                        disabled={activeSavingId === item.id || !canUpdate}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          item.isActive
                            ? 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                            : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-900/15'
                        }`}
                      >
                        {activeSavingId === item.id ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        disabled={!canUpdate}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
