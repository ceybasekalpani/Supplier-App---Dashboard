import { formatByUnit, formatCurrency, formatDateTime, formatQuantity, sanitizeFilenamePart } from './trackingFormatters'
import {
  getDisplayStatus, getPaymentMethod, getReceiptStatus, isTrackingRowAssignedToNote, normalizePaymentMethod,
  parseTrackingValue, paymentMethodLabels, summarizeQuantityByName, typeStyles, formatQuantityBreakdown,
} from './trackingDataHelpers'

export function buildFocusedDisbursementReport({ issuedType = '', paymentMethod = '', allReportRows, statusFilter, dateFilter, searchTerm }) {
  const normalizedPayment = normalizePaymentMethod(paymentMethod)
  const isPaymentReport = !issuedType && normalizedPayment
  const typeLabel = issuedType ? typeStyles[issuedType]?.label || 'Items' : 'All Types'
  const paymentLabel = normalizedPayment ? paymentMethodLabels[normalizedPayment] || paymentMethod : 'All Payment Methods'
  const hideDeliveryNoteNo = ['account-transfer', 'bank-transfer', 'cheque'].includes(normalizedPayment)
  const rows = allReportRows.filter(row => {
    const sameType = !issuedType || row.issuedType === issuedType
    const samePayment = !normalizedPayment || normalizePaymentMethod(getPaymentMethod(row)) === normalizedPayment
    return sameType && samePayment
  })
  const supplierCount = new Set(rows.map(row => row.regNo)).size
  const advanceRows = rows.filter(row => row.issuedType === 'advance')
  const fertilizerRows = rows.filter(row => row.issuedType === 'fertilizer')
  const itemRows = rows.filter(row => row.issuedType === 'items')
  const advanceTotal = advanceRows.reduce((sum, row) => sum + Number(parseTrackingValue(row).value || 0), 0)
  const fertilizerQuantityBreakdown = summarizeQuantityByName(fertilizerRows).map(item => ({
    label: `${item.name} Quantity`,
    value: formatQuantity(item.qty, item.unit),
  }))
  const itemQuantityBreakdown = summarizeQuantityByName(itemRows).map(item => ({
    label: `${item.name} Quantity`,
    value: formatQuantity(item.qty, item.unit),
  }))
  const completedCount = rows.filter(row => getReceiptStatus(row.currentStatus || row.status) === 'completed').length
  const awaitingCount = rows.filter(row => getReceiptStatus(row.currentStatus || row.status) === 'awaiting').length

  const totalsByKind = {
    advance: [
      { label: 'Supplier Count', value: supplierCount },
      { label: 'Advance Count', value: advanceRows.length },
      { label: 'Advance Total', value: formatCurrency(advanceTotal) },
      { label: 'Completed Count', value: completedCount },
      { label: 'Awaiting Count', value: awaitingCount },
    ],
    fertilizer: [
      { label: 'Supplier Count', value: supplierCount },
      { label: 'Fertilizer Count', value: fertilizerRows.length },
      ...fertilizerQuantityBreakdown,
    ],
    items: [
      { label: 'Supplier Count', value: supplierCount },
      { label: 'Item Count', value: itemRows.length },
      ...itemQuantityBreakdown,
    ],
    payment: [
      { label: 'Supplier Count', value: supplierCount },
      { label: 'Advance Count', value: advanceRows.length },
      { label: 'Advance Total', value: formatCurrency(advanceTotal) },
    ],
  }
  const totals = totalsByKind[issuedType] || totalsByKind.payment

  const showItemDetailColumn = issuedType === 'fertilizer' || issuedType === 'items'
  const showPaymentColumn = issuedType === 'advance' || isPaymentReport
  const showRouteColumn = issuedType === 'fertilizer'
  const amountQtyLabel = issuedType === 'fertilizer' ? 'Qty' : 'Amount / Qty'

  return {
    filename: [
      issuedType ? `disbursement-${issuedType}` : 'disbursement-payment',
      normalizedPayment || '',
      'report',
    ].filter(Boolean).join('-'),
    title: isPaymentReport ? `${paymentLabel} Payment Report` : `${typeLabel} Disbursement Report`,
    subtitle: `Payment: ${paymentLabel} | Status: ${statusFilter === 'all' ? 'All' : statusFilter} | Date: ${dateFilter || 'Any'} | Search: ${searchTerm || 'None'}`,
    rows,
    summary: [],
    totals,
    columns: [
      { label: 'Request No', value: 'requestNo', width: 1.05 },
      ...(!hideDeliveryNoteNo ? [{ label: 'DN No', value: row => row.deliveryNoteNo || '-', width: 1 }] : []),
      { label: 'Reg No', value: 'regNo', width: 0.75 },
      { label: 'Supplier Name', value: 'supplierName', width: 1.55 },
      { label: 'Type', value: row => typeStyles[row.issuedType]?.label || 'Item', width: 0.85 },
      ...(showItemDetailColumn ? [{ label: 'Item', value: row => parseTrackingValue(row).name, width: 1.3 }] : []),
      { label: amountQtyLabel, value: row => formatByUnit(parseTrackingValue(row).value, parseTrackingValue(row).unit), width: 1 },
      ...(showRouteColumn ? [{ label: 'Route', value: row => row.route || row.routeName || '-', width: 1.35 }] : []),
      ...(showPaymentColumn ? [{ label: 'Payment', value: row => getPaymentMethod(row), width: 1.05 }] : []),
      { label: 'Dispatch Date', value: row => formatDateTime(row.issueDate || row.dispatchedAt), width: 1.15 },
      { label: 'Receipt', value: row => getDisplayStatus(getReceiptStatus(row.currentStatus || row.status)), width: 0.85 },
    ],
  }
}

