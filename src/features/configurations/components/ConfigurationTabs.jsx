import { configMeta } from '../utils/configurationConstants'
import { themedAccent } from '../utils/configurationConstants'

export default function ConfigurationTabs({ tab, onTabChange, fertilizerList, itemList }) {
  const meta = configMeta[tab]
  const TypeIcon = meta.icon
  const items = tab === 'fertilizer' ? fertilizerList : itemList

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-2 rounded-lg bg-slate-100 dark:bg-slate-900 p-1 w-fit">
        {Object.entries(configMeta).map(([key, item]) => {
          const Icon = item.icon
          const isActive = tab === key
          const list = key === 'fertilizer' ? fertilizerList : itemList

          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors hover:bg-white dark:hover:bg-slate-800"
              style={isActive ? themedAccent.button : { color: 'var(--theme-textSecondary)' }}
            >
              <Icon size={15} />
              {item.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {list.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={themedAccent.icon}>
          <TypeIcon size={17} />
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{meta.plural}</p>
          <p className="text-xs">{items.length} registered names</p>
        </div>
      </div>
    </div>
  )
}
