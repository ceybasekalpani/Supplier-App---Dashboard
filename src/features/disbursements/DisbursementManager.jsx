import { AlertCircle, CheckCircle2, Download, RefreshCw, Truck } from 'lucide-react'
import { useDisbursementQueue } from './hooks/useDisbursementQueue'
import Toast from './components/Toast'
import MetricCard from './components/MetricCard'
import SelectedReviewModal from './components/SelectedReviewModal'
import DisbursementTable from './components/DisbursementTable'
import DisbursementFilters from './components/DisbursementFilters'
import DisbursementTabs from './components/DisbursementTabs'
import DisbursementHeader from './components/DisbursementHeader'
import LastDeliveryNoteBanner from './components/LastDeliveryNoteBanner'

export default function DisbursementManager() {
  const q = useDisbursementQueue()

  return (
    <div className="space-y-6 p-6">
      <Toast type="success" message={q.showSuccess} />
      <Toast type="error" message={q.showError} />

      {q.queueLoading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading approved disbursement queue...
          </span>
        </div>
      )}

      {!q.queueLoading && q.queueError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Disbursement queue could not be loaded</p>
              <p className="mt-0.5 text-xs opacity-90">{q.queueError}</p>
            </div>
          </div>
        </div>
      )}

      <DisbursementHeader
        currentRowsCount={q.currentRows.length}
        canExport={q.canExport}
        onQueueReportFormat={q.handleQueueReportFormat}
        eligibleSelectedCount={q.eligibleSelectedRows.length}
        canDispatch={q.canDispatch}
        onOpenReviewModal={q.openReviewModal}
      />

      <LastDeliveryNoteBanner lastDeliveryNote={q.lastDeliveryNote} onDownload={q.downloadDeliveryNoteHtml} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Approved Queue" value={q.filteredAllRows.length} icon={Truck} className="border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <MetricCard label="Selected" value={q.selectedList.length} icon={CheckCircle2} className="border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200" />
        <MetricCard label="Eligible For DN" value={q.eligibleSelectedRows.length} icon={Download} className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200" />
        <MetricCard label="Still Pending" value={q.pendingTotalCount} icon={AlertCircle} className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-200" />
      </div>

      <DisbursementFilters
        selectedRoute={q.selectedRoute}
        onSelectedRouteChange={q.onSelectedRouteChange}
        statusFilter={q.statusFilter}
        onStatusFilterChange={q.onStatusFilterChange}
        dateFrom={q.dateFrom}
        onDateFromChange={q.onDateFromChange}
        dateTo={q.dateTo}
        onDateToChange={q.onDateToChange}
        routeOptions={q.routeOptions}
        issueTab={q.issueTab}
        advancePaymentFilter={q.advancePaymentFilter}
        onAdvancePaymentFilterChange={q.onAdvancePaymentFilterChange}
        onClearFilters={q.onClearFilters}
      />

      <DisbursementTabs
        issueTab={q.issueTab}
        onIssueTabChange={q.setIssueTab}
        filteredAdvances={q.filteredAdvances}
        filteredFertilizers={q.filteredFertilizers}
        filteredItems={q.filteredItems}
      />

      <DisbursementTable
        rows={q.currentRows}
        type={q.issueTab}
        selectedRows={q.selectedRows}
        paymentMethods={q.paymentMethods}
        issuingKey={q.issuingKey}
        canDispatch={q.canDispatch}
        onSelect={q.selectRow}
        onSelectAll={q.selectAllRows}
        onPaymentMethod={q.updatePaymentMethod}
        onIssueTransfer={q.issueBankTransfer}
      />

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">{q.issuedTotalCount}</span> records already dispatched. Only cash advances, fertilizer, and item records are saved to delivery notes; cheque, account transfer, and bank transfer payments stay outside the delivery note.
      </div>

      {q.showReview && (
        <SelectedReviewModal
          borrower={q.borrower}
          eligibleRows={q.eligibleSelectedRows}
          generating={q.generating}
          canGenerate={q.canDispatch}
          onBorrowerChange={q.onBorrowerChange}
          onClose={q.closeReviewModal}
          onGenerate={q.generateDeliveryNote}
        />
      )}
    </div>
  )
}
