import { Pencil, Plus, RefreshCw, Save, X } from 'lucide-react'
import { configMeta, themedAccent } from '../utils/configurationConstants'

export default function ConfigurationForm({
  tab,
  name,
  onNameChange,
  editingId,
  error,
  saving,
  canCreate,
  canUpdate,
  onSave,
  onReset,
}) {
  const meta = configMeta[tab]

  return (
    <aside id="configuration-form" className="bg-slate-50/70 dark:bg-slate-900/30 p-4">
      <div className="bg-white dark:bg-slate-800 border rounded-xl p-4 shadow-sm" style={themedAccent.border}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {editingId ? `Edit ${meta.label}` : `Register ${meta.label}`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {editingId ? 'Update the selected name.' : `Add a new ${meta.label.toLowerCase()} name.`}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={themedAccent.icon}>
            {editingId ? <Pencil size={16} /> : <Plus size={16} />}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={event => onNameChange(event.target.value)}
              placeholder={meta.placeholder}
              className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 transition-all"
              style={{
                borderColor: 'var(--theme-border)',
                '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
              }}
              autoFocus
            />
            {error && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <X size={14} />
                Clear
              </span>
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving || (editingId ? !canUpdate : !canCreate)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                ...themedAccent.button,
                '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
              }}
            >
              <span className="inline-flex items-center gap-2">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {editingId ? 'Update' : 'Save'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
