import { Pencil, Trash2, Camera } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Avatar from '../components/ui/Avatar'
import { adminUsers, roles } from '../data/mockData'

export default function UserManagement() {
  const activeCount = adminUsers.filter(u => u.status === 'active').length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage administrators and access roles</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ l: 'Total Admins', v: adminUsers.length, c: 'text-slate-900 dark:text-white' },
          { l: 'Active', v: activeCount, c: 'text-green-600 dark:text-green-400' },
          { l: 'Inactive', v: adminUsers.length - activeCount, c: 'text-red-600 dark:text-red-400' }].map(s => (
          <div key={s.l} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">{s.l}</p>
            <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                {['Administrator', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{u.role}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                    <td className="py-3 px-4"><div className="flex gap-1">
                      <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"><Pencil size={12} /></button>
                      <button className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create User</p>
          <div className="flex justify-center">
            <button className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-green-400 hover:text-green-500 transition-colors">
              <Camera size={22} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[['Full Name', 'text', 'John Doe'], ['Email', 'email', 'email@factory.lk'], ['Username', 'text', 'username'], ['Password', 'password', '••••••'], ['Phone No', 'tel', '+94 77 000 0000']].map(([l, type, ph]) => (
              <div key={l} className={l === 'Full Name' || l === 'Email' ? 'col-span-2' : ''}>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">{l}</label>
                <input type={type} placeholder={ph} className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Role</label>
              <select className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400">
                {roles.map(r => <option key={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Discard</button>
            <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}