import { downloadDocReport, printReportAsPdf } from '../../../utils/reports'
import { normalizePaymentMethod, paymentMethodLabels, typeStyles } from '../utils/trackingDataHelpers'
import {
  buildDeliveryNoteReport, buildFocusedDisbursementReport, buildSelectedDeliveryNoteReport, buildStoreReleaseLetter,
  buildTrackingReport,
} from '../utils/trackingReportBuilders'

export function useDisbursementTrackingReports({
  canExport, filteredRows, deliveryNotes, borrowerDispatchGroups, statusFilter, dateFilter, searchTerm,
  allReportRows, selectedNote, selectedBorrowerDetails, selectedDeliveryNoteLabel,
  awaitingCount, dispatchedCount, completedCount, setShowError,
}) {
  const showTimedError = (message) => {
    setShowError(message)
    setTimeout(() => setShowError(null), 3000)
  }

  const reportContext = { allReportRows, statusFilter, dateFilter, searchTerm }

  const downloadReport = (report, format) => {
    if (!canExport) {
      showTimedError('You do not have permission to export disbursement tracking reports.')
      return
    }
    if (format === 'doc') {
      downloadDocReport(report)
      return
    }

    if (!printReportAsPdf(report)) {
      showTimedError('Popup blocked. Please allow popups to print or save the report as PDF.')
    }
  }

  const handleSelectedDeliveryNoteReportFormat = (format) => {
    if (!format) return

    if (!canExport) {
      showTimedError('You do not have permission to export disbursement tracking reports.')
      return
    }

    if (!selectedNote) {
      showTimedError('Please select a borrower delivery note first')
      return
    }

    if (selectedBorrowerDetails.length === 0) {
      showTimedError('Selected delivery note has no supplier records to download')
      return
    }

    const report = buildSelectedDeliveryNoteReport({ selectedNote, selectedBorrowerDetails, selectedDeliveryNoteLabel, dateFilter })
    downloadReport(report, format)
  }

  const handleTrackingReportFormat = (format) => {
    if (!format) return
    if (!canExport) {
      showTimedError('You do not have permission to export disbursement tracking reports.')
      return
    }
    const report = buildTrackingReport({ filteredRows, statusFilter, dateFilter, searchTerm, awaitingCount, dispatchedCount, completedCount })
    downloadReport(report, format)
  }

  const handleTypeReportFormat = (value) => {
    if (!value) return

    const [issuedType, format] = value.split(':')
    const report = buildFocusedDisbursementReport({ issuedType, ...reportContext })

    if (report.rows.length === 0) {
      showTimedError(`No ${typeStyles[issuedType]?.label || issuedType} records found for the current filters`)
      return
    }

    downloadReport(report, format)
  }

  const handlePaymentReportFormat = (value) => {
    if (!value) return

    const [paymentMethod, format] = value.split(':')
    const normalizedPayment = normalizePaymentMethod(paymentMethod)
    const report = buildFocusedDisbursementReport({ paymentMethod, ...reportContext })

    if (report.rows.length === 0) {
      showTimedError(`No ${paymentMethodLabels[normalizedPayment] || paymentMethod} records found for the current filters`)
      return
    }

    downloadReport(report, format)
  }

  const handleStoreReleaseReportFormat = (value) => {
    if (!value) return

    const [issuedType, format] = value.split(':')
    const report = buildStoreReleaseLetter(issuedType, reportContext)
    const label = issuedType === 'fertilizer' ? 'fertilizer' : 'item'

    if (report.rows.length === 0) {
      showTimedError(`No ${label} records found for the current filters`)
      return
    }

    downloadReport(report, format)
  }

  const handleDeliveryNoteReportFormat = (format) => {
    if (!format) return
    if (!canExport) {
      showTimedError('You do not have permission to export disbursement tracking reports.')
      return
    }
    const report = buildDeliveryNoteReport({ deliveryNotes, filteredRows, borrowerDispatchGroups, statusFilter, dateFilter, searchTerm })
    downloadReport(report, format)
  }

  return {
    handleTypeReportFormat,
    handlePaymentReportFormat,
    handleStoreReleaseReportFormat,
    handleDeliveryNoteReportFormat,
    handleTrackingReportFormat,
    handleSelectedDeliveryNoteReportFormat,
  }
}
