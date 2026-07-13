import { formatCurrency, formatQuantity, hasDisplayTime } from './trackingFormatters'
import {
  getRegNo, getRequestId, isKnownDisbursementType, normalizeDisbursementType, normalizeId, normalizeText,
} from './trackingFieldHelpers'

const fertilizerNameHints = [
  'urea',
  'compost',
  'potash',
  'tsp',
  'mop',
  'npk',
  'dolomite',
  'phosphate',
  'fertilizer',
  'fertiliser',
]

export const getDetailIssuedType = (detail = {}, trackingRecord = null) => {
  const candidates = [
    detail.issuedType,
    detail.disbursementType,
    detail.type,
    isKnownDisbursementType(detail.itemType) ? detail.itemType : '',
    trackingRecord?.issuedType,
    trackingRecord?.disbursementType,
    trackingRecord?.type,
  ]

  const known = candidates.find(isKnownDisbursementType)
  if (known) return normalizeDisbursementType(known)

  const detailText = normalizeText([
    detail.issuedDetails,
    detail.itemName,
    detail.fertilizerType,
    detail.fertilizerName,
    detail.itemType,
    detail.itemTypeName,
  ].filter(Boolean).join(' '))

  if (fertilizerNameHints.some(hint => detailText.includes(hint))) return 'fertilizer'
  if (trackingRecord?.issuedType) return normalizeDisbursementType(trackingRecord.issuedType)

  return detail.amount ? 'advance' : 'items'
}

export const getDetailCategoryName = (detail = {}, issuedType = '', trackingRecord = null) => {
  if (issuedType === 'advance') return 'Advance'

  return detail.itemName
    || detail.fertilizerType
    || detail.fertilizerName
    || detail.itemTypeName
    || (!isKnownDisbursementType(detail.itemType) ? detail.itemType : '')
    || trackingRecord?.itemName
    || trackingRecord?.fertilizerType
    || trackingRecord?.fertilizerName
    || (!isKnownDisbursementType(trackingRecord?.itemType) ? trackingRecord?.itemType : '')
    || parseTrackingValue(detail).name
}

export const getDetailValue = (detail = {}, issuedType = '', trackingRecord = null) => {
  if (issuedType === 'advance') {
    return Number(detail.amount)
      || Number(detail.approvedAmount)
      || Number(trackingRecord?.amount)
      || Number(trackingRecord?.approvedAmount)
      || Number(String(detail.issuedDetails || trackingRecord?.issuedDetails || '').replace(/[^\d.]/g, ''))
      || 0
  }

  return Number(detail.quantity)
    || Number(detail.qty)
    || Number(detail.approvedQty)
    || Number(trackingRecord?.qty)
    || Number(trackingRecord?.quantity)
    || Number(trackingRecord?.approvedQty)
    || parseTrackingValue(detail).value
    || 0
}

export const flattenApprovedRequestRows = (response = {}) => [
  ...(response.advance || []).map(row => ({ ...row, issuedType: 'advance' })),
  ...(response.fertilizer || []).map(row => ({ ...row, issuedType: 'fertilizer' })),
  ...(response.items || []).map(row => ({ ...row, issuedType: 'items' })),
]

export const findApprovedRequestForDetail = (detail, approvalRows) => {
  const issuedType = getDetailIssuedType(detail)
  const requestId = getRequestId(detail)
  const requestNo = normalizeId(detail.requestNo)
  const regNo = normalizeText(getRegNo(detail))
  const category = normalizeText(getDetailCategoryName(detail, issuedType))

  return approvalRows.find(row => {
    if (row.issuedType !== issuedType) return false

    const rowId = normalizeId(row.id)
    const rowRequestNo = normalizeId(row.requestNo)
    const rowRegNo = normalizeText(row.regNo)
    const rowCategory = normalizeText(row.type)

    if (requestId && rowId && requestId === rowId) return true
    if (requestNo && rowRequestNo && requestNo === rowRequestNo) return true

    return regNo
      && rowRegNo === regNo
      && (!category || !rowCategory || category === rowCategory || category.includes(rowCategory) || rowCategory.includes(category))
  })
}

export const getDispatchDay = (item = {}) => String(
  item.dispatchDate
  || item.dispatchedAt
  || item.issueDate
  || item.createdAt
  || ''
).slice(0, 10)

export const buildBorrowerDispatchGroups = (notes) => {
  const groups = notes.reduce((acc, note) => {
    const dispatchDay = getDispatchDay(note)
    const key = [
      normalizeText(note.borrowerName),
      dispatchDay,
    ].join('|')

    if (!acc[key]) {
      acc[key] = {
        ...note,
        id: key,
        groupKey: key,
        noteIds: [],
        deliveryNoteNos: [],
        notes: [],
        dispatchDay,
        totalRecords: 0,
      }
    }

    acc[key].notes.push(note)
    acc[key].noteIds.push(note.id)
    if (note.deliveryNoteNo) acc[key].deliveryNoteNos.push(note.deliveryNoteNo)
    acc[key].totalRecords += Number(note.totalRecords || 0)

    if (!hasDisplayTime(acc[key].dispatchDate) && hasDisplayTime(note.dispatchDate)) {
      acc[key].dispatchDate = note.dispatchDate
    }

    return acc
  }, {})

  return Object.values(groups)
}

export const parseTrackingValue = (item) => {
  const issuedType = normalizeDisbursementType(item.issuedType || item.itemType || item.type)

  if (issuedType === 'advance') {
    const amount = Number(item.amount)
      || Number(String(item.issuedDetails || '').replace(/[^\d.]/g, ''))
      || Number(item.approvedAmount)
      || 0

    return {
      name: 'Advance',
      value: amount,
      unit: 'Rs',
      formatter: formatCurrency,
    }
  }

  const explicitName = item.itemName
    || item.fertilizerType
    || item.fertilizerName
    || item.itemTypeName
    || (!isKnownDisbursementType(item.itemType) ? item.itemType : '')
    || item.itemTypeLabel
    || item.itemCategory
    || item.productName
    || item.detailName
    || item.materialName
    || item.description

  const explicitQty = Number(item.qty)
    || Number(item.quantity)
    || Number(item.approvedQty)
    || 0

  if (explicitName && explicitQty) {
    const unit = item.unit || item.unitType || ''

    return {
      name: explicitName,
      value: explicitQty,
      unit,
      formatter: value => formatQuantity(value, unit),
    }
  }

  const match = String(item.issuedDetails || '').match(/^(.*?)\s*-\s*([\d,.]+)\s*(.*)$/)
  const name = match?.[1]?.trim()
    || explicitName
    || (issuedType === 'fertilizer' ? 'Fertilizer' : 'Item')
  const qty = Number((match?.[2] || explicitQty || '0').toString().replace(/,/g, '')) || 0
  const unit = match?.[3]?.trim() || item.unit || item.unitType || ''

  return {
    name,
    value: qty,
    unit,
    formatter: value => formatQuantity(value, unit),
  }
}

export const summarizeQuantityByName = (rows) => {
  const totals = rows.reduce((acc, row) => {
    const parsed = parseTrackingValue(row)
    const key = normalizeText(parsed.name)

    if (!acc[key]) acc[key] = { name: parsed.name, unit: parsed.unit, qty: 0 }
    acc[key].qty += Number(parsed.value || 0)

    return acc
  }, {})

  return Object.values(totals)
}

export const formatQuantityBreakdown = (rows) => {
  const items = summarizeQuantityByName(rows)
  return items.length ? items.map(item => `${item.name}: ${formatQuantity(item.qty, item.unit)}`) : ['-']
}
