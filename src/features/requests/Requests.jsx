import { Info, RefreshCw } from 'lucide-react'
import { focusNextFieldOnEnter } from '../../utils/keyboardNav'
import { useRequestsData } from './hooks/useRequestsData'
import RequestsHeader from './components/RequestsHeader'
import RequestsTabsBar from './components/RequestsTabsBar'
import RequestsFilterBar from './components/RequestsFilterBar'
import RequestsTable from './components/RequestsTable'
import RequestTableSummary from './components/RequestTableSummary'
import SidePanel from './components/SidePanel'
import SupplierWindow from './components/SupplierWindow'

export default function Requests() {
  const r = useRequestsData()

  return (
    <div className="space-y-5">
      <RequestsHeader requestStats={r.requestStats} />

      <RequestsTabsBar
        tab={r.tab}
        onTabChange={r.handleTabChange}
        requestLoading={r.requestLoading}
        onRefresh={r.refreshRequests}
      />

      {r.requestError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/15 dark:text-red-300">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Request data could not be synchronized</p>
              <p className="text-xs opacity-80">{r.requestError}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={r.refreshRequests}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" onKeyDown={focusNextFieldOnEnter}>
            <RequestsFilterBar
              search={r.search}
              onSearchChange={r.setSearch}
              tab={r.tab}
              filter={r.filter}
              onFilterChange={r.handleFilterChange}
              countFor={r.countFor}
              fromDate={r.fromDate}
              onFromDateChange={r.setFromDate}
              toDate={r.toDate}
              onToDateChange={r.setToDate}
              onClearAllFilters={r.clearAllFilters}
              onClearDates={r.clearDates}
              filteredCount={r.filtered.length}
              onRequestReportFormat={r.handleRequestReportFormat}
            />

            <RequestsTable
              tab={r.tab}
              filtered={r.filtered}
              requestLoading={r.requestLoading}
              selected={r.selected}
              onSelectRow={r.selectRow}
              tableColumnCount={r.tableColumnCount}
            />

            <RequestTableSummary rows={r.filtered} tab={r.tab} />
          </div>
        </div>

        <div className="w-full xl:w-80 shrink-0">
          <SidePanel
            req={r.selected}
            draft={r.draft}
            statusSaving={r.statusSaving}
            canApprove={r.canApproveCurrentTab}
            canReject={r.canRejectCurrentTab}
            canApproveRejected={r.canApproveRejectedCurrentTab}
            canRejectApproved={r.canRejectApprovedCurrentTab}
            exceedsAdvanceLimit={r.exceedsAdvanceLimit}
            advanceLimit={r.selectedAdvanceLimit}
            advanceLimitLoading={r.selectedAdvanceLimitLoading}
            onDraftChange={r.handleDraftChange}
            onApprove={id => r.updateStatus(id, 'approved')}
            onReject={id => r.updateStatus(id, 'rejected')}
            onOpenSupplier={regNo => r.setSupplierWindow(regNo)}
          />
        </div>
      </div>

      {r.supplierWindow && (
        <SupplierWindow
          regNo={r.supplierWindow}
          tab={r.tab}
          requestsByType={r.allData}
          salaryDate={r.salaryDate}
          onClose={() => r.setSupplierWindow(null)}
        />
      )}
    </div>
  )
}
