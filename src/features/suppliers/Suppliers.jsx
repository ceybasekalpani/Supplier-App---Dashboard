import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, UserRound } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { supplierDashboardApi } from '../../services/supplierDashboardApi'
import SupplierTable from './components/SupplierTable'
import SupplierDetailPanel from './components/SupplierDetailPanel'
import SummaryPill from './components/SummaryPill'
import { REQUEST_COLLECTION, monthLabel, requestCounts } from './utils/supplierHelpers'

export default function Suppliers() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)
  const [suppliers, setSuppliers] = useState([])
  const [selected, setSelected] = useState(null)
  const [requestType, setRequestType] = useState('advance')
  const [period, setPeriod] = useState({ activeMonth: '', previousMonth: '' })
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorStatus, setErrorStatus] = useState(null)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const loadSuppliers = useMemo(() => async ({ signal } = {}) => {
    setLoading(true)
    setError('')
    setErrorStatus(null)

    try {
      const response = await supplierDashboardApi.listSuppliers({
        search: debouncedSearch,
        months: 2,
        activeOnly,
        signal,
      })

      setSuppliers(response.suppliers || [])
      setPeriod({
        activeMonth: response.activeMonth,
        previousMonth: response.previousMonth,
      })
      setWarning(response.warning || '')
      setSelected(current => {
        if (!current) return response.suppliers[0] || null
        return response.suppliers.find(supplier => String(supplier.id) === String(current.id)) || response.suppliers[0] || null
      })
    } catch (loadError) {
      if (loadError.name !== 'AbortError') {
        setError(loadError.message || 'Unable to load suppliers')
        setErrorStatus(loadError.status || null)
      }
    } finally {
      setLoading(false)
    }
  }, [activeOnly, debouncedSearch])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      loadSuppliers({ signal: controller.signal })
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadSuppliers])

  const handleSelectSupplier = async (supplier) => {
    setSelected(supplier)
    setDetailLoading(true)

    try {
      const latest = await supplierDashboardApi.getSupplier({ regNo: supplier.id, months: 2 })
      if (!latest) return

      setSelected(latest)
      setSuppliers(current => current.map(item => (
        String(item.id) === String(latest.id) ? latest : item
      )))
    } catch {
      setSelected(supplier)
    } finally {
      setDetailLoading(false)
    }
  }

  const selectedRequests = selected?.[REQUEST_COLLECTION[requestType]] || []
  const counts = requestCounts(selected)
  const totalRequests = suppliers.reduce((sum, supplier) => {
    const supplierCounts = requestCounts(supplier)
    return sum + supplierCounts.advance + supplierCounts.fertilizer + supplierCounts.item
  }, 0)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Supplier Management"
        description="Monitor active suppliers and their latest advance, fertilizer, and item requests."
        badge="Supplier Dashboard"
        icon={UserRound}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryPill label="Suppliers" value={suppliers.length} tone="green" />
        <SummaryPill label="Recent Requests" value={totalRequests} tone="amber" />
        <SummaryPill label="Request Period" value={`${monthLabel(period.previousMonth)} - ${monthLabel(period.activeMonth)}`} tone="teal" />
      </div>

      {(warning || error) && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{error ? (errorStatus === 401 ? 'Authentication required' : 'Supplier data could not be loaded') : 'Using local preview data'}</p>
            <p className="text-xs opacity-80">{error || warning}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SupplierTable
          search={search}
          onSearchChange={setSearch}
          activeOnly={activeOnly}
          onActiveOnlyChange={setActiveOnly}
          loading={loading}
          suppliers={suppliers}
          selected={selected}
          onSelectSupplier={handleSelectSupplier}
          onRefresh={() => loadSuppliers()}
        />

        <aside className="space-y-4">
          <SupplierDetailPanel
            selected={selected}
            detailLoading={detailLoading}
            counts={counts}
            requestType={requestType}
            onRequestTypeChange={setRequestType}
            selectedRequests={selectedRequests}
          />
        </aside>
      </div>
    </div>
  )
}
