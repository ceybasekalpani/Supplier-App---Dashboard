import { Newspaper, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { getAudienceLabel, isWithinDeleteWindow } from '../utils/communicationHelpers'
import EmptyState from './EmptyState'

export default function NewsTable({
  items,
  selectedIds,
  allSelected,
  deletableCount,
  deletingKey,
  canUpdateNews,
  canDeleteNews,
  onToggleSelectAll,
  onToggleSelection,
  onEdit,
  onDelete,
}) {
  const isDeletable = (item) => canDeleteNews && isWithinDeleteWindow(item)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-y border-slate-200 bg-white text-xs uppercase text-slate-400 dark:border-slate-700 dark:bg-slate-800">
          <tr>
            <th className="w-10 px-4 py-3 text-left font-semibold">
              <input
                type="checkbox"
                checked={allSelected}
                disabled={deletableCount === 0}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                title="Select all deletable news"
              />
            </th>
            <th className="px-4 py-3 text-left font-semibold">Title</th>
            <th className="px-4 py-3 text-left font-semibold">Message</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3 text-left font-semibold">Expiry</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  disabled={!isDeletable(item)}
                  onChange={() => onToggleSelection(item.id)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {getAudienceLabel(item)}
                </p>
              </td>
              <td className="max-w-72 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="line-clamp-2">{item.description}</span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">{item.created}</td>
              <td className="px-4 py-3 text-xs text-slate-400">{item.expiry}</td>
              <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    disabled={item.status === 'expired' || !canUpdateNews}
                    className={`rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      item.status === 'expired'
                        ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    disabled={deletingKey === `news-${item.id}` || !isWithinDeleteWindow(item) || !canDeleteNews}
                    title={isWithinDeleteWindow(item) ? 'Delete news' : 'Delete allowed only within 24 hours'}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-900/20"
                  >
                    {deletingKey === `news-${item.id}` ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="7">
                <EmptyState icon={Newspaper} title="No news found" description="Try another status filter or create a new news item." />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
