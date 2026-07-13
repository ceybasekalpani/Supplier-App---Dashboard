import { Leaf, Send } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'

export default function DisbursementHeader({
  currentRowsCount,
  canExport,
  onQueueReportFormat,
  eligibleSelectedCount,
  canDispatch,
  onOpenReviewModal,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-700">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate delivery notes for cash, fertilizer, and item dispatches</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Combobox
          value=""
          onChange={onQueueReportFormat}
          disabled={currentRowsCount === 0 || !canExport}
          placeholder="Download Report"
          options={[
            { value: 'pdf', label: 'PDF' },
            { value: 'doc', label: 'DOC' },
          ]}
          className="min-w-44"
          buttonClassName="bg-white dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={onOpenReviewModal}
          disabled={eligibleSelectedCount === 0 || !canDispatch}
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          Generate Delivery Note ({eligibleSelectedCount})
        </button>
      </div>
    </div>
  )
}
