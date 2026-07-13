import { hasDisplayTime } from './trackingFormatters'
import {
  getApprovedBy, getDeliveryDetailId, getDeliveryNoteId, getDeliveryNoteNo, getExplicitTrackingId, getRegNo,
  getRequestApprovedBy, getRequestId, getRouteName, getSupplierName, getTrackingId, isKnownDisbursementType,
  normalizeDisbursementType, normalizeId, normalizeText, typeStyles,
} from './trackingFieldHelpers'
import {
  findApprovedRequestForDetail, getDetailCategoryName, getDetailIssuedType, getDetailValue, parseTrackingValue,
} from './trackingShapeHelpers'

export const findTrackingRecordForDetail = (detail, note, trackingRows) => {
  const detailTrackingId = getExplicitTrackingId(detail) || (getDeliveryNoteId(detail) ? getTrackingId(detail) : '')
  const detailTypeSource = detail.issuedType || (isKnownDisbursementType(detail.itemType) ? detail.itemType : '') || detail.type
  const detailType = normalizeDisbursementType(detailTypeSource)
  const detailRegNo = getRegNo(detail)
  const detailRequestId = getRequestId(detail)
  const detailDeliveryNoteId = getDeliveryNoteId(detail)
  const noteIds = new Set((note?.noteIds || []).map(normalizeId))
  const detailValue = parseTrackingValue(detail)
  const detailCategory = normalizeText(detailValue.name)
  const detailUnit = normalizeText(detailValue.unit)

  if (detailTrackingId) {
    return trackingRows.find(row => {
      const rowTrackingId = getTrackingId(row)
      return rowTrackingId && detailTrackingId === rowTrackingId
    }) || null
  }

  const exactRequestMatch = trackingRows.find(row => {
    const rowType = normalizeDisbursementType(row.issuedType || row.itemType || row.type)
    const rowRegNo = getRegNo(row)
    const rowRequestId = getRequestId(row)

    return detailRequestId
      && rowRequestId
      && rowRequestId === detailRequestId
      && rowType === detailType
      && normalizeText(rowRegNo) === normalizeText(detailRegNo)
  })

  if (exactRequestMatch) return exactRequestMatch

  if (detailRequestId) return null

  return trackingRows.find(row => {
    const rowTrackingId = getTrackingId(row)
    const rowType = normalizeDisbursementType(row.issuedType || row.itemType || row.type)
    const rowRegNo = getRegNo(row)
    const rowDeliveryNoteId = getDeliveryNoteId(row)
    const rowValue = parseTrackingValue(row)
    const rowCategory = normalizeText(rowValue.name)
    const rowUnit = normalizeText(rowValue.unit)

    const sameType = rowType === detailType
    const sameRegNo = normalizeText(rowRegNo) === normalizeText(detailRegNo)
    const sameDeliveryNote = rowDeliveryNoteId && (
      (detailDeliveryNoteId && rowDeliveryNoteId === detailDeliveryNoteId)
      || (noteIds.size > 0 && noteIds.has(rowDeliveryNoteId))
    )
    const sameCategory = !detailCategory || !rowCategory || rowCategory === detailCategory
    const sameUnit = !detailUnit || !rowUnit || rowUnit === detailUnit

    return rowTrackingId && sameType && sameDeliveryNote && sameRegNo && sameCategory && sameUnit
  })
}

export const isTrackingRowAssignedToNote = (row, note) => {
  if (!row || !note) return false

  const noteId = normalizeId(note.id)
  const noteIds = new Set((note.noteIds || []).map(normalizeId))
  const rowDeliveryNoteId = getDeliveryNoteId(row)
  const noteNo = getDeliveryNoteNo(note)
  const noteNos = new Set((note.deliveryNoteNos || []).map(normalizeId))
  const rowDeliveryNoteNo = getDeliveryNoteNo(row)

  if (noteIds.size && rowDeliveryNoteId && noteIds.has(rowDeliveryNoteId)) return true
  if (noteId && rowDeliveryNoteId && rowDeliveryNoteId === noteId) return true
  if (noteNos.size && rowDeliveryNoteNo && noteNos.has(rowDeliveryNoteNo)) return true
  if (noteNo && rowDeliveryNoteNo && rowDeliveryNoteNo === noteNo) return true

  return false
}

