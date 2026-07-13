import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dashboardRequestsApi } from '../../../services/dashboardRequestsApi'
import { factorySettingsApi } from '../../../services/factorySettingsApi'
import { hasAdminPermission, hasExplicitAdminPermission } from '../../../services/adminPermissions'
import { adminAuthStorage } from '../../../services/adminApiClient'
import { dashboardPermissionsApi } from '../../../services/dashboardPermissionsApi'
import { downloadDocReport, printReportAsPdf } from '../../../utils/reports'
import { useCurrentAdmin } from '../../../hooks/useCurrentAdmin'
import { buildRequestsReport, isInDateRange, normalizeFilter, normalizeTab, requestActionPermissions } from '../utils/requestsHelpers'

export function useRequestsData() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState(() => normalizeTab(searchParams.get('tab')))
  const [filter, setFilter] = useState(() => normalizeFilter(searchParams.get('filter')))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [salaryDate, setSalaryDate] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const controller = new AbortController()

    factorySettingsApi
      .getSettings({ signal: controller.signal })
      .then(result => {
        if (result.salaryDate) setSalaryDate(result.salaryDate)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])
  const [selectedKey, setSelectedKey] = useState(null)
  const [draft, setDraft] = useState({})
  const [supplierWindow, setSupplierWindow] = useState(null)
  const [requestLoading, setRequestLoading] = useState(true)
  const [requestError, setRequestError] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const currentAdmin = useCurrentAdmin()

  const [advance, setAdvance] = useState([])
  const [fertilizer, setFertilizer] = useState([])
  const [items, setItems] = useState([])
  const [requestTotals, setRequestTotals] = useState(null)

  useEffect(() => {
    const nextTab = normalizeTab(searchParams.get('tab'))
    const nextFilter = normalizeFilter(searchParams.get('filter'))

    setTab(nextTab)
    setFilter(nextFilter)
    setSelectedKey(null)
    setDraft({})
  }, [searchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    setRequestLoading(true)
    setRequestError('')

    dashboardRequestsApi
      .list({
        search: debouncedSearch,
        fromDate,
        toDate,
        signal: controller.signal,
      })
      .then(result => {
        setAdvance(result.advance)
        setFertilizer(result.fertilizer)
        setItems(result.items)
        setRequestTotals(result.totals)

        setSelectedKey(currentKey => {
          if (!currentKey) return null

          const allRows = [
            ...result.advance.map(row => ({ ...row, requestType: 'advance' })),
            ...result.fertilizer.map(row => ({ ...row, requestType: 'fertilizer' })),
            ...result.items.map(row => ({ ...row, requestType: 'items' })),
          ]

          return allRows.some(row => `${row.requestType}-${row.id}` === currentKey)
            ? currentKey
            : null
        })
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setRequestError(error.message || 'Unable to load dashboard requests')
        }
      })
      .finally(() => {
        setRequestLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [debouncedSearch, fromDate, refreshKey, toDate])

  const allData = useMemo(() => ({
    advance,
    fertilizer,
    items,
  }), [advance, fertilizer, items])

  const selected = useMemo(() => {
    if (!selectedKey) return null

    return allData[tab].find(row => `${tab}-${row.id}` === selectedKey) || null
  }, [allData, selectedKey, tab])

  const [selectedAdvanceLimit, setSelectedAdvanceLimit] = useState(null)
  const [selectedAdvanceLimitLoading, setSelectedAdvanceLimitLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'advance' || !selected?.regNo) {
      setSelectedAdvanceLimit(null)
      return
    }

    let mounted = true
    setSelectedAdvanceLimitLoading(true)

    dashboardRequestsApi
      .getAdvanceLimit(selected.regNo)
      .then(result => {
        if (mounted) setSelectedAdvanceLimit(result)
      })
      .catch(() => {
        if (mounted) setSelectedAdvanceLimit(null)
      })
      .finally(() => {
        if (mounted) setSelectedAdvanceLimitLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [selected?.regNo, tab])

  const exceedsAdvanceLimit = tab === 'advance'
    && selected
    && selected.status === 'pending'
    && selectedAdvanceLimit !== null
    && Number(selected.amount || 0) > Number(selectedAdvanceLimit)

  const filtered = useMemo(() => (
    allData[tab].filter(row => {
      const term = search.trim().toLowerCase()

      const matchesFilter = filter === 'all' || row.status === filter
      const matchesDate = isInDateRange(row.date, fromDate, toDate)
      const matchesSearch = !term ||
        row.name.toLowerCase().includes(term) ||
        row.regNo.toLowerCase().includes(term) ||
        row.requestNo.toLowerCase().includes(term) ||
        row.type.toLowerCase().includes(term)

      return matchesFilter && matchesDate && matchesSearch
    })
  ), [allData, filter, fromDate, search, tab, toDate])

  const tabRows = allData[tab]

  const requestStats = [
    {
      label: 'All Requests',
      value: requestTotals?.totalCount || tabRows.length,
      tone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Pending Review',
      value: tabRows.filter(row => row.status === 'pending').length,
      tone: 'text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Approved',
      value: tabRows.filter(row => row.status === 'approved').length,
      tone: 'text-green-700 dark:text-green-300',
    },
    {
      label: 'Rejected',
      value: tabRows.filter(row => row.status === 'rejected').length,
      tone: 'text-red-600 dark:text-red-300',
    },
  ]

  const canApproveCurrentTab = hasAdminPermission(currentAdmin, requestActionPermissions.approve[tab])
  const canRejectCurrentTab = hasAdminPermission(currentAdmin, requestActionPermissions.reject[tab])
  const canApproveRejectedCurrentTab = hasExplicitAdminPermission(currentAdmin, requestActionPermissions.approveRejected[tab])
  const canRejectApprovedCurrentTab = hasExplicitAdminPermission(currentAdmin, requestActionPermissions.rejectApproved[tab])

  function countFor(status) {
    const data = allData[tab].filter(row => isInDateRange(row.date, fromDate, toDate))
    return status === 'all' ? data.length : data.filter(row => row.status === status).length
  }

  function updateSearchParams(nextTab, nextFilter) {
    const params = {}

    if (nextTab && nextTab !== 'advance') params.tab = nextTab
    if (nextFilter && nextFilter !== 'all') params.filter = nextFilter

    setSearchParams(params)
  }

  function handleTabChange(nextTab) {
    const normalized = normalizeTab(nextTab)

    setTab(normalized)
    setFilter('all')
    setSelectedKey(null)
    setDraft({})
    updateSearchParams(normalized, 'all')
  }

  function handleFilterChange(nextFilter) {
    const normalized = normalizeFilter(nextFilter)

    setFilter(normalized)
    setSelectedKey(null)
    setDraft({})
    updateSearchParams(tab, normalized)
  }

  function clearAllFilters() {
    setSearch('')
    setFromDate('')
    setToDate('')
    handleFilterChange('all')
  }

  function clearDates() {
    setFromDate('')
    setToDate('')
  }

  function handleRequestReportFormat(format) {
    if (!format) return

    const report = buildRequestsReport(filtered, tab, {
      filter,
      fromDate,
      toDate,
      search: debouncedSearch,
    })

    if (format === 'doc') {
      downloadDocReport(report)
      return
    }

    printReportAsPdf(report)
  }

  function selectRow(row) {
    const rowKey = `${tab}-${row.id}`
    const isSame = selectedKey === rowKey

    setSelectedKey(isSame ? null : rowKey)
    setDraft(isSame ? {} : { ...row })
  }

  function updateTabData(updater) {
    if (tab === 'advance') {
      setAdvance(previous => updater(previous))
      return
    }

    if (tab === 'fertilizer') {
      setFertilizer(previous => updater(previous))
      return
    }

    setItems(previous => updater(previous))
  }

  async function refreshAdminPermissionsForAction() {
    const admin = adminAuthStorage.getUser()

    if (!admin?.id || admin.isSuperAdmin) {
      return admin
    }

    try {
      const permissions = await dashboardPermissionsApi.getUserPermissions(admin.id)
      const updatedAdmin = {
        ...admin,
        hasPermissionData: true,
        modulePermissions: permissions.modulePermissions || {},
        subPermissions: permissions.subPermissions || {},
      }

      adminAuthStorage.setUser(updatedAdmin)
      return updatedAdmin
    } catch {
      return currentAdmin
    }
  }

  async function updateStatus(id, status) {
    if (statusSaving) return
    const currentRow = allData[tab].find(row => row.id === id)
    const currentStatus = currentRow?.status || 'pending'
    const isApproveRejected = status === 'approved' && currentStatus === 'rejected'
    const isRejectApproved = status === 'rejected' && currentStatus === 'approved'
    const permissionAdmin = isApproveRejected || isRejectApproved
      ? await refreshAdminPermissionsForAction()
      : currentAdmin
    const canApproveRejectedNow = hasExplicitAdminPermission(permissionAdmin, requestActionPermissions.approveRejected[tab])
    const canRejectApprovedNow = hasExplicitAdminPermission(permissionAdmin, requestActionPermissions.rejectApproved[tab])

    if (isApproveRejected && !canApproveRejectedNow) {
      setRequestError('You do not have permission to approve rejected requests.')
      return
    }
    if (status === 'approved' && currentStatus !== 'rejected' && !canApproveCurrentTab) {
      setRequestError('You do not have permission to approve pending requests.')
      return
    }
    if (isRejectApproved && !canRejectApprovedNow) {
      setRequestError('You do not have permission to reject approved requests.')
      return
    }
    if (status === 'rejected' && currentStatus !== 'approved' && !canRejectCurrentTab) {
      setRequestError('You do not have permission to reject pending requests.')
      return
    }

    setStatusSaving(true)
    setRequestError('')

    try {
      const updated = await dashboardRequestsApi.updateStatus({
        requestType: tab,
        id,
        status,
        remarks: draft.remarks ?? '',
      })

      updateTabData(previous => previous.map(row => (
        row.id === id ? updated : row
      )))

      setDraft(updated)
      setSelectedKey(`${tab}-${updated.id}`)
      setRefreshKey(current => current + 1)
      setRequestError('')
    } catch (error) {
      setRequestError(error.message || 'Unable to update request status')
    } finally {
      setStatusSaving(false)
    }
  }

  function handleDraftChange(key, value) {
    setDraft(previous => ({
      ...previous,
      [key]: value,
    }))

    if (key === 'remarks' && selectedKey) {
      updateTabData(previous => previous.map(row => (
        `${tab}-${row.id}` === selectedKey
          ? { ...row, remarks: value }
          : row
      )))
    }
  }

  const tableColumnCount = tab === 'advance' ? 7 : 8

  return {
    tab, filter, search, fromDate, toDate, salaryDate,
    selectedKey, draft, supplierWindow, requestLoading, requestError, statusSaving, refreshKey,
    filtered, selected, requestStats, tableColumnCount, allData,
    canApproveCurrentTab, canRejectCurrentTab, canApproveRejectedCurrentTab, canRejectApprovedCurrentTab,
    exceedsAdvanceLimit, selectedAdvanceLimit, selectedAdvanceLimitLoading,
    setSearch, setFromDate, setToDate, setSupplierWindow,
    countFor, handleTabChange, handleFilterChange, clearAllFilters, clearDates,
    handleRequestReportFormat, selectRow, handleDraftChange, updateStatus,
    refreshRequests: () => setRefreshKey(current => current + 1),
  }
}
