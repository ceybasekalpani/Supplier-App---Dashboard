import StatusBadge from '../ui/StatusBadge'

export default function RecentActivityTable({ activities }) {
  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Latest supplier and admin actions.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">User</th>
              <th className="px-5 py-3 text-left font-semibold">Activity</th>
              <th className="px-5 py-3 text-left font-semibold">Type</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.map((activity) => (
              <tr key={`${activity.user}-${activity.action}-${activity.time}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{activity.user}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{activity.action}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400 capitalize">{activity.category}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={activity.status} />
                </td>
                <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
