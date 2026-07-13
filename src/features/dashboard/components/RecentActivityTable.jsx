import { useMemo, useState } from 'react'
import Combobox from '../../../components/ui/Combobox'
import StatusBadge from '../../../components/ui/StatusBadge'

export default function RecentActivityTable({ activities }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const safeActivities = useMemo(() => (
    Array.isArray(activities) ? activities : []
  ), [activities])

  const typeOptions = useMemo(() => (
    Array.from(new Set(safeActivities.map(activity => activity.category).filter(Boolean))).sort()
  ), [safeActivities])

  const statusOptions = useMemo(() => (
    Array.from(new Set(safeActivities.map(activity => activity.status).filter(Boolean))).sort()
  ), [safeActivities])

  const filteredActivities = safeActivities.filter(activity => {
    const matchesType = typeFilter === 'all' || activity.category === typeFilter
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter

    return matchesType && matchesStatus
  })

  const typeFilterOptions = [
    { value: 'all', label: 'All types' },
    ...typeOptions.map(type => ({ value: type, label: type })),
  ]
  const statusFilterOptions = [
    { value: 'all', label: 'All status' },
    ...statusOptions.map(status => ({ value: status, label: status })),
  ]

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 p-5 border-b border-slate-100 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest supplier and admin actions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Combobox
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeFilterOptions}
            className="min-w-32"
            buttonClassName="px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
          />

          <Combobox
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusFilterOptions}
            className="min-w-32"
            buttonClassName="px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">User</th>
              <th className="px-5 py-3 text-left font-semibold">Activity</th>
              <th className="px-5 py-3 text-left font-semibold">Type</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredActivities.map((activity) => (
              <tr key={`${activity.user}-${activity.action}-${activity.time}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{activity.user}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{activity.action}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400 capitalize">{activity.category}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={activity.status} />
                </td>
                <td className="px-5 py-3 text-left text-slate-500 dark:text-slate-400">{activity.time}</td>
              </tr>
            ))}
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  No recent activity matches the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
