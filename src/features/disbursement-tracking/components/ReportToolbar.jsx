import Combobox from '../../../components/ui/Combobox'

export default function ReportToolbar({
  filteredRowsCount,
  borrowerGroupsCount,
  onTypeReportFormat,
  onPaymentReportFormat,
  onStoreReleaseReportFormat,
  onDeliveryNoteReportFormat,
  onTrackingReportFormat,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Combobox
        value=""
        onChange={onTypeReportFormat}
        disabled={filteredRowsCount === 0}
        placeholder="Type Report"
        options={[
          { value: 'advance:pdf', label: 'Advance PDF' },
          { value: 'advance:doc', label: 'Advance DOC' },
          { value: 'fertilizer:pdf', label: 'Fertilizer PDF' },
          { value: 'fertilizer:doc', label: 'Fertilizer DOC' },
          { value: 'items:pdf', label: 'Items PDF' },
          { value: 'items:doc', label: 'Items DOC' },
        ]}
        className="min-w-40"
        buttonClassName="bg-white dark:bg-slate-800"
      />
      <Combobox
        value=""
        onChange={onPaymentReportFormat}
        disabled={filteredRowsCount === 0}
        placeholder="Payment Report"
        options={[
          { value: 'cash:pdf', label: 'Cash PDF' },
          { value: 'cash:doc', label: 'Cash DOC' },
          { value: 'cheque:pdf', label: 'Cheque PDF' },
          { value: 'cheque:doc', label: 'Cheque DOC' },
          { value: 'account-transfer:pdf', label: 'Account Transfer PDF' },
          { value: 'account-transfer:doc', label: 'Account Transfer DOC' },
          { value: 'bank-transfer:pdf', label: 'Bank Transfer PDF' },
          { value: 'bank-transfer:doc', label: 'Bank Transfer DOC' },
        ]}
        className="min-w-44"
        buttonClassName="bg-white dark:bg-slate-800"
      />
      <Combobox
        value=""
        onChange={onStoreReleaseReportFormat}
        disabled={filteredRowsCount === 0}
        placeholder="Store Release Letter"
        options={[
          { value: 'fertilizer:pdf', label: 'Fertilizer Release PDF' },
          { value: 'fertilizer:doc', label: 'Fertilizer Release DOC' },
          { value: 'items:pdf', label: 'Item Release PDF' },
          { value: 'items:doc', label: 'Item Release DOC' },
        ]}
        className="min-w-52"
        buttonClassName="bg-white dark:bg-slate-800"
      />
      <Combobox
        value=""
        onChange={onDeliveryNoteReportFormat}
        disabled={borrowerGroupsCount === 0}
        placeholder="Borrower Report"
        options={[
          { value: 'pdf', label: 'PDF' },
          { value: 'doc', label: 'DOC' },
        ]}
        className="min-w-40"
        buttonClassName="bg-white dark:bg-slate-800"
      />
      <Combobox
        value=""
        onChange={onTrackingReportFormat}
        disabled={filteredRowsCount === 0}
        placeholder="Tracking Report"
        options={[
          { value: 'pdf', label: 'PDF' },
          { value: 'doc', label: 'DOC' },
        ]}
        className="min-w-44"
        buttonClassName="bg-green-700 text-slate-200 hover:bg-green-800 dark:bg-green-700 dark:text-slate-200 [&>span]:!text-slate-200"
      />
    </div>
  )
}
