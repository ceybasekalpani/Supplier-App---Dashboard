import { typeConfig } from '../utils/disbursementHelpers'

export default function DisbursementTabs({ issueTab, onIssueTabChange, filteredAdvances, filteredFertilizers, filteredItems }) {
  const countsByType = { advance: filteredAdvances, fertilizer: filteredFertilizers, items: filteredItems }

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon
          const count = countsByType[type].filter(row => !row.issued).length

          return (
            <button
              key={type}
              type="button"
              onClick={() => onIssueTabChange(type)}
              className={`flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                issueTab === type
                  ? 'border-green-600 bg-white text-green-700 dark:bg-slate-800 dark:text-green-300'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              {config.label} ({count})
            </button>
          )
        })}
      </div>
    </div>
  )
}
