import { EMPTY_DASH } from '../utils/supplierHelpers'

export default function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-700">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="min-w-0 break-all text-right text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
        {value || EMPTY_DASH}
      </span>
    </div>
  )
}