export function buildStoreReleaseLetter(issuedType, { allReportRows, statusFilter, dateFilter, searchTerm }) {
  const isFertilizer = issuedType === 'fertilizer'
  const itemLabel = isFertilizer ? 'Fertilizer' : 'Item'
  const rows = allReportRows.filter(row => row.issuedType === issuedType)
  const releaseGroups = Object.values(rows.reduce((acc, row) => {
    const parsed = parseTrackingValue(row)
    const name = parsed.name || row.itemName || row.issuedDetails || itemLabel
    const unit = parsed.unit || row.unit || '-'
    const key = name.trim().toLowerCase()

    if (!acc[key]) {
      acc[key] = {
        name,
        unitTotals: {},
      }
    }

    acc[key].unitTotals[unit] = (acc[key].unitTotals[unit] || 0) + Number(parsed.value || 0)

    return acc
  }, {})).map(group => ({
    name: group.name,
    quantityLabel: Object.entries(group.unitTotals)
      .map(([unit, quantity]) => formatQuantity(quantity, unit === '-' ? '' : unit))
      .join(', '),
  })).sort((a, b) => a.name.localeCompare(b.name))
    .map((group, index) => ({ ...group, no: index + 1 }))

  const releaseName = isFertilizer ? 'fertilizer' : 'item'
  const releaseLabel = isFertilizer ? 'fertilizer' : 'item'

  return {
    filename: `${releaseName}-store-release-letter`,
    title: `${itemLabel} Store Release Letter`,
    subtitle: `Status: ${statusFilter === 'all' ? 'All' : statusFilter} | Date: ${dateFilter || 'Any'} | Search: ${searchTerm || 'None'}`,
    reportVariant: 'letter',
    tableTitle: 'Release Summary',
    introText: `Approval is requested to release the following ${releaseLabel} quantities from store stock for supplier disbursement. The quantities below are summarized by ${releaseLabel} type, with each ${releaseLabel} type shown once with its total quantity required for release.`,
    closingText: `Upon authorization, the store may issue the listed ${releaseLabel} quantities according to this release summary.`,
    rows: releaseGroups,
    summary: [],
    totals: [],
    signatures: ['Authorized Signature'],
    columns: [
      { label: 'No', value: 'no', width: 0.45, align: 'center' },
      { label: `${itemLabel} Name`, value: 'name', width: 2 },
      { label: 'Total Release Quantity', value: 'quantityLabel', width: 1.15 },
    ],
  }
}

