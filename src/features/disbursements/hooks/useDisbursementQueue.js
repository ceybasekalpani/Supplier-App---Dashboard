import { useEffect, useMemo, useState } from 'react'
import { disbursementApi } from '../../../services/disbursementApi'
import { downloadDocReport, printReportAsPdf } from '../../../utils/reports'
import { hasAdminPermission } from '../../../services/adminPermissions'
import { useCurrentAdmin } from '../../../hooks/useCurrentAdmin'
import { getAdvanceMethod, isDeliveryNoteEligible, matchesStatusFilter, rowKey } from '../utils/disbursementHelpers'
import { buildQueueReport } from '../utils/buildQueueReport'

export function useDisbursementQueue() {
  const [selectedRoute, setSelectedRoute] = useState('all')
  const [issueTab, setIssueTab] = useState('advance')
  const [advancePaymentFilter, setAdvancePaymentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('approved')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentMethods, setPaymentMethods] = useState({})
  const [selectedRows, setSelectedRows] = useState({})
  const [showSuccess, setShowSuccess] = useState(null)
  const [showError, setShowError] = useState(null)
  const [queueError, setQueueError] = useState('')
  const [queueLoading, setQueueLoading] = useState(true)
  const [issuingKey, setIssuingKey] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [lastDeliveryNote, setLastDeliveryNote] = useState(null)
  const [borrower, setBorrower] = useState({
    borrowerName: '',
    borrowerRole: '',
    vehicleNo: '',
    routeName: '',
    remarks: '',
  })

  const [advancesState, setAdvancesState] = useState([])
  const [fertilizersState, setFertilizersState] = useState([])
  const [itemsState, setItemsState] = useState([])
  const [routeNames, setRouteNames] = useState([])
  const currentAdmin = useCurrentAdmin()

  const canDispatch = hasAdminPermission(currentAdmin, ['disbursements.create'])
  const canExport = hasAdminPermission(currentAdmin, ['disbursements.export'])

  useEffect(() => {
    const controller = new AbortController()

    disbursementApi
      .getQueue({
        route: selectedRoute,
        fromDate: dateFrom,
        toDate: dateTo,
        signal: controller.signal,
      })
      .then(result => {
        const advance = result.advance || []
        const fertilizer = result.fertilizer || []
        const items = result.items || []

        setQueueError('')
        setAdvancesState(advance)
        setFertilizersState(fertilizer)
        setItemsState(items)
        setRouteNames(previous => {
          const routes = [...advance, ...fertilizer, ...items]
            .map(item => item.route)
            .filter(Boolean)

          return Array.from(new Set([...previous, ...routes])).sort()
        })
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setQueueError(error.message || 'Unable to load disbursement queue')
        }
      })
      .finally(() => {
        setQueueLoading(false)
      })

    return () => controller.abort()
  }, [dateFrom, dateTo, selectedRoute])

  const allRows = useMemo(() => (
    [...advancesState, ...fertilizersState, ...itemsState]
  ), [advancesState, fertilizersState, itemsState])

  const selectedList = useMemo(() => (
    Object.values(selectedRows)
      .map(selection => {
        const row = allRows.find(item => item.issuedType === selection.issuedType && item.id === selection.id)
        if (!row) return null
        const method = row.issuedType === 'advance' ? getAdvanceMethod(row, paymentMethods) : 'Physical Delivery'
        return { ...row, method }
      })
      .filter(Boolean)
  ), [allRows, paymentMethods, selectedRows])

  const eligibleSelectedRows = selectedList.filter(row => isDeliveryNoteEligible(row, paymentMethods))

  const routeOptions = useMemo(() => ([
    { id: 'all', name: 'All Routes' },
    ...routeNames.map(route => ({ id: route, name: route })),
  ]), [routeNames])

  const selectedRoutes = Array.from(new Set(eligibleSelectedRows.map(row => row.route).filter(Boolean)))

  const updateRows = (type, updater) => {
    if (type === 'advance') setAdvancesState(updater)
    if (type === 'fertilizer') setFertilizersState(updater)
    if (type === 'items') setItemsState(updater)
  }

  const updatePaymentMethod = (id, method) => {
    setPaymentMethods(prev => ({ ...prev, [id]: method }))
    setSelectedRows(prev => {
      const key = rowKey('advance', id)
      if (!prev[key] || method) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const selectRow = (type, row, checked) => {
    const key = rowKey(type, row.id)
    setSelectedRows(prev => {
      const next = { ...prev }
      if (checked) {
        next[key] = { id: row.id, issuedType: type }
      } else {
        delete next[key]
      }
      return next
    })
  }

  const selectAllRows = (type, rows, checked) => {
    setSelectedRows(prev => {
      const next = { ...prev }

      rows.forEach(row => {
        const key = rowKey(type, row.id)
        if (checked) {
          next[key] = { id: row.id, issuedType: type }
        } else {
          delete next[key]
        }
      })

      return next
    })
  }

  const issueBankTransfer = async (row) => {
    if (!canDispatch) {
      setShowError('You do not have permission to dispatch disbursements.')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    const key = rowKey('advance', row.id)
    const method = getAdvanceMethod(row, paymentMethods) || 'Bank Transfer'
    setIssuingKey(key)
    setShowError(null)

    try {
      const tracking = await disbursementApi.issue({
        issuedType: 'advance',
        requestId: row.id,
        method,
      })

      setAdvancesState(previous => previous.map(item => (
        item.id === row.id
          ? {
              ...item,
              issued: true,
              paymentMethod: tracking.method || method,
              trackingStatus: 'dispatched',
              trackingId: tracking.id,
            }
          : item
      )))
      setSelectedRows(previous => {
        const next = { ...previous }
        delete next[key]
        return next
      })
      setShowSuccess(`${method} dispatched for ${row.supplierName}`)
      setTimeout(() => setShowSuccess(null), 3000)
    } catch (error) {
      setShowError(error.message || `Unable to dispatch ${method.toLowerCase()}`)
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setIssuingKey('')
    }
  }

  const downloadDeliveryNoteHtml = async (deliveryNoteId) => {
    try {
      const html = await disbursementApi.getDeliveryNotePrintHtml(deliveryNoteId)
      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = `delivery-note-${deliveryNoteId}.doc`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (error) {
      setShowError(error.message || 'Unable to download delivery note')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const generateDeliveryNote = async () => {
    if (!canDispatch) {
      setShowError('You do not have permission to generate delivery notes.')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    if (!borrower.borrowerName.trim() || !borrower.borrowerRole.trim()) {
      setShowError('Borrower name and role are required')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    if (eligibleSelectedRows.length === 0) {
      setShowError('Select at least one delivery-note eligible record')
      setTimeout(() => setShowError(null), 3000)
      return
    }

    setGenerating(true)
    setShowError(null)

    try {
      const deliveryNote = await disbursementApi.generateDeliveryNote({
        records: eligibleSelectedRows.map(row => ({
          issuedType: row.issuedType,
          requestId: row.id,
          method: row.method,
        })),
        ...borrower,
      })

      const dispatchedKeys = new Set(deliveryNote.details.map(detail => rowKey(detail.itemType, detail.requestId)))
      const dispatchedMethods = deliveryNote.details.reduce((methods, detail) => {
        methods[rowKey(detail.itemType, detail.requestId)] = detail.paymentType || ''
        return methods
      }, {})
      const dispatchedTrackingIds = deliveryNote.details.reduce((ids, detail) => {
        ids[rowKey(detail.itemType, detail.requestId)] = detail.disbursementRecordId || detail.trackingId || detail.id || null
        return ids
      }, {})

      ;['advance', 'fertilizer', 'items'].forEach(type => {
        updateRows(type, previous => previous.map(row => (
          dispatchedKeys.has(rowKey(type, row.id))
            ? {
                ...row,
                issued: true,
                paymentMethod: dispatchedMethods[rowKey(type, row.id)] || (type === 'advance' ? getAdvanceMethod(row, paymentMethods) : 'Physical Delivery'),
                trackingStatus: 'dispatched',
                trackingId: dispatchedTrackingIds[rowKey(type, row.id)] || row.trackingId || null,
              }
            : row
        )))
      })

      setSelectedRows(previous => {
        const next = { ...previous }
        dispatchedKeys.forEach(key => delete next[key])
        return next
      })
      setLastDeliveryNote(deliveryNote)
      setShowReview(false)
      setShowSuccess(`Delivery note ${deliveryNote.deliveryNoteNo} generated`)
      setTimeout(() => setShowSuccess(null), 3000)
    } catch (error) {
      setShowError(error.message || 'Unable to generate delivery note')
      setTimeout(() => setShowError(null), 3000)
    } finally {
      setGenerating(false)
    }
  }

  const handleQueueReportFormat = (format) => {
    if (!format) return
    if (!canExport) {
      setShowError('You do not have permission to export disbursement reports.')
      setTimeout(() => setShowError(null), 3000)
      return
    }
    const report = buildQueueReport({ currentRows, issueTab, paymentMethods, selectedRoute, statusFilter, dateFrom, dateTo, advancePaymentFilter })
    if (format === 'doc') {
      downloadDocReport(report)
      return
    }
    if (!printReportAsPdf(report)) {
      setShowError('Popup blocked. Please allow popups to print or save the report as PDF.')
      setTimeout(() => setShowError(null), 3000)
    }
  }

  const filteredAdvances = advancesState.filter(row => {
    if (advancePaymentFilter === 'all') return true
    const method = getAdvanceMethod(row, paymentMethods)
    if (advancePaymentFilter === 'unselected') return !method
    return method === advancePaymentFilter
  }).filter(row => matchesStatusFilter(row, statusFilter))
  const filteredFertilizers = fertilizersState.filter(row => matchesStatusFilter(row, statusFilter))
  const filteredItems = itemsState.filter(row => matchesStatusFilter(row, statusFilter))
  const filteredAllRows = [...filteredAdvances, ...filteredFertilizers, ...filteredItems]
  const pendingTotalCount = filteredAllRows.filter(item => !item.issued).length
  const issuedTotalCount = filteredAllRows.filter(item => item.issued).length

  const currentRows = {
    advance: filteredAdvances,
    fertilizer: filteredFertilizers,
    items: filteredItems,
  }[issueTab]

  const openReviewModal = () => {
    if (selectedRoutes.length === 1 && !borrower.routeName) {
      setBorrower(prev => ({ ...prev, routeName: selectedRoutes[0] }))
    }
    setShowReview(true)
  }

  const onSelectedRouteChange = (value) => { setQueueLoading(true); setSelectedRoute(value) }
  const onStatusFilterChange = (value) => { setStatusFilter(value || 'all'); setSelectedRows({}) }
  const onDateFromChange = (value) => { setQueueLoading(true); setDateFrom(value) }
  const onDateToChange = (value) => { setQueueLoading(true); setDateTo(value) }
  const onClearFilters = () => {
    if (dateFrom || dateTo || selectedRoute !== 'all') {
      setQueueLoading(true)
    }
    setSelectedRoute('all')
    setStatusFilter('approved')
    setAdvancePaymentFilter('all')
    setDateFrom('')
    setDateTo('')
    setSelectedRows({})
  }
  const onBorrowerChange = (field, value) => setBorrower(prev => ({ ...prev, [field]: value }))

  return {
    selectedRoute, issueTab, advancePaymentFilter, statusFilter, dateFrom, dateTo,
    paymentMethods, selectedRows, showSuccess, showError, queueError, queueLoading,
    issuingKey, showReview, generating, lastDeliveryNote, borrower,
    routeOptions, selectedList, eligibleSelectedRows,
    filteredAdvances, filteredFertilizers, filteredItems, filteredAllRows,
    pendingTotalCount, issuedTotalCount, currentRows,
    canDispatch, canExport,
    setIssueTab,
    onSelectedRouteChange, onStatusFilterChange, onDateFromChange, onDateToChange,
    onClearFilters, onAdvancePaymentFilterChange: setAdvancePaymentFilter,
    selectRow, selectAllRows, updatePaymentMethod, issueBankTransfer,
    downloadDeliveryNoteHtml, handleQueueReportFormat, openReviewModal,
    closeReviewModal: () => setShowReview(false),
    onBorrowerChange, generateDeliveryNote,
  }
}
