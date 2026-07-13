import { ArrowRight, Banknote, Package, Sprout, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ACTION_STYLES = {
  advance: {
    icon: Banknote,
    title: 'Advance Requests',
    description: 'Review pending advance payments',
    color: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-900/40',
    count: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  fertilizer: {
    icon: Sprout,
    title: 'Fertilizer Requests',
    description: 'Review pending fertilizer issues',
    color: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-900/40',
    count: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  item: {
    icon: Package,
    title: 'Item Requests',
    description: 'Review pending item approvals',
    color: 'text-teal-700 dark:text-teal-300',
    iconBg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-900/40',
    count: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
  items: {
    icon: Package,
    title: 'Item Requests',
    description: 'Review pending item approvals',
    color: 'text-teal-700 dark:text-teal-300',
    iconBg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-900/40',
    count: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
}

const normalizeQueueKey = (value) => {
  const key = String(value || '').trim().toLowerCase()

  if (key === 'advance') return 'advance'
  if (key === 'fertilizer') return 'fertilizer'
  if (key === 'item' || key === 'items') return 'items'

  return key
}

export default function QuickActionsPanel({ queue = [] }) {
  const navigate = useNavigate()
  const safeQueue = Array.isArray(queue) ? queue : []

  const totalPending = safeQueue.reduce((total, item) => (
    total + Number(item?.pending || 0)
  ), 0)

  const openRequestQueue = (tab) => {
    const normalizedTab = normalizeQueueKey(tab)

    if (!normalizedTab) return

    navigate(`/requests?tab=${normalizedTab}&filter=pending`)
  }

  const openAllRequests = () => {
    navigate('/requests')
  }

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={17} className="text-amber-500" />
            Quick Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Open the pending approval queues.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {totalPending} pending
        </span>
      </div>

      <div className="space-y-2.5">
        {safeQueue.map((item) => {
          const key = normalizeQueueKey(item?.id || item?.key)
          const style = ACTION_STYLES[key]

          if (!style) return null

          const Icon = style.icon

          return (
            <button
              key={key}
              type="button"
              onClick={() => openRequestQueue(key)}
              className={`w-full rounded-lg border bg-white p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 ${style.border}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconBg}`}>
                  <Icon size={18} className={style.color} />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{style.title}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{style.description}</span>
                </span>

                <span className={`rounded-full px-2 py-1 text-xs font-bold ${style.count}`}>
                  {Number(item?.pending || 0)}
                </span>
                <ArrowRight size={15} className="text-slate-400" />
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={openAllRequests}
        className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-900"
      >
        View All Requests
      </button>
    </section>
  )
}
