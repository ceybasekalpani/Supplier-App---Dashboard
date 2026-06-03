import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Toggle from '../components/ui/Toggle'
import { newsItems, notifications } from '../data/mockData'

export default function Communication() {
  const [tab, setTab] = useState('news')
  const [newsFilter, setNewsFilter] = useState('all')
  const [active, setActive] = useState(true)
  const filtered = newsItems.filter(n => newsFilter === 'all' || n.status === newsFilter)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Communication</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage news and notifications for suppliers</p>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit">
        {['news', 'notifications'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'news' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {['all', 'active', 'draft', 'expired'].map(f => (
              <button key={f} onClick={() => setNewsFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors
                  ${newsFilter === f ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                    {['Title', 'Description', 'Created', 'Expiry', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered.map(n => (
                      <tr key={n.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 max-w-[140px] truncate">{n.title}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs max-w-[160px] truncate">{n.description}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{n.created}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{n.expiry}</td>
                        <td className="py-3 px-4"><StatusBadge status={n.status} /></td>
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
            <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create News</p>
              {[['News Title', 'text', 'Enter title…'], ['Message Content', 'textarea', 'Enter message…'], ['Expiry Date', 'date', '']].map(([l, type, ph]) => (
                <div key={l}>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">{l}</label>
                  {type === 'textarea'
                    ? <textarea rows={3} placeholder={ph} className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 resize-none" />
                    : <input type={type} placeholder={ph} className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" />
                  }
                </div>
              ))}
              <Toggle checked={active} onChange={e => setActive(e.target.checked)} label="Publish immediately" />
              <div className="flex gap-2 pt-1">
                <button className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Discard</button>
                <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">Send News</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="flex gap-4 items-start">
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Title', 'Message', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {notifications.map(n => (
                    <tr key={n.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{n.title}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs max-w-[200px] truncate">{n.message}</td>
                      <td className="py-3 px-4"><StatusBadge status={n.status} /></td>
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
          <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Send Notification</p>
            {[['Title', 'text', 'Enter title…'], ['Message', 'textarea', 'Enter message…'], ['Schedule', 'datetime-local', '']].map(([l, type, ph]) => (
              <div key={l}>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">{l}</label>
                {type === 'textarea'
                  ? <textarea rows={3} placeholder={ph} className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 resize-none" />
                  : <input type={type} placeholder={ph} className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" />
                }
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">Discard</button>
              <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}