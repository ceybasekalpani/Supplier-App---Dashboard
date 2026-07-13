import { Eye, EyeOff, KeyRound, Pencil, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Combobox from '../../../components/ui/Combobox'
import StatusBadge from '../../../components/ui/StatusBadge'
import { focusNextFieldOnEnter } from '../../../utils/keyboardNav'

export default function UserTable({
  users,
  loading,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  currentAdmin,
  visiblePasswordUserId,
  onToggleVisiblePassword,
  canUpdateUser,
  canDeleteUser,
  canAssignPermissions,
  onEdit,
  onRequestDelete,
}) {
  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 justify-between items-center" onKeyDown={focusNextFieldOnEnter}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, email or username..." value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} className="pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
        </div>
        <div className="flex gap-2">
          <Combobox
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            className="min-w-36"
            buttonClassName="border-slate-300 bg-white py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500">
            <RefreshCw size={15} className="animate-spin" />
            Loading dashboard users...
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrator</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" src={user.profileImage || user.avatar} fallbackSrc={user.avatarFallback} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>
                      {user.phoneNo && <p className="text-xs text-slate-400 mt-0.5">{user.phoneNo}</p>}
                      {currentAdmin?.isSuperAdmin && user.password && (
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          <KeyRound size={11} />
                          <span className="font-mono">{visiblePasswordUserId === user.id ? user.password : '********'}</span>
                          <button
                            type="button"
                            onClick={() => onToggleVisiblePassword(user.id)}
                            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title={visiblePasswordUserId === user.id ? 'Hide password' : 'Show password'}
                          >
                            {visiblePasswordUserId === user.id ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4"><StatusBadge status={user.status} /></td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(user)} disabled={!canUpdateUser} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"><Pencil size={14} /></button>
                    {canAssignPermissions && (
                      <Link to={`/settings?userId=${user.id}`} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Manage permissions">
                        <ShieldCheck size={14} />
                      </Link>
                    )}
                    <button onClick={() => onRequestDelete(user.id)} disabled={!canDeleteUser} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="3" className="py-12 text-center text-slate-500 dark:text-slate-400">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
