import { RefreshCw } from 'lucide-react'
import { tabActiveClass, tabs } from '../utils/requestsHelpers'

export default function RequestsTabsBar({ tab, onTabChange, requestLoading, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit shadow-sm">
        {tabs.map(tabItem => {
          const Icon = tabItem.icon

          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => onTabChange(tabItem.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                tab === tabItem.id
                  ? tabActiveClass[tabItem.id]
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={15} />
              {tabItem.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <RefreshCw size={16} className={requestLoading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}
