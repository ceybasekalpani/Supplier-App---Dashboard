const variants = {
  pending:   'bg-amber-100   text-amber-800   dark:bg-amber-900/40  dark:text-amber-300',
  approved:  'bg-green-100   text-green-800   dark:bg-green-900/40  dark:text-green-300',
  rejected:  'bg-red-100     text-red-800     dark:bg-red-900/40    dark:text-red-300',
  active:    'bg-green-100   text-green-800   dark:bg-green-900/40  dark:text-green-300',
  inactive:  'bg-slate-100   text-slate-600   dark:bg-slate-700     dark:text-slate-400',
  draft:     'bg-blue-100    text-blue-800    dark:bg-blue-900/40   dark:text-blue-300',
  expired:   'bg-red-100     text-red-800     dark:bg-red-900/40    dark:text-red-300',
  delivered: 'bg-teal-100    text-teal-800    dark:bg-teal-900/40   dark:text-teal-300',
  failed:    'bg-red-100     text-red-800     dark:bg-red-900/40    dark:text-red-300',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${variants[status] ?? variants.inactive}`}>
      {status}
    </span>
  )
}