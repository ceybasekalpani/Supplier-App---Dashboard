import { useState } from 'react'
import { Search, Check, X, User, History } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
import StatusBadge from '../components/ui/StatusBadge'
import Avatar from '../components/ui/Avatar'
import { advanceRequests, fertilizerRequests, itemRequests, leafHistory } from '../data/mockData'

function SidePanel({ req, type }) {
  if (!req) return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400">
      <Search size={32} className="mx-auto mb-2 opacity-40" />
      <p className="text-sm">Select a request to view details</p>
    </div>
  )

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={req.name} size="md" />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{req.name}</p>
          <p className="text-xs text-slate-400">{req.regNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {type === 'advance' && <>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">Amount</p>
            <p className="font-bold text-amber-600 dark:text-amber-400">Rs.{req.amount?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">Status</p>
            <StatusBadge status={req.status} />
          </div>
        </>}
        {type !== 'advance' && <>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">Type</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{req.type}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">Quantity</p>
            <p className={`font-bold text-sm ${type === 'fertilizer' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>{req.qty} {req.unit}</p>
          </div>
        </>}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Leaf History (6 months)</p>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={leafHistory} barSize={14}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Bar dataKey="kg" fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          <User size={13} /> Supplier Profile
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          <History size={13} /> Supply History
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Remarks / Notes</label>
        <textarea defaultValue={req.remarks} className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 resize-none" rows={3} placeholder="Enter remarks…" />
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
          <X size={13} /> Reject
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">
          <Check size={13} /> Approve
        </button>
      </div>
    </div>
  )
}

export default function Requests() {
  const [tab, setTab] = useState('advance')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const allData = { advance: advanceRequests, fertilizer: fertilizerRequests, items: itemRequests }
  const filtered = (allData[tab] ?? []).filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.regNo.toLowerCase().includes(search.toLowerCase()))
  )

  const tabs = ['advance', 'fertilizer', 'items']
  const filters = ['all', 'pending', 'approved', 'rejected']

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Requests</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage advance, fertilizer, and item requests</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setFilter('all'); setSelected(null) }}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 w-56">
              <Search size={14} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="bg-transparent text-sm py-2 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 w-full" />
            </div>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors border
                  ${filter === f ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {['RegNo', 'Name',
                      ...(tab === 'advance' ? ['Amount'] : ['Type', 'Qty']),
                      'Date', 'Status', 'Checked By'
                    ].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} onClick={() => setSelected(r)}
                      className={`border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors
                        ${selected?.id === r.id ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                      <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">{r.regNo}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{r.name}</td>
                      {tab === 'advance' && <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">Rs.{r.amount?.toLocaleString()}</td>}
                      {tab !== 'advance' && <><td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.type}</td><td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.qty} {r.unit}</td></>}
                      <td className="py-3 px-4 text-slate-400 text-xs">{r.date}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-4 text-slate-400">{r.checkedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="w-72 flex-shrink-0">
          <SidePanel req={selected} type={tab} />
        </div>
      </div>
    </div>
  )
}