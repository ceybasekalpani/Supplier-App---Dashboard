import { Activity } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const series = [
  { key: 'advance', label: 'Advance', color: '#f59e0b' },
  { key: 'fertilizer', label: 'Fertilizer', color: '#16a34a' },
  { key: 'items', label: 'Items', color: '#0284c7' },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex min-w-32 items-center justify-between gap-5 text-xs">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MonthlyRequestChart({ data }) {
  return (
    <section className="min-w-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={17} className="text-slate-400" />
            Monthly Request Volume
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Advance, fertilizer, and item request trend.</p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {series.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="h-72 min-h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288} debounce={50}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={7}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
            {series.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                fill={item.color}
                radius={[7, 7, 0, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
