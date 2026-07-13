import { useEffect, useMemo, useRef, useState } from 'react'
import { disbursementApi } from '../../../services/disbursementApi'
import { dashboardRequestsApi } from '../../../services/dashboardRequestsApi'
import { hasAdminPermission } from '../../../services/adminPermissions'
import { useCurrentAdmin } from '../../../hooks/useCurrentAdmin'
import {
  buildBorrowerDispatchGroups, buildBorrowerSummaryGroups, enrichDeliveryNoteDetails, flattenApprovedRequestRows,
  getCompletedUser, getDeviceName, getPaymentMethod, getReceiptRowKey, getReceiptStatus, getTrackingId,
  isTrackingRowAssignedToNote, matchesStatusFilter, normalizeId, normalizePaymentMethod, parseTrackingValue,
} from '../utils/trackingDataHelpers'
import { hasDisplayTime } from '../utils/trackingFormatters'
import { useDisbursementTrackingReports } from './useDisbursementTrackingReports'

const downloadHtmlFile = (html, filename) => {
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function useDisbursementTrackingData() {
  const [trackingRows, setTrackingRows] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('tracking')
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
  const currentAdmin = useCurrentAdmin()
  const selectBorrowerRequestRef = useRef(0)

  const canUpdateTracking = hasAdminPermission(currentAdmin, ['disbursementTracking.update'])
  const canExport = hasAdminPermission(currentAdmin, ['disbursementTracking.export'])

  useEffect(() => {
    const controller = new AbortController()

    setTrackingLoading(true)
    disbursementApi
      .getTracking({
        issuedType: 'all',
        status: statusFilter,
        search: searchTerm,
        fromDate: dateFilter,
        toDate: dateFilter,
        signal: controller.signal,
      })
      .then(result => {
        setTrackingRows(Array.isArray(result) ? result : [])
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
  }, [dateFilter, searchTerm, statusFilter])

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
        setDeliveryNotes(Array.isArray(result) ? result : [])
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

  const filteredRows = useMemo(() => (
    trackingRows.filter(row => matchesStatusFilter(row, statusFilter))
  ), [statusFilter, trackingRows])
  const borrowerDispatchGroups = useMemo(() => (
    buildBorrowerDispatchGroups(
      statusFilter === 'all'
        ? deliveryNotes
        : deliveryNotes.filter(note => trackingRows.some(row => (
          matchesStatusFilter(row, statusFilter) && isTrackingRowAssignedToNote(row, note)
        )))
    )
  ), [deliveryNotes, statusFilter, trackingRows])

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
      .filter(row => matchesStatusFilter(row, statusFilter))
  ), [selectedApprovalRows, selectedNote, selectedTrackingRows, statusFilter])

  const borrowerSummaryGroups = useMemo(() => (
    buildBorrowerSummaryGroups(selectedBorrowerDetails)
  ), [selectedBorrowerDetails])

  const selectedGroup = selectedGroupKey
    ? borrowerSummaryGroups.find(group => group.key === selectedGroupKey) || null
    : null

  const completedCount = filteredRows.filter(item => item.currentStatus === 'completed').length
  const awaitingCount = filteredRows.filter(item => getReceiptStatus(item.currentStatus) === 'awaiting').length
  const dispatchedCount = filteredRows.filter(item => item.currentStatus === 'dispatched').length
  const advanceReceiptRows = useMemo(() => (
    filteredRows
      .filter(row => row.issuedType === 'advance')
      .filter(row => ['account-transfer', 'bank-transfer', 'cheque'].includes(normalizePaymentMethod(getPaymentMethod(row))))
      .map(row => ({
        ...row,
        trackingId: row.id,
        status: row.currentStatus,
        categoryName: 'Advance',
        value: parseTrackingValue(row).value,
        unit: 'Rs',
      }))
  ), [filteredRows])
  const selectedBorrowerName = selectedNote?.borrowerName || '-'
  const selectedBorrowerRoute = selectedNote?.routeName || '-'
  const selectedDeliveryNoteLabel = selectedNote?.deliveryNoteNos?.join(', ') || selectedNote?.deliveryNoteNo || '-'
  const allReportRows = useMemo(() => (
    filteredRows.map(row => ({
      ...row,
      value: parseTrackingValue(row).value,
      unit: parseTrackingValue(row).unit || (row.issuedType === 'advance' ? 'Rs' : ''),
      categoryName: parseTrackingValue(row).name,
      status: row.currentStatus,
      paymentType: row.paymentType || row.method || '',
      method: row.method || row.paymentType || '',
    }))
  ), [filteredRows])

  const reportHandlers = useDisbursementTrackingReports({
    canExport, filteredRows, deliveryNotes, borrowerDispatchGroups, statusFilter, dateFilter, searchTerm,
    allReportRows, selectedNote, selectedBorrowerDetails, selectedDeliveryNoteLabel,
    awaitingCount, dispatchedCount, completedCount, setShowError,
  })

  const selectBorrower = async (note) => {
    const requestId = ++selectBorrowerRequestRef.current

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
          status: statusFilter,
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

      if (requestId !== selectBorrowerRequestRef.current) return

      setSelectedNote(selectedGroupNote)
      setSelectedAssignmentRows(assignmentRows.filter(row => isTrackingRowAssignedToNote(row, selectedGroupNote)))
      setSelectedApprovalRows(flattenApprovedRequestRows(approvedRequests))
      setSelectedGroupKey('')
      setSelectedReceiptRows([])
    } catch (error) {
      if (requestId !== selectBorrowerRequestRef.current) return

      setShowError(error.message || 'Unable to load selected borrower details')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      if (requestId === selectBorrowerRequestRef.current) {
        setSelectedDetailsLoading(false)
      }
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

  const downloadDeliveryNoteHtml = async (deliveryNoteId) => {
    if (!canExport) {
      setShowError('You do not have permission to download delivery notes.')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    try {
      const html = await disbursementApi.getDeliveryNotePrintHtml(deliveryNoteId)
      downloadHtmlFile(html, `delivery-note-${deliveryNoteId}.doc`)
    } catch (error) {
      setShowError(error.message || 'Unable to download delivery note')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const markReceived = async (row) => {
    if (!canUpdateTracking) {
      setShowError('You do not have permission to mark disbursements as received.')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    const id = row?.trackingId

    if (!id) {
      setShowError('Tracking record not found for this row')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    const receiptRowKey = getReceiptRowKey(row)
    const completedBy = getCompletedUser()
    const completedDevice = getDeviceName()

    setReceivingId(normalizeId(id))
    setShowError(null)

    try {
      const updated = await disbursementApi.markReceived({ id, completedBy, completedDevice })

      setTrackingRows(prev => prev.map(item => (
        normalizeId(item.id) === normalizeId(id) ? updated : item
      )))
      setSelectedAssignmentRows(prev => prev.map(item => (
        normalizeId(item.id) === normalizeId(id) ? updated : item
      )))
      setSelectedReceiptRows(prev => prev.map(item => (
        getReceiptRowKey(item) === receiptRowKey
          ? {
              ...item,
              status: updated.currentStatus,
              completedDate: updated.completedDate,
              completedBy: updated.completedBy,
              completedDevice: updated.completedDevice,
            }
          : item
      )))
      setViewingItem(current => normalizeId(current?.id) === normalizeId(id) ? updated : current)
      setShowSuccess('Receipt confirmed successfully')
      setTimeout(() => setShowSuccess(null), 2500)
    } catch (error) {
      setShowError(error.message || 'Unable to confirm receipt')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setReceivingId(null)
    }
  }

  const resetSelection = () => {
    setSelectedNote(null)
    setSelectedAssignmentRows([])
    setSelectedApprovalRows([])
    setSelectedGroupKey('')
    setSelectedReceiptRows([])
  }

  return {
    trackingLoading, deliveryLoading, showSuccess, showError,
    filteredRows, borrowerDispatchGroups, completedCount, awaitingCount, dispatchedCount, advanceReceiptRows,
    searchTerm, statusFilter, dateFilter, activeTab, setActiveTab,
    receivingId, canUpdateTracking, canExport, viewingItem, setViewingItem,
    selectedNote, selectedDetailsLoading, selectedBorrowerDetails, selectedBorrowerName, selectedBorrowerRoute,
    borrowerSummaryGroups, selectedGroup, selectedReceiptRows,
    onSearchTermChange: (value) => { setSearchTerm(value); resetSelection() },
    onStatusFilterChange: (value) => { setStatusFilter(value); resetSelection() },
    onDateFilterChange: (value) => { setDateFilter(value); resetSelection() },
    onClearDate: () => { setDateFilter(''); resetSelection() },
    ...reportHandlers,
    selectBorrower, viewDetails, selectSummaryGroup, downloadDeliveryNoteHtml, markReceived,
  }
}
