import { Download, FileText } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import { formatDateTime } from '../utils/trackingFormatters'
import EmptyTableRow from './EmptyTableRow'

export default function BorrowerDispatchTable({
  groups,
  selectedNote,
  selectedDetailsLoading,
  selectedBorrowerDetailsCount,
  canExport,
  onSelectBorrower,
  onSelectedDeliveryNoteReportFormat,
  onDownloadSelectedNote,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Borrower Details</h3>
              <p className="mt-0.5 text-xs text-slate-500">Select one borrower row to load the disbursement summary below</p>
            </div>
          </div>
          {selectedNote && (
            <div className="flex flex-wrap items-center gap-2">
              <Combobox
                value=""
                onChange={onSelectedDeliveryNoteReportFormat}
                disabled={selectedDetailsLoading || selectedBorrowerDetailsCount === 0}
                placeholder="Selected DN Report"
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'doc', label: 'DOC' },
                ]}
                className="min-w-44"
                buttonClassName="bg-green-700 text-slate-100 hover:bg-green-800 dark:bg-green-700 dark:text-slate-100 [&>span]:!text-slate-100"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-h-72 overflow-auto">
        <table className="w-full min-w-195 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left">Borrower Name</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Vehicle No</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <EmptyTableRow colSpan={5} icon={FileText} message="No borrower dispatch records found" />
            ) : groups.map(note => {
              const isSelected = selectedNote?.groupKey === note.groupKey

              return (
                <tr
                  key={note.groupKey}
                  onClick={() => onSelectBorrower(note)}
                  className={`cursor-pointer border-b border-slate-100 transition-colors dark:border-slate-700/50 ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{note.borrowerName || '-'}</p>
                    <p className="text-xs text-slate-500">{note.deliveryNoteNos.join(', ') || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{note.routeName || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{note.vehicleNo || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{note.borrowerRole || '-'}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-600 dark:text-slate-300">{formatDateTime(note.dispatchDate)}</p>
                    <p className="text-xs text-slate-500">{note.notes.length} delivery note{note.notes.length === 1 ? '' : 's'} / {note.totalRecords} records</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
