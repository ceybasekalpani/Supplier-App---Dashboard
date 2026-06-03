import { useState } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import Toggle from '../components/ui/Toggle'
import { fertilizerTypes, itemTypes } from '../data/mockData'
import { Pencil } from 'lucide-react'

export default function Configurations() {
  const [tab, setTab] = useState('fertilizer')
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [active, setActive] = useState(true)
  const items = tab === 'fertilizer' ? fertilizerTypes : itemTypes
  const activeCount = items.filter(i => i.status === 'active').length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configurations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage fertilizer types and items</p>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit">
        {['fertilizer', 'items'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ l: `Total ${tab} types`, v: items.length, c: 'text-slate-900 dark:text-white' },
          { l: 'Active', v: activeCount, c: 'text-green-600 dark:text-green-400' },
          { l: 'Inactive', v: items.length - activeCount, c: 'text-red-600 dark:text-red-400' }].map(s => (
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
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Type Name', 'Quantity', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{i.name}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{i.qty}</td>
                    <td className="py-3 px-4"><StatusBadge status={i.status} /></td>
                    <td className="py-3 px-4">
                      <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <Pencil size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create {tab === 'fertilizer' ? 'Fertilizer' : 'Item'} Type</p>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name…" className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Quantity</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Status</label>
            <Toggle checked={active} onChange={e => setActive(e.target.checked)} label={active ? 'Active' : 'Inactive'} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => { setName(''); setQty(''); setActive(true) }} className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Discard</button>
            <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}