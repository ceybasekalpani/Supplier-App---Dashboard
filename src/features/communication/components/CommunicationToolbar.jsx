import { RefreshCw, Trash2 } from 'lucide-react'
import { countStatus, newsFilters, notificationFilters, tabs, themedPrimary } from '../utils/communicationHelpers'
import FilterButton from './FilterButton'

export default function CommunicationToolbar({
  tab,
  onTabChange,
  loading,
  onRefresh,
  selectedNewsIds,
  selectedNotifIds,
  deletingKey,
  onBulkDeleteNews,
  onBulkDeleteNotifications,
  newsFilter,
  notifFilter,
  newsItems,
  notifications,
  onNewsFilterChange,
  onNotifFilterChange,
}) {
  const selectedCount = tab === 'news' ? selectedNewsIds.length : selectedNotifIds.length

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
        {tabs.map(item => {
          const Icon = item.icon
          const isActive = tab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors"
              style={isActive ? themedPrimary : { color: 'var(--theme-textSecondary)' }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={tab === 'news' ? onBulkDeleteNews : onBulkDeleteNotifications}
            disabled={deletingKey === 'news-bulk' || deletingKey === 'notification-bulk'}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
          >
            {(deletingKey === 'news-bulk' || deletingKey === 'notification-bulk') ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Delete Selected ({selectedCount})
          </button>
        )}
        {(tab === 'news' ? newsFilters : notificationFilters).map(filter => (
          <FilterButton
            key={filter}
            filter={filter}
            activeFilter={tab === 'news' ? newsFilter : notifFilter}
            count={countStatus(tab === 'news' ? newsItems : notifications, filter)}
            onClick={() => {
              if (tab === 'news') {
                onNewsFilterChange(filter)
              } else {
                onNotifFilterChange(filter)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
