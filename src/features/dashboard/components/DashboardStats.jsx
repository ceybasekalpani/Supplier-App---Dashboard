import { Banknote, CheckCircle2, Clock, Leaf, Package, Sprout, Users, XCircle } from 'lucide-react'

const CARD_STYLES = {
  advance: {
    icon: Banknote,
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    ring: 'border-amber-200 dark:border-amber-900/40',
    header: 'text-amber-700 dark:text-amber-300',
  },
  fertilizer: {
    icon: Sprout,
    accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    ring: 'border-emerald-200 dark:border-emerald-900/40',
    header: 'text-emerald-700 dark:text-emerald-300',
  },
  items: {
    icon: Package,
    accent: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
    ring: 'border-teal-200 dark:border-teal-900/40',
    header: 'text-teal-700 dark:text-teal-300',
  },
}

const KPI_STYLES = {
  green: {
    icon: Users,
    accent: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    ring: 'border-green-200 dark:border-green-900/40',
    header: 'text-green-700 dark:text-green-300',
  },
  amber: {
    icon: Clock,
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    ring: 'border-amber-200 dark:border-amber-900/40',
    header: 'text-amber-700 dark:text-amber-300',
  },
  teal: {
    icon: Leaf,
    accent: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
    ring: 'border-teal-200 dark:border-teal-900/40',
    header: 'text-teal-700 dark:text-teal-300',
  },
  slate: {
    icon: CheckCircle2,
    accent: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
    ring: 'border-slate-200 dark:border-slate-700',
    header: 'text-slate-700 dark:text-slate-300',
  },
}

const statusItems = [
  { key: 'approved', label: 'Approved', icon: CheckCircle2, className: 'text-green-700 dark:text-green-300' },
  { key: 'pending', label: 'Pending', icon: Clock, className: 'text-amber-700 dark:text-amber-300' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, className: 'text-red-600 dark:text-red-300' },
]

export default function DashboardStats({ stats }) {
  const isBackendKpiShape = stats.some(item => item.value !== undefined)

  if (isBackendKpiShape) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const style = KPI_STYLES[item.tone] || KPI_STYLES.slate
          const Icon = style.icon

          return (
            <section
              key={item.id || item.key || item.label}
              className={`bg-white dark:bg-slate-800 border ${style.ring} rounded-xl p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${style.header}`}>{item.label}</p>
                  <p className="mt-2 wrap-break-word text-3xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
                <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${style.accent}`}>
                  <Icon size={19} />
                </div>
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((item) => {
        const style = CARD_STYLES[item.id]
        const Icon = style.icon

        return (
          <section
            key={item.id}
            className={`bg-white dark:bg-slate-800 border ${style.ring} rounded-xl p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${style.header}`}>{item.label} </p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{item.total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total request count</p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${style.accent}`}>
                <Icon size={19} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {statusItems.map((status) => {
                const StatusIcon = status.icon

                return (
                  <div key={status.key} className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5">
                    <div className={`flex items-center gap-1.5 ${status.className}`}>
                      <StatusIcon size={13} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">{status.label}</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{item[status.key]}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
