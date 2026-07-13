import { formatCurrency, formatDisplayDate, formatQuantity, getRowLabel, getRowValue, getReportPaymentMethod, typeConfig } from './disbursementHelpers'

export function buildQueueReport({ currentRows, issueTab, paymentMethods, selectedRoute, statusFilter, dateFrom, dateTo, advancePaymentFilter }) {
  const reportRows = currentRows.map(row => ({
    ...row,
    paymentMethod: getReportPaymentMethod(row, paymentMethods),
  }))
  const supplierCount = new Set(reportRows.map(row => row.regNo)).size
  const typeCountLabel = `${typeConfig[issueTab]?.label || 'Disbursement'} Count`
  const isAdvanceTab = issueTab === 'advance'

  const methodTotal = (method) => reportRows
    .filter(row => row.paymentMethod === method)
    .reduce((sum, row) => sum + Number(row.approvedAmount || 0), 0)

  const quantityBreakdown = isAdvanceTab
    ? []
    : Object.values(reportRows.reduce((acc, row) => {
        const label = getRowLabel(row)
        const unit = row.unit || ''
        const key = `${label}__${unit}`

        if (!acc[key]) acc[key] = { label, unit, qty: 0 }
        acc[key].qty += Number(row.approvedQty || 0)

        return acc
      }, {}))

  return {
    filename: `disbursement-${issueTab}-queue-report`,
    title: `${typeConfig[issueTab]?.label || 'Disbursement'} Queue Report`,
    subtitle: `Route: ${selectedRoute === 'all' ? 'All Routes' : selectedRoute} | Status: ${statusFilter === 'all' ? 'All' : statusFilter} | Date range: ${dateFrom || 'Any'} to ${dateTo || 'Any'}${issueTab === 'advance' ? ` | Payment method: ${advancePaymentFilter === 'all' ? 'All' : advancePaymentFilter}` : ''}`,
    rows: reportRows,
    summary: [],
    totals: isAdvanceTab
      ? [
          { label: 'Supplier Count', value: supplierCount },
          { label: typeCountLabel, value: reportRows.length },
          { label: 'Cash Total Amount', value: formatCurrency(methodTotal('Cash')) },
          { label: 'Bank Transfer Total Amount', value: formatCurrency(methodTotal('Bank Transfer')) },
          { label: 'Cheque Total Amount', value: formatCurrency(methodTotal('Cheque')) },
          { label: 'Account Transfer Total Amount', value: formatCurrency(methodTotal('Account Transfer')) },
        ]
      : [
          { label: 'Supplier Count', value: supplierCount },
          { label: typeCountLabel, value: reportRows.length },
          ...quantityBreakdown.map(item => ({
            label: `Total ${item.label} Quantity`,
            value: formatQuantity(item.qty, item.unit),
          })),
        ],
    columns: isAdvanceTab
      ? [
          { label: 'Request', value: row => row.requestNo || row.id, width: 0.9 },
          { label: 'Reg No', value: 'regNo', width: 0.75 },
          { label: 'Supplier Name', value: 'supplierName', width: 1.35 },
          { label: 'Route', value: row => row.route || '-', width: 1 },
          { label: 'Approved', value: row => formatDisplayDate(row.approvedDate), width: 0.9 },
          { label: 'Detail', value: row => getRowLabel(row), width: 1 },
          { label: 'Amount / Qty', value: row => getRowValue(row), width: 1 },
          { label: 'Method', value: 'paymentMethod', width: 1 },
        ]
      : [
          { label: 'Request', value: row => row.requestNo || row.id, width: 0.9 },
          { label: 'Reg No', value: 'regNo', width: 0.75 },
          { label: 'Supplier Name', value: 'supplierName', width: 1.35 },
          { label: 'Route', value: row => row.route || '-', width: 1 },
          { label: 'Approved', value: row => formatDisplayDate(row.approvedDate), width: 0.9 },
          { label: 'Detail', value: row => getRowLabel(row), width: 1.15 },
          { label: 'Amount / Qty', value: row => getRowValue(row), width: 1 },
        ],
  }
}
