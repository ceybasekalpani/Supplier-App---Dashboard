import { useState } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import Avatar from '../components/ui/Avatar'
import Toggle from '../components/ui/Toggle'
import { roles, adminUsers } from '../data/mockData'
import {
  LayoutDashboard, Users, FileText, Settings2,
  MessageCircle, UserCheck, SlidersHorizontal
} from 'lucide-react'

const pageIcons = {
  dashboard: LayoutDashboard, suppliers: Users, requests: FileText,
  configurations: Settings2, communication: MessageCircle,
  userManagement: UserCheck, settings: SlidersHorizontal,
}
const pageLabels = {
  dashboard: 'Dashboard', suppliers: 'Suppliers', requests: 'Requests',
  configurations: 'Configurations', communication: 'Communication',
  userManagement: 'User Management', settings: 'Settings',
}

export default function Settings() {
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [perms, setPerms] = useState({ ...roles[0].permissions })

  const selectRole = (r) => { setSelectedRole(r); setPerms({ ...r.permissions }) }
  const toggle = (p) => setPerms(prev => ({ ...prev, [p]: !prev[p] }))
  const pages = Object.keys(pageLabels)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure roles and access permissions</p>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-4">
          {/* Role list */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Roles</p>
            {roles.map(r => (
              <button key={r.id} onClick={() => selectRole(r)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left
                  ${selectedRole.id === r.id
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}>
                <span className={`font-semibold text-sm ${selectedRole.id === r.id ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>{r.name}</span>
                <span className="text-xs text-slate-400">{Object.values(r.permissions).filter(Boolean).length} / {pages.length} access</span>
              </button>
            ))}
          </div>

          {/* Users with this role */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Users — {selectedRole.name}</p>
            <div className="space-y-2">
              {adminUsers.filter(u => u.role === selectedRole.name).map(u => (
                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
              ))}
              {adminUsers.filter(u => u.role === selectedRole.name).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">No users with this role</p>
              )}
            </div>
          </div>
        </div>

        {/* Permissions editor */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Permissions</p>
            <p className="text-xs text-slate-400 mt-0.5">{selectedRole.name} — select module access</p>
          </div>
          <div className="space-y-2">
            {pages.map(p => {
              const Icon = pageIcons[p]
              return (
                <div key={p}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors
                    ${perms[p] ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'}`}>
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={perms[p] ? 'text-green-500' : 'text-slate-400'} />
                    <span className={`text-sm font-medium ${perms[p] ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{pageLabels[p]}</span>
                  </div>
                  <Toggle checked={perms[p]} onChange={() => toggle(p)} />
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setPerms({ ...selectedRole.permissions })}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Reset</button>
            <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}