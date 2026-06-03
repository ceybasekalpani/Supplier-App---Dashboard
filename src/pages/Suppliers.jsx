import { useState } from 'react'
import { Search } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Avatar from '../components/ui/Avatar'
import { suppliers } from '../data/mockData'

export default function Suppliers() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.regNo.toLowerCase().includes(search.toLowerCase()) ||
    s.route.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Suppliers</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage all registered tea leaf suppliers</p>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 w-64">
            <Search size={15} className="text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by RegNo, Name, Route…"
              className="bg-transparent text-sm py-2 outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 w-full"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {['RegNo', 'Name', 'Route', 'Phone', 'Address', 'Bank', 'Payment', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className={`border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors
                        ${selected?.id === s.id ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                    >
                      <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">{s.regNo}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={s.name} size="xs" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{s.route}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{s.phone}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{s.address}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{s.bank}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{s.payment}</td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="w-72 flex-shrink-0">
          {selected ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.name} size="md" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selected.name}</p>
                  <p className="text-xs text-slate-400">{selected.regNo} · {selected.route}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
                {[['Phone', selected.phone], ['Address', selected.address], ['Bank', `${selected.bank} – ${selected.branch}`], ['Payment', selected.payment]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Request History</p>
                {[['Advance', 3, 'text-amber-500'], ['Fertilizer', 2, 'text-blue-500'], ['Items', 1, 'text-purple-500']].map(([l, c, cls]) => (
                  <div key={l} className="flex justify-between text-sm py-1">
                    <span className="text-slate-400">{l} Requests</span>
                    <span className={`font-bold ${cls}`}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Select a supplier to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}