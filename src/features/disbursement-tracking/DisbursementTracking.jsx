import { Leaf, RefreshCw } from 'lucide-react'
import { useDisbursementTrackingData } from './hooks/useDisbursementTrackingData'
import Toast from './components/Toast'
import StatCards from './components/StatCards'
import ReportToolbar from './components/ReportToolbar'
import FiltersBar from './components/FiltersBar'
import Tabs from './components/Tabs'
import AdvanceReceiptTable from './components/AdvanceReceiptTable'
import BorrowerDispatchTable from './components/BorrowerDispatchTable'
import BorrowerSummaryTable from './components/BorrowerSummaryTable'
import SupplierReceiptTable from './components/SupplierReceiptTable'
import TrackingDetailsModal from './components/TrackingDetailsModal'

export default function DisbursementTracking() {
  const t = useDisbursementTrackingData()

  return (
    <div className="space-y-6 p-6">
      <Toast type="success" message={t.showSuccess} />
      <Toast type="error" message={t.showError} />

      {(t.trackingLoading || t.deliveryLoading) && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading disbursement tracking records...
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-700">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Tracking</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a borrower first, review the selected disbursement category, then confirm supplier receipts
            </p>
          </div>
        </div>

        <ReportToolbar
          filteredRowsCount={t.filteredRows.length}
          borrowerGroupsCount={t.borrowerDispatchGroups.length}
          onTypeReportFormat={t.handleTypeReportFormat}
          onPaymentReportFormat={t.handlePaymentReportFormat}
          onStoreReleaseReportFormat={t.handleStoreReleaseReportFormat}
          onDeliveryNoteReportFormat={t.handleDeliveryNoteReportFormat}
          onTrackingReportFormat={t.handleTrackingReportFormat}
        />
      </div>

      <StatCards
        borrowerCount={t.borrowerDispatchGroups.length}
        completedCount={t.completedCount}
        awaitingCount={t.awaitingCount}
        dispatchedCount={t.dispatchedCount}
      />

      <FiltersBar
        searchTerm={t.searchTerm}
        onSearchTermChange={t.onSearchTermChange}
        statusFilter={t.statusFilter}
        onStatusFilterChange={t.onStatusFilterChange}
        dateFilter={t.dateFilter}
        onDateFilterChange={t.onDateFilterChange}
        onClearDate={t.onClearDate}
      />

      <Tabs
        activeTab={t.activeTab}
        onTabChange={t.setActiveTab}
        trackingCount={t.borrowerDispatchGroups.length}
        advanceReceiptsCount={t.advanceReceiptRows.length}
      />

      {t.activeTab === 'advance-receipts' && (
        <AdvanceReceiptTable
          rows={t.advanceReceiptRows}
          receivingId={t.receivingId}
          canUpdateTracking={t.canUpdateTracking}
          onViewDetails={t.viewDetails}
          onMarkReceived={t.markReceived}
        />
      )}

      {t.activeTab === 'tracking' && (
        <>
          <BorrowerDispatchTable
            groups={t.borrowerDispatchGroups}
            selectedNote={t.selectedNote}
            selectedDetailsLoading={t.selectedDetailsLoading}
            selectedBorrowerDetailsCount={t.selectedBorrowerDetails.length}
            canExport={t.canExport}
            onSelectBorrower={t.selectBorrower}
            onSelectedDeliveryNoteReportFormat={t.handleSelectedDeliveryNoteReportFormat}
            onDownloadSelectedNote={t.downloadDeliveryNoteHtml}
          />

          <BorrowerSummaryTable
            selectedNote={t.selectedNote}
            selectedBorrowerName={t.selectedBorrowerName}
            selectedBorrowerRoute={t.selectedBorrowerRoute}
            selectedBorrowerDetailsCount={t.selectedBorrowerDetails.length}
            selectedDetailsLoading={t.selectedDetailsLoading}
            borrowerSummaryGroups={t.borrowerSummaryGroups}
            selectedGroup={t.selectedGroup}
            onSelectSummaryGroup={t.selectSummaryGroup}
          />

          <SupplierReceiptTable
            selectedGroup={t.selectedGroup}
            selectedBorrowerName={t.selectedBorrowerName}
            selectedBorrowerRoute={t.selectedBorrowerRoute}
            rows={t.selectedReceiptRows}
            receivingId={t.receivingId}
            canUpdateTracking={t.canUpdateTracking}
            onViewDetails={t.viewDetails}
            onMarkReceived={t.markReceived}
          />
        </>
      )}

      <TrackingDetailsModal item={t.viewingItem} onClose={() => t.setViewingItem(null)} />
    </div>
  )
}
