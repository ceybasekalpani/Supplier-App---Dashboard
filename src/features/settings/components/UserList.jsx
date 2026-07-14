import { Check, ShieldCheck, Users } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import StatusBadge from '../../../components/ui/StatusBadge'

export default function UserList({ users, selectedUser, onUserSelect, loading }) {
  return (
    <div className="w-80 shrink-0 space-y-5">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <ShieldCheck size="16" className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">System Users</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a user to manage permissions</p>
        </div>
        <div className="p-2">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onUserSelect(user)}
              className={`w-full text-left p-3 rounded-lg transition-all mb-1 ${selectedUser?.id === user.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={user.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className={`font-medium text-sm truncate ${selectedUser?.id === user.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{user.name}</span>
                    {selectedUser?.id === user.id && <Check size="14" className="text-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </button>
          ))}
          {users.length === 0 && !loading && (
            <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No dashboard users found
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Users size="16" className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Selected User</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Permissions below apply only to this user</p>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30">
            <Avatar name={selectedUser?.name || ''} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedUser?.name || 'No user selected'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedUser?.email || '-'}</p>
            </div>
            {selectedUser && <StatusBadge status={selectedUser.status} />}
          </div>
        </div>
      </div>
    </div>
  )
}
