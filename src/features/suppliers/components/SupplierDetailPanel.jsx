import { RefreshCw, Search } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatDisplayDate } from '../../../utils/formatters'
import { EMPTY_DASH, REQUEST_TYPES, getRequestTitle } from '../utils/supplierHelpers'
import InfoRow from './InfoRow'
import SummaryPill from './SummaryPill'

export default function SupplierDetailPanel({
  selected,
  detailLoading,
  counts,
  requestType,
  onRequestTypeChange,
  selectedRequests,
}) {
  if (!selected) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900">
          <Search size={24} />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">Select a supplier</p>
        <p className="mt-1 text-sm text-slate-400">Supplier profile and database request history will appear here.</p>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <Avatar name={selected.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-lg font-bold text-slate-900 dark:text-white">{selected.name}</p>
              {detailLoading && <RefreshCw size={15} className="animate-spin text-slate-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-400">{selected.regNo} / {selected.route || 'No route'}</p>
            <div className="mt-2">
              <StatusBadge status={selected.status} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryPill label="Advance" value={counts.advance} tone="amber" />
          <SummaryPill label="Fertilizer" value={counts.fertilizer} tone="green" />
          <SummaryPill label="Items" value={counts.item} tone="teal" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Supplier Details</p>
        <div className="space-y-1">
          <InfoRow label="Phone" value={selected.phone} />
          <InfoRow label="Other Phone" value={[selected.phone2, selected.phone3].filter(Boolean).join(', ')} />
          <InfoRow label="Address" value={selected.address} />
          <InfoRow label="Payment" value={selected.payment} />
          <InfoRow label="Bank" value={selected.bank} />
          <InfoRow label="Branch" value={selected.branch} />
          <InfoRow label="Account" value={selected.accountNo} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Request History</p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {REQUEST_TYPES.map(type => {
            const Icon = type.icon
            const active = requestType === type.id

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onRequestTypeChange(type.id)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                  active
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <Icon size={14} />
                {type.label}
              </button>
            )
          })}
        </div>

        <div className="max-h-104 space-y-2 overflow-y-auto pr-1">
          {selectedRequests.length > 0 ? (
            selectedRequests.map(request => (
              <div key={`${requestType}-${request.id}-${request.date}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{getRequestTitle(request, requestType)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {request.requestNo ? `${request.requestNo} / ` : ''}{formatDisplayDate(request.date)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="mt-3 grid gap-2 rounded-md bg-white p-2 text-xs dark:bg-slate-800">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Checked by</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{request.checkedBy || EMPTY_DASH}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Remarks</span>
                    <span className="max-w-52 text-right font-semibold text-slate-600 dark:text-slate-300">{request.remarks || EMPTY_DASH}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
              No {REQUEST_TYPES.find(type => type.id === requestType)?.label.toLowerCase()} requests in this period.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