export const mergeAssignedDetails = (note, trackingRows) => {
  if (!note) return []

  const detailRows = Array.isArray(note.details) ? note.details : []
  const trackingDetails = trackingRows.filter(row => isTrackingRowAssignedToNote(row, note))
  const sourceRows = detailRows.length ? detailRows : trackingDetails
  const merged = []
  const seen = new Set()

  sourceRows.forEach(row => {
    const parsed = parseTrackingValue(row)
    const key = [
      getDeliveryNoteId(row),
      getDeliveryDetailId(row),
      getExplicitTrackingId(row),
      getRequestId(row),
      normalizeDisbursementType(row.issuedType || row.itemType || row.type),
      normalizeText(getRegNo(row)),
      normalizeText(parsed.name),
      normalizeText(parsed.unit),
    ].filter(Boolean).join('|') || `${merged.length}`

    if (seen.has(key)) return
    seen.add(key)
    merged.push(row)
  })

  return merged
}

export const getDispatchDateTime = (detail, source, note) => (
  detail.dispatchedAt
  || detail.dispatchDate
  || note?.dispatchDate
  || source.dispatchedAt
  || source.dispatchDate
  || source.issueDate
  || detail.issueDate
  || note?.createdAt
)

export const enrichDeliveryNoteDetails = (note, trackingRows, approvalRows = []) => {
  if (!note) return []

  const details = mergeAssignedDetails(note, trackingRows)

  return details.map(detail => {
    const trackingRecord = findTrackingRecordForDetail(detail, note, trackingRows)
    const approvedRequest = findApprovedRequestForDetail(detail, approvalRows)
    const issuedType = getDetailIssuedType(detail, trackingRecord)
    const categoryName = getDetailCategoryName(detail, issuedType, trackingRecord)
    const value = getDetailValue(detail, issuedType, trackingRecord)
    const unit = issuedType === 'advance'
      ? 'Rs'
      : (detail.unit || trackingRecord?.unit || parseTrackingValue(detail).unit || '')

    return {
      ...detail,
      deliveryNoteDetailId: getDeliveryDetailId(detail),
      trackingId: trackingRecord?.id || detail.disbursementRecordId || detail.trackingId || detail.id || null,
      requestId: getRequestId(detail) || getRequestId(trackingRecord),
      issuedType,
      categoryName,
      value,
      unit,
      paymentType: detail.paymentType || trackingRecord?.paymentType || trackingRecord?.method || detail.method || '',
      method: trackingRecord?.method || detail.method || detail.paymentType || '',
      supplierName: getSupplierName(detail) !== '-' ? getSupplierName(detail) : getSupplierName(trackingRecord),
      regNo: getRegNo(detail) !== '-' ? getRegNo(detail) : getRegNo(trackingRecord),
      route: getRouteName(detail) !== '-' ? getRouteName(detail) : getRouteName(trackingRecord),
      approvedBy: getRequestApprovedBy(approvedRequest) || getApprovedBy(detail, trackingRecord),
      dispatchDate: getDispatchDateTime(detail, trackingRecord || detail, note),
      status: trackingRecord?.currentStatus || detail.currentStatus || detail.status || 'awaiting',
      completedDate: trackingRecord?.completedDate || detail.completedDate || '',
      completedBy: trackingRecord?.completedBy || detail.completedBy || '',
      completedDevice: trackingRecord?.completedDevice || detail.completedDevice || '',
    }
  })
}

export const buildBorrowerSummaryGroups = (rows) => {
  const groups = rows.reduce((acc, row) => {
    const key = `${row.issuedType}-${normalizeText(row.categoryName)}-${normalizeText(row.unit)}`

    if (!acc[key]) {
      acc[key] = {
        key,
        issuedType: row.issuedType,
        categoryName: row.categoryName,
        unit: row.unit || (row.issuedType === 'advance' ? 'Rs' : '-'),
        dispatchDate: row.dispatchDate,
        approvedByNames: new Set(),
        rows: [],
        total: 0,
      }
    }

    acc[key].rows.push(row)
    acc[key].total += Number(row.value || 0)

    if (!hasDisplayTime(acc[key].dispatchDate) && hasDisplayTime(row.dispatchDate)) {
      acc[key].dispatchDate = row.dispatchDate
    }

    if (row.approvedBy && row.approvedBy !== '-') {
      acc[key].approvedByNames.add(row.approvedBy)
    }

    return acc
  }, {})

  return Object.values(groups).map(group => ({
    ...group,
    approvedBy: Array.from(group.approvedByNames).join(', ') || '-',
  }))
}

export const getDisbursementCategoryLabel = (group) => {
  if (!group) return '-'
  if (group.issuedType === 'advance') return 'Advance'

  const typeLabel = typeStyles[group.issuedType]?.label || 'Item'
  return `${typeLabel} - ${group.categoryName}`
}