export function buildTrackingReport({ filteredRows, statusFilter, dateFilter, searchTerm, awaitingCount, dispatchedCount, completedCount }) {
  return {
    filename: 'disbursement-tracking-report',
    title: 'Disbursement Tracking Report',
    subtitle: `Status: ${statusFilter === 'all' ? 'All' : statusFilter} | Date: ${dateFilter || 'Any'} | Search: ${searchTerm || 'None'}`,
    rows: filteredRows,
    summary: [],
    totals: [
      { label: 'Supplier Count', value: new Set(filteredRows.map(row => row.regNo)).size },
      { label: 'Advance Count', value: filteredRows.filter(row => row.issuedType === 'advance').length },
      { label: 'Fertilizer Count', value: filteredRows.filter(row => row.issuedType === 'fertilizer').length },
      { label: 'Item Count', value: filteredRows.filter(row => row.issuedType === 'items').length },
      { label: 'Awaiting Count', value: awaitingCount },
      { label: 'Dispatched Count', value: dispatchedCount },
      { label: 'Completed Count', value: completedCount },
    ],
    columns: [
      { label: 'Request No', value: 'requestNo', width: 1.1 },
      { label: 'Reg No', value: 'regNo', width: 0.8 },
      { label: 'Supplier Name', value: 'supplierName', width: 1.7 },
      { label: 'Type', value: 'issuedType', width: 0.8 },
      { label: 'Item', value: row => parseTrackingValue(row).name, width: 1.4 },
      { label: 'Amount / Qty', value: row => formatByUnit(parseTrackingValue(row).value, parseTrackingValue(row).unit), width: 1 },
      { label: 'Method', value: 'method', width: 1 },
      { label: 'Dispatch Date', value: row => formatDateTime(row.issueDate), width: 1.15 },
      { label: 'Status', value: row => getDisplayStatus(row.currentStatus), width: 0.8 },
    ],
  }
}

export function buildDeliveryNoteReport({ deliveryNotes, filteredRows, borrowerDispatchGroups, statusFilter, dateFilter, searchTerm }) {
  const noteIds = new Set(deliveryNotes.map(note => note.id))
  const detailRows = filteredRows.filter(row => noteIds.has(row.deliveryNoteId))

  const reportRows = borrowerDispatchGroups.map(group => {
    const groupRows = filteredRows.filter(row => isTrackingRowAssignedToNote(row, group))

    const advanceRows = groupRows.filter(row => row.issuedType === 'advance')

    return {
      ...group,
      advanceAmount: formatCurrency(advanceRows.reduce((sum, row) => sum + Number(parseTrackingValue(row).value || 0), 0)),
      fertilizerBreakdown: formatQuantityBreakdown(groupRows.filter(row => row.issuedType === 'fertilizer')),
      itemBreakdown: formatQuantityBreakdown(groupRows.filter(row => row.issuedType === 'items')),
    }
  })

  return {
    filename: 'delivery-note-borrower-report',
    title: 'Borrower Delivery Note Report',
    subtitle: `Status: ${statusFilter === 'all' ? 'All' : statusFilter} | Date: ${dateFilter || 'Any'} | Search: ${searchTerm || 'None'}`,
    rows: reportRows,
    summary: [],
    totals: [
      { label: 'Supplier Count', value: new Set(detailRows.map(row => row.regNo)).size || '-' },
      { label: 'Advance Count', value: detailRows.filter(row => row.issuedType === 'advance').length },
      { label: 'Fertilizer Count', value: detailRows.filter(row => row.issuedType === 'fertilizer').length },
      { label: 'Item Count', value: detailRows.filter(row => row.issuedType === 'items').length },
      { label: 'Borrower Count', value: borrowerDispatchGroups.length },
      { label: 'Total Dispatched Records', value: deliveryNotes.reduce((sum, note) => sum + Number(note.totalRecords || 0), 0) },
    ],
    columns: [
      { label: 'DN No', value: row => row.deliveryNoteNos?.join(', ') || row.deliveryNoteNo || '-', width: 1.1 },
      { label: 'Dispatch Date', value: row => formatDateTime(row.dispatchDate), width: 1.2 },
      { label: 'Borrower Name', value: 'borrowerName', width: 1.3 },
      { label: 'Borrower Role', value: 'borrowerRole', width: 1 },
      { label: 'Vehicle No', value: 'vehicleNo', width: 0.8 },
      { label: 'Route', value: 'routeName', width: 1.6 },
      { label: 'Advance Amount', value: 'advanceAmount', width: 1 },
      { label: 'Fertilizer (Qty)', value: 'fertilizerBreakdown', width: 1.6 },
      { label: 'Item (Qty)', value: 'itemBreakdown', width: 1.6 },
      { label: 'Status', value: 'status', width: 0.7 },
    ],
  }
}

