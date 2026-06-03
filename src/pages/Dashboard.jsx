import { Users, Banknote, Sprout, Package, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import Avatar from '../components/ui/Avatar'
import { chartData, activities } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Tea Factory Supplier Management Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Active Suppliers" value="142" sub="↑ 3 this month"     icon={Users}    iconBg="bg-green-100 dark:bg-green-900/40"  iconColor="text-green-600 dark:text-green-400" />
        <StatCard label="Advance Requests"        value="24"  sub="12 approved · 3 rejected" icon={Banknote} iconBg="bg-amber-100 dark:bg-amber-900/40"  iconColor="text-amber-600 dark:text-amber-400" />
        <StatCard label="Fertilizer Requests"     value="18"  sub="9 approved · 2 rejected"  icon={Sprout}   iconBg="bg-blue-100 dark:bg-blue-900/40"    iconColor="text-blue-600 dark:text-blue-400"   />
        <StatCard label="Item Requests"           value="11"  sub="7 approved · 1 rejected"  icon={Package}  iconBg="bg-purple-100 dark:bg-purple-900/40" iconColor="text-purple-600 dark:text-purple-400"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Request Status — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12, color: '#f1f5f9' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="advance"    fill="#f59e0b" radius={[4, 4, 0, 0]} name="Advance" />
              <Bar dataKey="fertilizer" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Fertilizer" />
              <Bar dataKey="items"      fill="#a855f7" radius={[4, 4, 0, 0]} name="Items" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Zap size={15} /> Quick Actions
          </p>
          <div className="space-y-2">
            {[
              { label: 'Approve Advance Payments',   count: 9,  bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: Banknote, iconCls: 'text-amber-500'  },
              { label: 'Approve Fertilizer Requests',count: 6,  bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: Sprout,   iconCls: 'text-blue-500'   },
              { label: 'Approve Item Requests',      count: 4,  bg: 'bg-purple-50 dark:bg-purple-900/20',icon: Package,  iconCls: 'text-purple-500' },
            ].map(({ label, count, bg, icon: Icon, iconCls }) => (
              <button key={label} className={`w-full flex items-center gap-3 p-3 rounded-lg ${bg} hover:opacity-80 transition text-left`}>
                <div className={`w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center ${iconCls} flex-shrink-0`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{label}</p>
                  <p className="text-[10px] text-slate-400">{count} pending</p>
                </div>
                <span className="text-xs font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Recent Activity</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                {['Supplier / User', 'Action', 'Category', 'Time', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={a.user} size="xs" />
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{a.user}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-xs">{a.action}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                      ${a.category === 'advance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : a.category === 'fertilizer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>
                      {a.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs">{a.time}</td>
                  <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}