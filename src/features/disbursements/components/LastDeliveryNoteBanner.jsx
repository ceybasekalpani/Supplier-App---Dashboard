import { Download } from 'lucide-react'

export default function LastDeliveryNoteBanner({ lastDeliveryNote, onDownload }) {
  if (!lastDeliveryNote) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm dark:border-green-900/50 dark:bg-green-900/10">
      <div>
        <p className="text-sm font-bold text-green-900 dark:text-green-200">Generated {lastDeliveryNote.deliveryNoteNo}</p>
        <p className="text-xs text-green-700 dark:text-green-300">{lastDeliveryNote.totalRecords} records dispatched to delivery note tracking</p>
      </div>
      <button
        type="button"
        onClick={() => onDownload(lastDeliveryNote.id)}
        className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-xs font-semibold text-green-800 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-slate-800 dark:text-green-200 dark:hover:bg-green-900/20"
      >
        <Download size={14} />
        Download Delivery Note
      </button>
    </div>
  )
}