export function buildSelectedDeliveryNoteReport({ selectedNote, selectedBorrowerDetails, selectedDeliveryNoteLabel, dateFilter }) {
  const dnNo = selectedDeliveryNoteLabel || `DN-${selectedNote?.id || 'selected'}`
  const borrowerName = selectedNote?.borrowerName || 'selected-borrower'
  const dispatchDate = String(selectedNote?.dispatchDate || '').slice(0, 10) || dateFilter || 'any-date'
  const safeDnNo = sanitizeFilenamePart(dnNo) || 'selected-dn'
  const safeBorrowerName = sanitizeFilenamePart(borrowerName) || 'borrower'
  const supplierCount = new Set(selectedBorrowerDetails.map(row => row.regNo)).size
  const advanceTotal = selectedBorrowerDetails
    .filter(row => row.issuedType === 'advance')
    .reduce((sum, row) => sum + Number(row.value || 0), 0)
  const fertilizerQty = selectedBorrowerDetails
    .filter(row => row.issuedType === 'fertilizer')
    .reduce((sum, row) => sum + Number(row.value || 0), 0)
  const itemQty = selectedBorrowerDetails
    .filter(row => row.issuedType === 'items')
    .reduce((sum, row) => sum + Number(row.value || 0), 0)
  const completedReceipts = selectedBorrowerDetails.filter(row => getReceiptStatus(row.status) === 'completed').length

  return {
    filename: `${safeDnNo}-${safeBorrowerName}-${dispatchDate}`,
    title: `Selected Delivery Note - ${dnNo}`,
    rows: selectedBorrowerDetails,
    summary: [],
    totals: [
      { label: 'Supplier Count', value: supplierCount },
      { label: 'Advance Total', value: formatCurrency(advanceTotal) },
      { label: 'Fertilizer Quantity', value: formatQuantity(fertilizerQty) },
      { label: 'Item Quantity', value: formatQuantity(itemQty) },
      { label: 'Completed Receipts', value: completedReceipts },
      { label: 'Awaiting Receipts', value: selectedBorrowerDetails.length - completedReceipts },
    ],
    columns: [
      { label: 'Request No', value: row => row.requestNo || '-', width: 1 },
      { label: 'Supplier Name', value: 'supplierName', width: 1.9 },
      { label: 'Reg No', value: 'regNo', width: 0.8 },
      { label: 'Category', value: row => `${typeStyles[row.issuedType]?.label || 'Item'} - ${row.categoryName}`, width: 1.55 },
      { label: 'Amount / Qty', value: row => formatByUnit(row.value, row.unit), width: 1.05 },
      { label: 'Payment', value: row => getPaymentMethod(row), width: 0.95 },
      { label: 'Dispatch Date / Time', value: row => formatDateTime(row.dispatchDate), width: 1.35 },
      { label: 'Approved By', value: 'approvedBy', width: 1.15 },
      { label: 'Receipt Status', value: row => getReceiptStatus(row.status), width: 0.95 },
    ],
  }
}
