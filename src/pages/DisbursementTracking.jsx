import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle,
  CheckCircle2,
  Eye,
  FileText,
  Leaf,
  Package,
  Printer,
  RefreshCw,
  Search,
  Sprout,
  X,
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Combobox from '../components/ui/Combobox'
import { disbursementApi } from '../services/disbursementApi'
import { dashboardRequestsApi } from '../services/dashboardRequestsApi'
import { downloadDocReport, printReportAsPdf } from '../utils/reports'

const typeStyles = {
  advance: {
    label: 'Advance',
    icon: Banknote,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  fertilizer: {
    label: 'Fertilizer',
    icon: Sprout,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  items: {
    label: 'Item',
    icon: Package,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  },
}

const formatDisplayDate = (date) => {
  if (!date) return '-'

  const textDate = String(date).slice(0, 10)
  const parsedDate = new Date(`${textDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) return '-'

  return parsedDate.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const formatOptionalDate = (date) => date ? formatDisplayDate(date) : '-'

const formatDateTime = (date) => {
  if (!date) return '-'
  if (!hasDisplayTime(date)) return formatDisplayDate(date)

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return formatDisplayDate(date)

  return parsedDate.toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDisplayTime = (date) => {
  if (!date) return '-'

  const value = String(date)
  if (!value.includes('T') && !/\d{1,2}:\d{2}/.test(value)) return '-'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return '-'

  return parsedDate.toLocaleTimeString('en-LK', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const hasDisplayTime = (date) => {
  const value = String(date || '')
  return value.includes('T') || /\d{1,2}:\d{2}/.test(value)
}

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const formatQuantity = (value, unit) => `${Number(value || 0).toLocaleString()} ${unit || ''}`.trim()

const formatByUnit = (value, unit) => {
  if (unit === 'Rs') return formatCurrency(value)

  const cleanUnit = unit && unit !== '-' ? unit : ''
  return formatQuantity(value, cleanUnit)
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const normalizeId = (value) => (
  value === undefined || value === null ? '' : String(value).trim()
)

const getRequestId = (item = {}) => normalizeId(
  item.requestId
  || item.requestID
  || item.disbursementRequestId
  || item.disbursementRequestID
  || item.sourceRequestId
)

const getDeliveryNoteId = (item = {}) => normalizeId(
  item.deliveryNoteId
  || item.deliveryNoteID
  || item.deliveryNote?.id
  || item.deliveryNoteNo
  || item.deliveryNoteNumber
)

const getExplicitTrackingId = (item = {}) => normalizeId(
  item.trackingId
  || item.trackingID
  || item.disbursementRecordId
  || item.disbursementRecordID
  || item.disbursementTrackingId
  || item.disbursementTrackingID
  || item.trackingRecordId
  || item.trackingRecordID
)

const getTrackingId = (item = {}) => normalizeId(
  getExplicitTrackingId(item)
  || item.id
)

const normalizeDisbursementType = (value) => {
  const type = String(value || '').trim().toLowerCase()

  if (type.includes('advance')) return 'advance'
  if (type.includes('fertilizer') || type.includes('fertiliser')) return 'fertilizer'
  if (type === 'item' || type === 'items' || type.includes('item')) return 'items'
  return 'items'
}

const isKnownDisbursementType = (value) => {
  const type = String(value || '').trim().toLowerCase()
  return ['advance', 'fertilizer', 'fertilizers', 'fertiliser', 'fertilisers', 'item', 'items'].includes(type)
}

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

const looksLikeFertilizerName = (value) => {
  const text = normalizeText(value)
  return fertilizerNameHints.some(hint => text.includes(hint))
}

const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent || ''

  if (/Edg\//.test(ua)) return 'Microsoft Edge browser'
  if (/Chrome\//.test(ua)) return 'Chrome browser'
  if (/Firefox\//.test(ua)) return 'Firefox browser'
  if (/Safari\//.test(ua)) return 'Safari browser'
  return navigator.platform || 'Unknown device'
}

const getCompletedUser = () => {
  if (typeof window === 'undefined') return 'Current User'
  return window.localStorage.getItem('supplier-app-current-user') || 'Current User'
}

const pickPersonName = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value

  return value.name
    || value.fullName
    || value.displayName
    || value.userName
    || value.username
    || value.email
    || ''
}

const getApprovedBy = (...items) => {
  for (const item of items.filter(Boolean)) {
    const value = item.checkedBy
      || item.CheckedBy
      || item.checkedByName
      || item.CheckedByName
      || item.checkedByUserName
      || item.CheckedByUserName
      || pickPersonName(item.checkedByUser)
      || pickPersonName(item.CheckedByUser)
      || pickPersonName(item.approvedBy)
      || pickPersonName(item.ApprovedBy)
      || item.approvedByName
      || item.ApprovedByName
      || item.approvedByFullName
      || item.ApprovedByFullName
      || item.approvedByUserName
      || item.ApprovedByUserName
      || item.approvedUserName
      || item.ApprovedUserName
      || pickPersonName(item.approvedUser)
      || pickPersonName(item.ApprovedUser)
      || pickPersonName(item.approvedByUser)
      || pickPersonName(item.ApprovedByUser)
      || item.requestApprovedBy
      || item.requestApprovedByName
      || item.requestApprovedUserName
      || pickPersonName(item.requestApprovedUser)
      || item.approvalBy
      || item.approvalByName
      || item.approvalUserName
      || pickPersonName(item.approvalUser)
      || item.approverName
      || item.approvedName
      || item.reviewedBy
      || item.reviewedByName
      || item.authorizedBy
      || item.authorizedByName
      || item.actionBy
      || item.updatedBy

    const textValue = String(value || '').trim()
    if (textValue && textValue !== '-') return value
  }

  return '-'
}

const getSupplierName = (item) => item.supplierName || item.supplier || item.name || '-'

const getRegNo = (item) => item.regNo || item.supplierRegNo || item.registrationNo || '-'

const getRouteName = (item) => item.route || item.routeName || '-'

const getDeliveryNoteNo = (item = {}) => normalizeId(
  item.deliveryNoteNo
  || item.deliveryNoteNumber
  || item.deliveryNote?.deliveryNoteNo
)

const getDetailIssuedType = (detail = {}, trackingRecord = null) => {
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

const getDetailCategoryName = (detail = {}, issuedType = '', trackingRecord = null) => {
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

const getDetailValue = (detail = {}, issuedType = '', trackingRecord = null) => {
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

const flattenApprovedRequestRows = (response = {}) => [
  ...(response.advance || []).map(row => ({ ...row, issuedType: 'advance' })),
  ...(response.fertilizer || []).map(row => ({ ...row, issuedType: 'fertilizer' })),
  ...(response.items || []).map(row => ({ ...row, issuedType: 'items' })),
]

const getRequestApprovedBy = (request) => {
  if (!request) return ''
  const value = request.checkedBy
    || request.CheckedBy
    || request.approvedBy
    || request.ApprovedBy
    || request.checkedByName
    || request.approvedByName
    || ''
  const textValue = String(value || '').trim()
  return textValue && textValue !== '-' ? textValue : ''
}

const findApprovedRequestForDetail = (detail, approvalRows) => {
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

const getDispatchDay = (item = {}) => String(
  item.dispatchDate
  || item.dispatchedAt
  || item.issueDate
  || item.createdAt
  || ''
).slice(0, 10)

const buildBorrowerDispatchGroups = (notes) => {
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

const parseTrackingValue = (item) => {
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

const findTrackingRecordForDetail = (detail, note, trackingRows) => {
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

  return trackingRows.find(row => {
    const rowTrackingId = getTrackingId(row)
    const rowType = normalizeDisbursementType(row.issuedType || row.itemType || row.type)
    const rowRegNo = getRegNo(row)
    const rowRequestId = getRequestId(row)
    const rowDeliveryNoteId = getDeliveryNoteId(row)
    const rowValue = parseTrackingValue(row)
    const rowCategory = normalizeText(rowValue.name)
    const rowUnit = normalizeText(rowValue.unit)

    const sameType = rowType === detailType
    const sameRegNo = normalizeText(rowRegNo) === normalizeText(detailRegNo)
    const sameRequest = detailRequestId && rowRequestId && rowRequestId === detailRequestId
    const sameDeliveryNote = rowDeliveryNoteId && (
      (detailDeliveryNoteId && rowDeliveryNoteId === detailDeliveryNoteId)
      || (noteIds.size > 0 && noteIds.has(rowDeliveryNoteId))
    )
    const sameCategory = !detailCategory || !rowCategory || rowCategory === detailCategory
    const sameUnit = !detailUnit || !rowUnit || rowUnit === detailUnit

    if (detailTrackingId && rowTrackingId && detailTrackingId === rowTrackingId) return true

    return sameType && (sameRequest || (sameDeliveryNote && sameRegNo && sameCategory && sameUnit))
  })
}

const isTrackingRowAssignedToNote = (row, note) => {
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

const mergeAssignedDetails = (note, trackingRows) => {
  if (!note) return []

  const detailRows = Array.isArray(note.details) ? note.details : []
  const trackingDetails = trackingRows.filter(row => isTrackingRowAssignedToNote(row, note))
  const sourceRows = detailRows.length ? detailRows : trackingDetails
  const merged = []
  const seen = new Set()

  sourceRows.forEach(row => {
    const parsed = parseTrackingValue(row)
    const key = [
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

const getDispatchDateTime = (detail, source, note) => (
  detail.dispatchedAt
  || detail.dispatchDate
  || note?.dispatchDate
  || source.dispatchedAt
  || source.dispatchDate
  || source.issueDate
  || detail.issueDate
  || note?.createdAt
)

const enrichDeliveryNoteDetails = (note, trackingRows, approvalRows = []) => {
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
      trackingId: trackingRecord?.id || detail.disbursementRecordId || detail.trackingId || detail.id || null,
      requestId: getRequestId(detail) || getRequestId(trackingRecord),
      issuedType,
      categoryName,
      value,
      unit,
      supplierName: getSupplierName(detail) !== '-' ? getSupplierName(detail) : getSupplierName(trackingRecord),
      regNo: getRegNo(detail) !== '-' ? getRegNo(detail) : getRegNo(trackingRecord),
      route: getRouteName(detail) !== '-' ? getRouteName(detail) : getRouteName(trackingRecord),
      approvedBy: getRequestApprovedBy(approvedRequest) || getApprovedBy(detail, trackingRecord),
      dispatchDate: getDispatchDateTime(detail, trackingRecord || detail, note),
      status: trackingRecord?.currentStatus || detail.currentStatus || detail.status || 'awaiting',
    }
  })
}

const buildBorrowerSummaryGroups = (rows) => {
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

const getDisbursementCategoryLabel = (group) => {
  if (!group) return '-'
  if (group.issuedType === 'advance') return 'Advance'

  const typeLabel = typeStyles[group.issuedType]?.label || 'Item'
  return `${typeLabel} - ${group.categoryName}`
}

const getReceiptStatus = (status) => String(status || '').toLowerCase() === 'completed' ? 'completed' : 'awaiting'

const sanitizeFilenamePart = (value) => (
  String(value || '')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
)

function EmptyTableRow({ colSpan, icon: Icon = AlertCircle, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-500">
        <Icon size={32} className="mx-auto mb-2 opacity-30" />
        {message}
      </td>
    </tr>
  )
}

function TrackingDetailsModal({ item, onClose }) {
  if (!item) return null

  const parsedValue = parseTrackingValue(item)
  const amountOrQty = item.issuedType === 'advance'
    ? formatCurrency(parsedValue.value)
    : formatQuantity(parsedValue.value, parsedValue.unit)
  const rows = [
    ['Supplier RegNo', item.regNo],
    ['Supplier Name', item.supplierName],
    ['Amount / Quantity', amountOrQty],
    ['Request Date', formatOptionalDate(item.requestDate || item.issueDate)],
    ['Approved Date', formatOptionalDate(item.approvedDate || item.issueDate)],
    ['Delivery Note', item.deliveryNoteNo || '-'],
    ['Dispatched Date', formatOptionalDate(item.dispatchedAt)],
    ['Complete Date', formatOptionalDate(item.completedDate)],
    ['Completed By', item.completedBy || '-'],
    ['Completed Device', item.completedDevice || '-'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 dark:text-green-300">Disbursement record</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{item.supplierName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{parsedValue.name} / {amountOrQty}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 px-3 py-3 dark:border-slate-700">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Current Status</p>
            <div className="mt-2">
              <StatusBadge status={item.currentStatus || 'awaiting'} className="px-2.5 py-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DisbursementTracking() {
  const [trackingRows, setTrackingRows] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(null)
  const [showError, setShowError] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(true)
  const [receivingId, setReceivingId] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [deliveryLoading, setDeliveryLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)
  const [selectedAssignmentRows, setSelectedAssignmentRows] = useState([])
  const [selectedApprovalRows, setSelectedApprovalRows] = useState([])
  const [selectedGroupKey, setSelectedGroupKey] = useState('')
  const [selectedReceiptRows, setSelectedReceiptRows] = useState([])
  const [selectedDetailsLoading, setSelectedDetailsLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    setTrackingLoading(true)
    disbursementApi
      .getTracking({
        issuedType: 'all',
        status: 'all',
        search: searchTerm,
        fromDate: dateFilter,
        toDate: dateFilter,
        signal: controller.signal,
      })
      .then(result => {
        setTrackingRows(result)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setShowError(error.message || 'Unable to load disbursement tracking')
          setTimeout(() => setShowError(null), 3000)
        }
      })
      .finally(() => {
        setTrackingLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [dateFilter, searchTerm])

  useEffect(() => {
    const controller = new AbortController()

    setDeliveryLoading(true)
    disbursementApi
      .getDeliveryNotes({
        status: 'all',
        search: searchTerm,
        fromDate: dateFilter,
        toDate: dateFilter,
        signal: controller.signal,
      })
      .then(result => {
        setDeliveryNotes(result)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setShowError(error.message || 'Unable to load borrower delivery notes')
          setTimeout(() => setShowError(null), 3000)
        }
      })
      .finally(() => {
        setDeliveryLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [dateFilter, searchTerm])

  const filteredRows = trackingRows
  const borrowerDispatchGroups = useMemo(() => (
    buildBorrowerDispatchGroups(deliveryNotes)
  ), [deliveryNotes])

  const selectedTrackingRows = useMemo(() => {
    const merged = [...trackingRows]
    const seen = new Set(merged.map(row => getTrackingId(row)))

    selectedAssignmentRows.forEach(row => {
      const id = getTrackingId(row)
      if (id && seen.has(id)) return
      if (id) seen.add(id)
      merged.push(row)
    })

    return merged
  }, [selectedAssignmentRows, trackingRows])

  const selectedBorrowerDetails = useMemo(() => (
    enrichDeliveryNoteDetails(selectedNote, selectedTrackingRows, selectedApprovalRows)
  ), [selectedApprovalRows, selectedNote, selectedTrackingRows])

  const borrowerSummaryGroups = useMemo(() => (
    buildBorrowerSummaryGroups(selectedBorrowerDetails)
  ), [selectedBorrowerDetails])

  const selectedGroup = selectedGroupKey
    ? borrowerSummaryGroups.find(group => group.key === selectedGroupKey) || null
    : null

  const completedCount = filteredRows.filter(item => item.currentStatus === 'completed').length
  const awaitingCount = filteredRows.filter(item => getReceiptStatus(item.currentStatus) === 'awaiting').length
  const dispatchedCount = filteredRows.filter(item => item.currentStatus === 'dispatched').length
  const selectedBorrowerName = selectedNote?.borrowerName || '-'
  const selectedBorrowerRoute = selectedNote?.routeName || '-'
  const selectedDeliveryNoteLabel = selectedNote?.deliveryNoteNos?.join(', ') || selectedNote?.deliveryNoteNo || '-'

  const buildTrackingReport = () => ({
    filename: 'disbursement-tracking-report',
    title: 'Disbursement Tracking Report',
    subtitle: `Date: ${dateFilter || 'Any'} | Search: ${searchTerm || 'None'}`,
    rows: filteredRows,
    summary: [
      { label: 'Tracking Records', value: filteredRows.length },
      { label: 'Suppliers', value: new Set(filteredRows.map(row => row.regNo)).size },
      { label: 'Awaiting', value: awaitingCount },
      { label: 'Dispatched', value: dispatchedCount },
      { label: 'Completed', value: completedCount },
    ],
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
      { label: 'Item / Detail', value: row => parseTrackingValue(row).name, width: 1.4 },
      { label: 'Amount / Qty', value: row => formatByUnit(parseTrackingValue(row).value, parseTrackingValue(row).unit), width: 1 },
      { label: 'Method', value: 'method', width: 1 },
      { label: 'Issue Date / Time', value: row => formatDateTime(row.issueDate), width: 1.15 },
      { label: 'Status', value: 'currentStatus', width: 0.8 },
    ],
  })

  const buildDeliveryNoteReport = () => {
    const noteIds = new Set(deliveryNotes.map(note => note.id))
    const detailRows = trackingRows.filter(row => noteIds.has(row.deliveryNoteId))

    return ({
      filename: 'delivery-note-borrower-report',
      title: 'Borrower Delivery Note Report',
      subtitle: `Date: ${dateFilter || 'Any'} | Search: ${searchTerm || 'None'}`,
      rows: borrowerDispatchGroups,
      summary: [
        { label: 'Borrowers', value: borrowerDispatchGroups.length },
        { label: 'Suppliers', value: new Set(detailRows.map(row => row.regNo)).size || '-' },
        { label: 'Issued', value: deliveryNotes.filter(note => note.status === 'issued').length },
        { label: 'Returned', value: deliveryNotes.filter(note => note.status === 'returned').length },
        { label: 'Completed', value: deliveryNotes.filter(note => note.status === 'completed').length },
      ],
      totals: [
        { label: 'Supplier Count', value: new Set(detailRows.map(row => row.regNo)).size || '-' },
        { label: 'Advance Count', value: detailRows.filter(row => row.issuedType === 'advance').length },
        { label: 'Fertilizer Count', value: detailRows.filter(row => row.issuedType === 'fertilizer').length },
        { label: 'Item Count', value: detailRows.filter(row => row.issuedType === 'items').length },
        { label: 'Borrower Count', value: borrowerDispatchGroups.length },
        { label: 'Total Dispatched Records', value: deliveryNotes.reduce((sum, note) => sum + Number(note.totalRecords || 0), 0) },
      ],
      columns: [
        { label: 'DN No', value: row => row.deliveryNoteNos?.join(', ') || row.deliveryNoteNo || '-', width: 1.15 },
        { label: 'Dispatch Date', value: row => formatDateTime(row.dispatchDate), width: 1.3 },
        { label: 'Borrower Name', value: 'borrowerName', width: 1.5 },
        { label: 'Borrower Role', value: 'borrowerRole', width: 1.1 },
        { label: 'Vehicle No', value: 'vehicleNo', width: 0.85 },
        { label: 'Route', value: 'routeName', width: 1.35 },
        { label: 'Records', value: 'totalRecords', width: 0.65 },
        { label: 'Status', value: 'status', width: 0.8 },
      ],
    })
  }

  const buildSelectedDeliveryNoteReport = () => {
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

    return ({
      filename: `${safeDnNo}-${safeBorrowerName}-${dispatchDate}`,
      title: `Selected Delivery Note - ${dnNo}`,
      rows: selectedBorrowerDetails,
      summary: [
        { label: 'Delivery Note No', value: dnNo },
        { label: 'Borrower', value: borrowerName },
        { label: 'Route', value: selectedNote?.routeName || '-' },
        { label: 'Vehicle No', value: selectedNote?.vehicleNo || '-' },
        { label: 'Dispatch Date', value: formatDisplayDate(selectedNote?.dispatchDate) },
        { label: 'Dispatch Time', value: formatDisplayTime(selectedNote?.dispatchDate) },
        { label: 'Suppliers', value: supplierCount },
        { label: 'Records', value: selectedBorrowerDetails.length },
      ],
      totals: [
        { label: 'Supplier Count', value: supplierCount },
        { label: 'Advance Total', value: formatCurrency(advanceTotal) },
        { label: 'Fertilizer Quantity', value: formatQuantity(fertilizerQty) },
        { label: 'Item Quantity', value: formatQuantity(itemQty) },
        { label: 'Completed Receipts', value: completedReceipts },
        { label: 'Awaiting Receipts', value: selectedBorrowerDetails.length - completedReceipts },
      ],
      columns: [
        { label: 'Supplier Name', value: 'supplierName', width: 1.9 },
        { label: 'Reg No', value: 'regNo', width: 0.8 },
        { label: 'Category', value: row => `${typeStyles[row.issuedType]?.label || 'Item'} - ${row.categoryName}`, width: 1.55 },
        { label: 'Amount / Qty', value: row => formatByUnit(row.value, row.unit), width: 1.05 },
        { label: 'Unit', value: 'unit', width: 0.65 },
        { label: 'Dispatch Date / Time', value: row => formatDateTime(row.dispatchDate), width: 1.35 },
        { label: 'Approved By', value: 'approvedBy', width: 1.15 },
        { label: 'Receipt Status', value: row => getReceiptStatus(row.status), width: 0.95 },
      ],
    })
  }

  const handleSelectedDeliveryNoteReportFormat = (format) => {
    if (!format) return

    if (!selectedNote) {
      setShowError('Please select a borrower delivery note first')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    if (selectedBorrowerDetails.length === 0) {
      setShowError('Selected delivery note has no supplier records to download')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    if (format === 'doc') {
      downloadDocReport(buildSelectedDeliveryNoteReport())
      return
    }

    if (!printReportAsPdf(buildSelectedDeliveryNoteReport())) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const handleTrackingReportFormat = (format) => {
    if (!format) return
    if (format === 'doc') {
      downloadDocReport(buildTrackingReport())
      return
    }
    if (!printReportAsPdf(buildTrackingReport())) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const handleDeliveryNoteReportFormat = (format) => {
    if (!format) return
    if (format === 'doc') {
      downloadDocReport(buildDeliveryNoteReport())
      return
    }
    if (!printReportAsPdf(buildDeliveryNoteReport())) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const selectBorrower = async (note) => {
    setSelectedNote({ ...note, details: [] })
    setSelectedAssignmentRows([])
    setSelectedApprovalRows([])
    setSelectedGroupKey('')
    setSelectedReceiptRows([])
    setSelectedDetailsLoading(true)
    setShowError(null)

    try {
      const notesToLoad = note.notes?.length ? note.notes : [note]
      const [detailsList, assignmentRows, approvedRequests] = await Promise.all([
        Promise.all(notesToLoad.map(item => disbursementApi.getDeliveryNote(item.id))),
        disbursementApi.getTracking({
          issuedType: 'all',
          status: 'all',
          fromDate: '',
          toDate: '',
        }),
        dashboardRequestsApi.list({
          status: 'approved',
          fromDate: '',
          toDate: '',
        }),
      ])
      const details = detailsList.filter(Boolean)
      const selectedDetails = details.flatMap(item => (
        (item.details || []).map(detail => ({
          ...detail,
          deliveryNoteId: item.id,
          deliveryNoteNo: item.deliveryNoteNo,
          dispatchDate: detail.dispatchDate || detail.dispatchedAt || item.dispatchDate,
          borrowerName: item.borrowerName,
          borrowerRole: item.borrowerRole,
          vehicleNo: item.vehicleNo,
          routeName: detail.routeName || item.routeName,
        }))
      ))
      const selectedNoteIds = details.map(item => item.id)
      const selectedNoteNos = details.map(item => item.deliveryNoteNo).filter(Boolean)
      const selectedDispatchDate = details.find(item => hasDisplayTime(item.dispatchDate))?.dispatchDate
        || details[0]?.dispatchDate
        || note.dispatchDate
      const selectedGroupNote = {
        ...note,
        ...details[0],
        id: note.groupKey || details[0]?.id || note.id,
        groupKey: note.groupKey || note.id,
        noteIds: selectedNoteIds,
        deliveryNoteNos: selectedNoteNos,
        deliveryNoteNo: selectedNoteNos.join(', '),
        dispatchDate: selectedDispatchDate,
        totalRecords: details.reduce((sum, item) => sum + Number(item.totalRecords || item.details?.length || 0), 0),
        details: selectedDetails,
        notes: details,
      }

      setSelectedNote(selectedGroupNote)
      setSelectedAssignmentRows(assignmentRows.filter(row => isTrackingRowAssignedToNote(row, selectedGroupNote)))
      setSelectedApprovalRows(flattenApprovedRequestRows(approvedRequests))
      setSelectedGroupKey('')
      setSelectedReceiptRows([])
    } catch (error) {
      setShowError(error.message || 'Unable to load selected borrower details')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setSelectedDetailsLoading(false)
    }
  }

  const viewDetails = (row) => {
    const trackingRecord = trackingRows.find(item => item.id === row.trackingId)

    if (trackingRecord) {
      setViewingItem(trackingRecord)
      return
    }

    setViewingItem({
      ...row,
      issuedType: row.issuedType,
      currentStatus: row.status,
      issueDate: row.dispatchDate,
    })
  }

  const selectSummaryGroup = (group) => {
    setSelectedGroupKey(group.key)
    setSelectedReceiptRows([...(group.rows || [])])
  }

  const openPrintHtml = async (deliveryNoteId) => {
    try {
      const html = await disbursementApi.getDeliveryNotePrintHtml(deliveryNoteId)
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setShowError('Popup blocked. Please allow popups to print the delivery note.')
        setTimeout(() => setShowError(null), 3000)
        return
      }
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    } catch (error) {
      setShowError(error.message || 'Unable to print delivery note')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const markReceived = async (id) => {
    if (!id) {
      setShowError('Tracking record not found for this row')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    const completedBy = getCompletedUser()
    const completedDevice = getDeviceName()

    setReceivingId(id)
    setShowError(null)

    try {
      const updated = await disbursementApi.markReceived({ id, completedBy, completedDevice })

      setTrackingRows(prev => prev.map(item => (
        item.id === id ? updated : item
      )))
      setSelectedAssignmentRows(prev => prev.map(item => (
        item.id === id ? updated : item
      )))
      setSelectedReceiptRows(prev => prev.map(item => (
        item.trackingId === id ? { ...item, status: updated.currentStatus } : item
      )))
      setViewingItem(current => current?.id === id ? updated : current)
      setShowSuccess('Receipt confirmed successfully')
      setTimeout(() => setShowSuccess(null), 2500)
    } catch (error) {
      setShowError(error.message || 'Unable to confirm receipt')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setReceivingId(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-white shadow-lg">
          <CheckCircle size={16} /> {showSuccess}
        </div>
      )}
      {showError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg">
          <AlertCircle size={16} /> {showError}
        </div>
      )}

      {(trackingLoading || deliveryLoading) && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading disbursement tracking records...
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-700">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Tracking</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a borrower first, review the selected disbursement category, then confirm supplier receipts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Combobox
            value=""
            onChange={handleDeliveryNoteReportFormat}
            disabled={borrowerDispatchGroups.length === 0}
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
            onChange={handleTrackingReportFormat}
            disabled={filteredRows.length === 0}
            placeholder="Tracking Report"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'doc', label: 'DOC' },
            ]}
            className="min-w-44"
            buttonClassName="bg-green-700 text-slate-200 hover:bg-green-800 dark:bg-green-700 dark:text-slate-200 [&>span]:!text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Borrowers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{borrowerDispatchGroups.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900/50 dark:bg-green-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Confirmed receipts</p>
          <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-900/50 dark:bg-orange-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Awaiting receipts</p>
          <p className="mt-2 text-3xl font-bold text-orange-800 dark:text-orange-200">{awaitingCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Dispatched records</p>
          <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{dispatchedCount}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setSelectedNote(null)
                setSelectedAssignmentRows([])
                setSelectedApprovalRows([])
                setSelectedGroupKey('')
                setSelectedReceiptRows([])
              }}
              placeholder="Search borrower, route, vehicle no, supplier, reg no, or item"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Dispatch date
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value)
                setSelectedNote(null)
                setSelectedAssignmentRows([])
                setSelectedApprovalRows([])
                setSelectedGroupKey('')
                setSelectedReceiptRows([])
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </label>

          {dateFilter && (
            <button
              type="button"
              onClick={() => {
                setDateFilter('')
                setSelectedNote(null)
                setSelectedAssignmentRows([])
                setSelectedApprovalRows([])
                setSelectedGroupKey('')
                setSelectedReceiptRows([])
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear Date
            </button>
          )}
        </div>
      </section>

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
                  onChange={handleSelectedDeliveryNoteReportFormat}
                  disabled={selectedDetailsLoading || selectedBorrowerDetails.length === 0}
                  placeholder="Selected DN Report"
                  options={[
                    { value: 'pdf', label: 'PDF' },
                    { value: 'doc', label: 'DOC' },
                  ]}
                  className="min-w-44"
                  buttonClassName="bg-green-700 text-slate-100 hover:bg-green-800 dark:bg-green-700 dark:text-slate-100 [&>span]:!text-slate-100"
                />
                {selectedNote.noteIds?.length === 1 && (
                  <button
                    type="button"
                    onClick={() => openPrintHtml(selectedNote.noteIds[0])}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Printer size={12} /> Print Selected DN
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-72 overflow-auto">
          <table className="w-full min-w-[780px] text-sm">
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
              {borrowerDispatchGroups.length === 0 ? (
                <EmptyTableRow colSpan={5} icon={FileText} message="No borrower dispatch records found" />
              ) : borrowerDispatchGroups.map(note => {
                const isSelected = selectedNote?.groupKey === note.groupKey

                return (
                  <tr
                    key={note.groupKey}
                    onClick={() => selectBorrower(note)}
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

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Selected Borrower Disbursement Summary</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Click Advance / Fertilizer / Item row to load supplier-wise receipt table below
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
                <p className="font-semibold uppercase tracking-wide text-slate-400">Name</p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedBorrowerName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
                <p className="font-semibold uppercase tracking-wide text-slate-400">Route</p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedBorrowerRoute}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
                <p className="font-semibold uppercase tracking-wide text-slate-400">Vehicle</p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedNote?.vehicleNo || '-'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/40">
                <p className="font-semibold uppercase tracking-wide text-slate-400">Records</p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedBorrowerDetails.length}</p>
              </div>
            </div>
          </div>
        </div>

        {selectedDetailsLoading ? (
          <div className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" />
              Loading selected borrower disbursements...
            </span>
          </div>
        ) : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">Disbursement Category</th>
                  <th className="px-4 py-3 text-left">Net Amount / Qty</th>
                  <th className="px-4 py-3 text-left">Unit Type</th>
                  <th className="px-4 py-3 text-left">Dispatch Date / Time</th>
                  <th className="px-4 py-3 text-left">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {!selectedNote ? (
                  <EmptyTableRow colSpan={5} icon={AlertCircle} message="Select a borrower from the first table" />
                ) : borrowerSummaryGroups.length === 0 ? (
                  <EmptyTableRow colSpan={5} icon={AlertCircle} message="No disbursement records found for selected borrower" />
                ) : borrowerSummaryGroups.map(group => {
                  const typeStyle = typeStyles[group.issuedType] || typeStyles.items
                  const TypeIcon = typeStyle.icon
                  const isSelected = selectedGroup?.key === group.key

                  return (
                    <tr
                      key={group.key}
                      onClick={() => selectSummaryGroup(group)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors dark:border-slate-700/50 ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyle.className}`}>
                          <TypeIcon size={12} />
                          {getDisbursementCategoryLabel(group)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{formatByUnit(group.total, group.unit)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{group.unit || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDateTime(group.dispatchDate)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{group.approvedBy || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Supplier Receipt Confirmation</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedGroup ? `${getDisbursementCategoryLabel(selectedGroup)} for ${selectedBorrowerName} / ${selectedBorrowerRoute}` : 'Select a summary row to show supplier records'}
              </p>
            </div>
            {selectedGroup && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {selectedReceiptRows.length} supplier record{selectedReceiptRows.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left">Supplier Name</th>
                <th className="px-4 py-3 text-left">Reg No</th>
                <th className="px-4 py-3 text-left">Disbursement</th>
                <th className="px-4 py-3 text-left">Amount / Qty</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {!selectedGroup ? (
                <EmptyTableRow colSpan={7} icon={AlertCircle} message="Select a borrower summary row first" />
              ) : selectedReceiptRows.length === 0 ? (
                <EmptyTableRow colSpan={7} icon={AlertCircle} message="No suppliers found for this disbursement category" />
              ) : selectedReceiptRows.map(row => {
                const receiptStatus = getReceiptStatus(row.status)
                const canMarkReceived = receiptStatus !== 'completed'
                const actionDisabled = receivingId === row.trackingId || !row.trackingId

                return (
                  <tr key={`${row.regNo}-${row.issuedType}-${row.categoryName}-${row.trackingId || row.id}`} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{row.supplierName}</p>
                      <button
                        type="button"
                        onClick={() => viewDetails(row)}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 dark:text-green-400"
                      >
                        <Eye size={11} /> View details
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-green-700 dark:text-green-400">{row.regNo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{row.issuedType === 'advance' ? 'Advance' : row.categoryName || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{formatByUnit(row.value, row.unit)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.route}</td>
                    <td className="px-4 py-3">
                      {canMarkReceived ? (
                        <button
                          type="button"
                          onClick={() => markReceived(row.trackingId)}
                          disabled={actionDisabled}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                          title={!row.trackingId ? 'Tracking record not matched for this detail' : 'Mark received'}
                        >
                          {receivingId === row.trackingId ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          Mark Received
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">Receipt confirmed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={receiptStatus} className="px-2.5 py-1" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <TrackingDetailsModal item={viewingItem} onClose={() => setViewingItem(null)} />
    </div>
  )
}
