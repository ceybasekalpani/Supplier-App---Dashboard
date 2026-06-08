import { disbursementTrackingRows } from './mockData'
import { readJsonStorage, writeJsonStorage } from '../utils/storage'

export const DISBURSEMENT_TRACKING_STORAGE_KEY = 'supplier-app-disbursement-tracking'

export const getStoredTrackingRows = () => {
  const storedRows = readJsonStorage(DISBURSEMENT_TRACKING_STORAGE_KEY, null)
  if (Array.isArray(storedRows)) return storedRows

  writeJsonStorage(DISBURSEMENT_TRACKING_STORAGE_KEY, disbursementTrackingRows)
  return disbursementTrackingRows
}

export const saveTrackingRows = (rows) => {
  if (typeof window === 'undefined') return

  writeJsonStorage(DISBURSEMENT_TRACKING_STORAGE_KEY, rows)
}
