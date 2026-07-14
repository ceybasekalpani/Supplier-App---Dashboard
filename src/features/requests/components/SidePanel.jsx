import { Check, Eye, Inbox, Info, Pencil, RefreshCw, X } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { currency } from '../utils/requestsHelpers'
import Avatar from './Avatar'

export default function SidePanel({
  req,
  draft,
  statusSaving,
  canApprove,
  canReject,
  canApproveRejected,
  canRejectApproved,
  exceedsAdvanceLimit,
  advanceLimit,
  advanceLimitLoading,
  onDraftChange,
  onApprove,
  onReject,
  onOpenSupplier,
}) {
  if (!req) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-55 shadow-sm">
        <Inbox size={28} className="mb-2 opacity-40" />
        <p className="text-sm">Select a request to view details</p>
      </div>
    )
  }

  const canEdit = req.status === 'pending' || req.status === 'rejected'
  const canApproveRequest = req.status === 'pending'
    ? canApprove
    : req.status === 'rejected'
      ? canApproveRejected
      : false
  const canRejectRequest = req.status === 'pending'
    ? canReject
    : req.status === 'approved'
      ? canRejectApproved
      : false
  const canShowActions = canApproveRequest || canRejectRequest
  const blockApproveForLimit = canApproveRequest && exceedsAdvanceLimit

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-sm sticky top-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <Avatar name={req.name} />

        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{req.name || 'Supplier'}</p>
          <p className="text-xs text-slate-400">{req.regNo} / {req.date}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenSupplier(req.regNo)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
      >
        <Eye size={14} /> Supplier Details
      </button>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Status</p>
          <StatusBadge status={req.status} />
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Date</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{req.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Request No</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{req.requestNo || '-'}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 mb-1">Checked By</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{req.checkedBy || '-'}</p>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <Pencil size={14} className="text-green-700 shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-300">
            Only remarks can be edited for pending and rejected requests.
          </p>
        </div>
      )}

      {(!canApprove || !canReject) && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>Approve, reject, and status-reversal actions depend on your assigned request permissions.</p>
        </div>
      )}

      {advanceLimitLoading && req.status === 'pending' && (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-700/40 dark:text-slate-400">
          <RefreshCw size={13} className="animate-spin" />
          Checking maximum advance limit...
        </div>
      )}

      {blockApproveForLimit && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/15 dark:text-red-300">
          <X size={14} className="mt-0.5 shrink-0" />
          <p>
            Requested amount ({currency(req.amount)}) exceeds this supplier&apos;s maximum advance limit of{' '}
            <strong className="font-semibold">{currency(advanceLimit)}</strong>. This request cannot be approved.
          </p>
        </div>
      )}

      <div>
        <label className="block">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Remarks</span>

          <textarea
            value={draft.remarks ?? ''}
            disabled={!canEdit}
            onChange={event => onDraftChange('remarks', event.target.value)}
            rows={4}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-70 focus:border-green-500"
            placeholder="Add review remarks"
          />
        </label>
      </div>

      {canShowActions ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={statusSaving || !canRejectRequest}
            onClick={() => onReject(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={13} /> Reject
          </button>

          <button
            type="button"
            disabled={statusSaving || !canApproveRequest || blockApproveForLimit}
            onClick={() => onApprove(req.id)}
            title={blockApproveForLimit ? 'Exceeds maximum advance limit' : undefined}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-green-700 text-white hover:bg-green-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={13} /> Approve
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-md">
          <Info size={14} className="text-green-600 mt-0.5 shrink-0" />

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This request is <strong className="font-semibold capitalize">{req.status}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
