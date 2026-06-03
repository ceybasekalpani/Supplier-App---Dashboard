import { useState } from 'react'
import { Search, ChevronDown, Package, Droplet, ShoppingBag, CheckCircle, XCircle, Clock } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Avatar from '../components/ui/Avatar'
import { suppliers, advanceRequests, fertilizerRequests, itemRequests } from '../data/mockData'

export default function Suppliers() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [requestType, setRequestType] = useState('advance') // 'advance', 'fertilizer', 'item'

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.regNo.toLowerCase().includes(search.toLowerCase()) ||
    s.route.toLowerCase().includes(search.toLowerCase())
  )

  // Get requests for selected supplier based on type
  const getRequestsForSupplier = () => {
    if (!selected) return []
    
    switch(requestType) {
      case 'advance':
        return advanceRequests.filter(req => req.regNo === selected.regNo)
      case 'fertilizer':
        return fertilizerRequests.filter(req => req.regNo === selected.regNo)
      case 'item':
        return itemRequests.filter(req => req.regNo === selected.regNo)
      default:
        return []
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={14} className="text-green-500" />
      case 'rejected':
        return <XCircle size={14} className="text-red-500" />
      default:
        return <Clock size={14} className="text-amber-500" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-600 dark:text-green-400'
      case 'rejected': return 'text-red-600 dark:text-red-400'
      default: return 'text-amber-600 dark:text-amber-400'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Supplier Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and monitor active tea leaf suppliers</p>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 w-64">
            <Search size={20} className="text-slate-400" />
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
        <div className="w-80 flex-shrink-0">
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
                {[
                  ['Phone', selected.phone], 
                  ['Address', selected.address], 
                  ['Bank', `${selected.bank} – ${selected.branch}`], 
                  ['Payment', selected.payment]
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Request History with Toggle Buttons */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Request History</p>
                
                {/* Toggle Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setRequestType('advance')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${requestType === 'advance' 
                        ? 'bg-amber-500 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    <Droplet size={14} />
                    Advance
                  </button>
                  <button
                    onClick={() => setRequestType('fertilizer')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${requestType === 'fertilizer' 
                        ? 'bg-green-500 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    <Package size={14} />
                    Fertilizer
                  </button>
                  <button
                    onClick={() => setRequestType('item')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${requestType === 'item' 
                        ? 'bg-purple-500 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    <ShoppingBag size={14} />
                    Items
                  </button>
                </div>

                {/* Request List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getRequestsForSupplier().length > 0 ? (
                    getRequestsForSupplier().map((req, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                        {requestType === 'advance' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  Rs. {req.amount?.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-400">{req.date}</p>
                              </div>
                              <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(req.status)}`}>
                                {getStatusIcon(req.status)}
                                <span className="capitalize">{req.status}</span>
                              </div>
                            </div>
                            {req.checkedBy !== '-' && (
                              <p className="text-xs text-slate-400">
                                Checked by: {req.checkedBy}
                                {req.remarks && ` • ${req.remarks}`}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {requestType === 'fertilizer' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  {req.type} - {req.qty} {req.unit}
                                </p>
                                <p className="text-xs text-slate-400">{req.date}</p>
                              </div>
                              <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(req.status)}`}>
                                {getStatusIcon(req.status)}
                                <span className="capitalize">{req.status}</span>
                              </div>
                            </div>
                            {req.checkedBy !== '-' && (
                              <p className="text-xs text-slate-400">Checked by: {req.checkedBy}</p>
                            )}
                          </div>
                        )}
                        
                        {requestType === 'item' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  {req.type} - {req.qty} {req.unit}
                                </p>
                                <p className="text-xs text-slate-400">{req.date}</p>
                              </div>
                              <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(req.status)}`}>
                                {getStatusIcon(req.status)}
                                <span className="capitalize">{req.status}</span>
                              </div>
                            </div>
                            {req.checkedBy !== '-' && (
                              <p className="text-xs text-slate-400">Checked by: {req.checkedBy}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <p className="text-sm">No {requestType} requests found</p>
                    </div>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-400">Advance</p>
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {advanceRequests.filter(r => r.regNo === selected.regNo).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Fertilizer</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {fertilizerRequests.filter(r => r.regNo === selected.regNo).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Items</p>
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {itemRequests.filter(r => r.regNo === selected.regNo).length}
                      </p>
                    </div>
                  </div>
                </div>
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