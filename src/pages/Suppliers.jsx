import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Droplet,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRound,
  XCircle,
} from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { supplierDashboardApi } from '../services/supplierDashboardApi'
import { formatCurrency, formatDisplayDate, formatQuantity } from '../utils/formatters'

const REQUEST_TYPES = [
  { id: 'advance', label: 'Advance', icon: Droplet, tone: 'amber' },
  { id: 'fertilizer', label: 'Fertilizer', icon: Package, tone: 'green' },
  { id: 'item', label: 'Items', icon: ShoppingBag, tone: 'blue' },
]

const REQUEST_COLLECTION = {
  advance: 'advanceRequests',
  fertilizer: 'fertilizerRequests',
  item: 'itemRequests',
}

const EMPTY_DASH = '-'

const monthLabel = (month) => {
  if (!month) return EMPTY_DASH

  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-LK', {
    month: 'short',
    year: 'numeric',
  })
}

const getRequestTitle = (request, type) => {
  if (type === 'advance') return formatCurrency(request.amount)
  return `${request.type || 'Request'} - ${formatQuantity(request.qty, request.unit)}`
}

const getStatusIcon = (status) => {
  if (status === 'approved') return <CheckCircle size={14} className="text-green-600" />
  if (status === 'rejected') return <XCircle size={14} className="text-red-600" />
  return <Clock size={14} className="text-amber-600" />
}

const requestCounts = (supplier) => ({
  advance: supplier?.advanceRequests?.length || 0,
  fertilizer: supplier?.fertilizerRequests?.length || 0,
  item: supplier?.itemRequests?.length || 0,
})

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-700">
    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
    <span className="min-w-0 break-all text-right text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
      {value || EMPTY_DASH}
    </span>
  </div>
)

const SummaryPill = ({ label, value, tone }) => {
  const styles = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
  }

  return (
    <div className={`rounded-lg border px-3 py-2 ${styles[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  )
}

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
  const [dataSource, setDataSource] = useState('api')

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

      setSuppliers(response.suppliers)
      setPeriod({
        activeMonth: response.activeMonth,
        previousMonth: response.previousMonth,
      })
      setWarning(response.warning || '')
      setDataSource(response.source || 'api')
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
        <SummaryPill label="Request Period" value={`${monthLabel(period.previousMonth)} - ${monthLabel(period.activeMonth)}`} tone="blue" />
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
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <div className="flex min-w-72 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by reg no, name, or route"
                className="w-full bg-transparent py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={event => setActiveOnly(event.target.checked)}
                  className="h-4 w-4 accent-green-700"
                />
                Active only
              </label>
              <button
                type="button"
                onClick={() => loadSuppliers()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  {['Reg No', 'Supplier', 'Route', 'Phone', 'Payment', 'Status'].map(heading => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      Loading suppliers...
                    </td>
                  </tr>
                ) : suppliers.length > 0 ? (
                  suppliers.map(supplier => {
                    const isSelected = String(selected?.id) === String(supplier.id)

                    return (
                      <tr
                        key={supplier.id || supplier.regNo}
                        onClick={() => handleSelectSupplier(supplier)}
                        className={`cursor-pointer border-b border-slate-50 transition-colors last:border-0 dark:border-slate-700/60 ${
                          isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <td className="px-4 py-3 font-bold text-green-700">{supplier.regNo}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={supplier.name} size="xs" />
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{supplier.name || EMPTY_DASH}</p>
                              <p className="text-xs text-slate-400">{supplier.address || 'No address'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{supplier.route || EMPTY_DASH}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{supplier.phone || EMPTY_DASH}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{supplier.payment || EMPTY_DASH}</td>
                        <td className="px-4 py-3"><StatusBadge status={supplier.status} /></td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      No suppliers found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          {selected ? (
            <>
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start gap-3">
                  <Avatar name={selected.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-lg font-bold text-slate-900 dark:text-white">{selected.name}</p>
                      {detailLoading && <RefreshCw size={15} className="animate-spin text-slate-400" />}
                    </div>
                    <p className="text-xs font-semibold text-slate-400">{selected.regNo} / {selected.route || 'No route'}</p>
                    <div className="mt-2">
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <SummaryPill label="Advance" value={counts.advance} tone="amber" />
                  <SummaryPill label="Fertilizer" value={counts.fertilizer} tone="green" />
                  <SummaryPill label="Items" value={counts.item} tone="blue" />
                </div>

               
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Supplier Details</p>
                <div className="space-y-1">
                  <InfoRow label="Phone" value={selected.phone} />
                  <InfoRow label="Other Phone" value={[selected.phone2, selected.phone3].filter(Boolean).join(', ')} />
                  <InfoRow label="Address" value={selected.address} />
                  <InfoRow label="Payment" value={selected.payment} />
                  <InfoRow label="Bank" value={selected.bank} />
                  <InfoRow label="Branch" value={selected.branch} />
                  <InfoRow label="Account" value={selected.accountNo} />
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Request History</p>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2">
                  {REQUEST_TYPES.map(type => {
                    const Icon = type.icon
                    const active = requestType === type.id

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setRequestType(type.id)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                          active
                            ? 'border-green-700 bg-green-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        <Icon size={14} />
                        {type.label}
                      </button>
                    )
                  })}
                </div>

                <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                  {selectedRequests.length > 0 ? (
                    selectedRequests.map(request => (
                      <div key={`${requestType}-${request.id}-${request.date}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{getRequestTitle(request, requestType)}</p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {request.requestNo ? `${request.requestNo} / ` : ''}{formatDisplayDate(request.date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold capitalize text-slate-600 dark:text-slate-300">
                            {getStatusIcon(request.status)}
                            {request.status}
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 rounded-md bg-white p-2 text-xs dark:bg-slate-800">
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">Checked by</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{request.checkedBy || EMPTY_DASH}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">Remarks</span>
                            <span className="max-w-[13rem] text-right font-semibold text-slate-600 dark:text-slate-300">{request.remarks || EMPTY_DASH}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
                      No {REQUEST_TYPES.find(type => type.id === requestType)?.label.toLowerCase()} requests in this period.
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900">
                <Search size={24} />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">Select a supplier</p>
              <p className="mt-1 text-sm text-slate-400">Supplier profile and database request history will appear here.</p>
            </section>
          )}

        </aside>
      </div>
    </div>
  )
}
