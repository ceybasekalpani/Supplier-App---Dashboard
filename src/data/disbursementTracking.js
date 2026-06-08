export const DISBURSEMENT_TRACKING_STORAGE_KEY = 'supplier-app-disbursement-tracking'

export const defaultDisbursementTrackingRows = [
  { id: 1, regNo: 'REG001', supplierName: 'Kamal Perera', issuedType: 'advance', issuedDetails: 'Rs. 50,000', amount: 50000, requestDate: '2026-05-29', approvedDate: '2026-06-01', issueDate: '2026-06-01', currentStatus: 'awaiting', method: 'Bank Transfer', route: 'Route A' },
  { id: 2, regNo: 'REG002', supplierName: 'Sunil Silva', issuedType: 'fertilizer', issuedDetails: 'Urea - 50 kg', itemName: 'Urea', qty: 50, unit: 'kg', requestDate: '2026-05-30', approvedDate: '2026-06-02', issueDate: '2026-06-02', currentStatus: 'awaiting', method: 'Physical Delivery', route: 'Route B' },
  { id: 3, regNo: 'REG003', supplierName: 'Nimal Jayawardena', issuedType: 'items', issuedDetails: 'Harvesting Bag - 100 pcs', itemName: 'Harvesting Bag', qty: 100, unit: 'pcs', requestDate: '2026-05-31', approvedDate: '2026-06-03', issueDate: '2026-06-03', completedDate: '2026-06-03', completedBy: 'Admin', completedDevice: 'Factory Office Desktop', currentStatus: 'completed', method: 'Physical Delivery', route: 'Route A' },
  { id: 4, regNo: 'REG004', supplierName: 'Thusitha Bandara', issuedType: 'fertilizer', issuedDetails: 'Potash - 30 kg', itemName: 'Potash', qty: 30, unit: 'kg', requestDate: '2026-06-01', approvedDate: '2026-06-04', issueDate: '2026-06-04', currentStatus: 'awaiting', method: 'Physical Delivery', route: 'Route C' },
  { id: 5, regNo: 'REG005', supplierName: 'Ruwan Wickrama', issuedType: 'advance', issuedDetails: 'Rs. 75,000', amount: 75000, requestDate: '2026-06-02', approvedDate: '2026-06-05', issueDate: '2026-06-05', completedDate: '2026-06-05', completedBy: 'Admin', completedDevice: 'Factory Office Desktop', currentStatus: 'completed', method: 'Cheque', route: 'Route B' },
]

export const getStoredTrackingRows = () => {
  if (typeof window === 'undefined') return defaultDisbursementTrackingRows

  try {
    const storedRows = JSON.parse(window.localStorage.getItem(DISBURSEMENT_TRACKING_STORAGE_KEY) || 'null')
    if (Array.isArray(storedRows)) return storedRows

    window.localStorage.setItem(DISBURSEMENT_TRACKING_STORAGE_KEY, JSON.stringify(defaultDisbursementTrackingRows))
    return defaultDisbursementTrackingRows
  } catch {
    return defaultDisbursementTrackingRows
  }
}

export const saveTrackingRows = (rows) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(DISBURSEMENT_TRACKING_STORAGE_KEY, JSON.stringify(rows))
  } catch {
    // Ignore storage failures so disbursement actions continue to work.
  }
}
