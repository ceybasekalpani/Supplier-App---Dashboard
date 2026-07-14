import {
  CheckSquare, ChevronDown, ChevronRight, Key, RefreshCw,
  RotateCcw, Save, ShieldCheck, Square,
} from 'lucide-react'
import { moduleIconMap } from '../utils/settingsConstants'

export default function PermissionsMatrix({
  selectedUser,
  modules,
  modulePermissions,
  subPermissions,
  expandedModules,
  hasChanges,
  saving,
  onToggleModulePermission,
  onToggleSubPermission,
  onSelectAllSubPermissions,
  onDeselectAllSubPermissions,
  onToggleExpandModule,
  onReset,
  onSave,
}) {
  const enabledModulesCount = Object.values(modulePermissions).filter(Boolean).length
  const totalModules = modules.length
  const totalSubPermissionsEnabled = Object.values(subPermissions).reduce((acc, curr) => acc + curr.length, 0)
  const totalSubPermissionsAvailable = modules.reduce((acc, module) => acc + (module.subPermissions?.length || 0), 0)

  return (
    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Key size="16" className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Granular Permissions</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Configure access for <span className="font-medium text-emerald-600 dark:text-emerald-400">{selectedUser?.name || 'a selected user'}</span>
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{enabledModulesCount}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">/{totalModules} modules</span>
            </div>
            <div className="pl-4 border-l border-slate-300 dark:border-slate-600">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalSubPermissionsEnabled}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">/{totalSubPermissionsAvailable} actions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {modules.map(module => {
          const isModuleEnabled = modulePermissions[module.id]
          const Icon = moduleIconMap[module.id] || ShieldCheck
          const isExpanded = expandedModules[module.id]
          const subPerms = module.subPermissions || []
          const enabledSubs = subPermissions[module.id] || []
          const enabledCount = enabledSubs.length
          const totalCount = subPerms.length

          return (
            <div key={module.id} className="transition-colors">
              <div className={`p-5 ${isModuleEnabled ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => onToggleExpandModule(module.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                      {isExpanded ? <ChevronDown size="18" className="text-slate-500" /> : <ChevronRight size="18" className="text-slate-500" />}
                    </button>
                    <div className={`p-2 rounded-lg ${isModuleEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      <Icon size="18" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${isModuleEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{module.label}</h4>
                        {totalCount > 0 && isModuleEnabled && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            {enabledCount}/{totalCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{module.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleModulePermission(module.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isModuleEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isModuleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {isExpanded && subPerms.length > 0 && (
                <div className="pl-12 pr-5 pb-5 pt-0 bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-700/30">
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Granular Actions</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectAllSubPermissions(module.id)}
                          disabled={!isModuleEnabled}
                          className={`text-xs px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                            isModuleEnabled
                              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              : 'text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <CheckSquare size="12" /> Select All
                        </button>
                        <button
                          onClick={() => onDeselectAllSubPermissions(module.id)}
                          disabled={!isModuleEnabled}
                          className={`text-xs px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                            isModuleEnabled
                              ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                              : 'text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Square size="12" /> Deselect All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subPerms.map(sub => {
                        const isEnabled = enabledSubs.includes(sub.id)
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onToggleSubPermission(module.id, sub.id)}
                            className={`flex items-start gap-3 p-2 rounded-lg text-left transition-all ${
                              isEnabled
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700/40 border border-transparent'
                            } ${!isModuleEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={!isModuleEnabled}
                          >
                            {isEnabled ? (
                              <CheckSquare size="16" className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            ) : (
                              <Square size="16" className="text-slate-400 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className={`text-sm font-medium ${isEnabled ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {sub.label}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{sub.description}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center flex-wrap gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">{selectedUser?.name || 'Selected user'}</span> has access to {enabledModulesCount} modules with {totalSubPermissionsEnabled} granular actions
          {hasChanges && <span className="ml-2 font-semibold text-amber-600 dark:text-amber-400">Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={!selectedUser || saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size="14" /> Reset
          </button>
          <button
            onClick={onSave}
            disabled={!selectedUser || saving || !hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <RefreshCw size="14" className="animate-spin" /> : <Save size="14" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
