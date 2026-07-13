import { useEffect, useState } from 'react'
import { Landmark, TreePine, User, WalletCards, X } from 'lucide-react'
import StatusBadge from '../../../components/ui/StatusBadge'
import { dashboardRequestsApi } from '../../../services/dashboardRequestsApi'
import { supplierDashboardApi } from '../../../services/supplierDashboardApi'
import { currency, nextMonthSameDay } from '../utils/requestsHelpers'
import Avatar from './Avatar'
import SupplierRequestSummaryPanel from './SupplierRequestSummaryPanel'

export default function SupplierWindow({ regNo, tab, requestsByType, salaryDate, onClose }) {
  const salaryFrom = salaryDate || new Date().toISOString().slice(0, 10)
  const [supplier, setSupplier] = useState(null)
  const [supplierLoading, setSupplierLoading] = useState(true)
  const [supplierError, setSupplierError] = useState('')
  const [summaryStatus, setSummaryStatus] = useState('all')
  const [summaryCategory, setSummaryCategory] = useState('all')
  const [realAdvanceLimit, setRealAdvanceLimit] = useState(null)
  const [advanceLimitLoading, setAdvanceLimitLoading] = useState(tab === 'advance')

  useEffect(() => {
    let mounted = true

    setSupplier(null)
    setSupplierError('')
    setSupplierLoading(true)

    supplierDashboardApi
      .getSupplier({ regNo, months: 2 })
      .then(result => {
        if (mounted && result) {
          setSupplier(result)
        }
      })
      .catch(error => {
        if (mounted) setSupplierError(error.message || 'Unable to load supplier details')
      })
      .finally(() => {
        if (mounted) setSupplierLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [regNo])

  useEffect(() => {
    if (tab !== 'advance') return

    let mounted = true
    setAdvanceLimitLoading(true)

    dashboardRequestsApi
      .getAdvanceLimit(regNo, salaryFrom)
      .then(result => {
        if (mounted) setRealAdvanceLimit(result)
      })
      .catch(() => {
        if (mounted) setRealAdvanceLimit(null)
      })
      .finally(() => {
        if (mounted) setAdvanceLimitLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [regNo, tab, salaryFrom])

  if (supplierLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
        <div className="rounded-lg bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-xl dark:bg-slate-900 dark:text-slate-200">
          Loading supplier details...
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
        onClick={event => event.target === event.currentTarget && onClose()}
      >
        <div className="w-full max-w-sm rounded-lg bg-white p-5 text-center shadow-xl dark:bg-slate-900">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {supplierError || 'Unable to load supplier details'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const isAdvanceView = tab === 'advance'
  const cycleEnd = isAdvanceView ? nextMonthSameDay(salaryFrom) : null

  const allSupplierRequests = [
    ...(requestsByType?.advance || []).map(request => ({ ...request, category: 'Advance' })),
    ...(requestsByType?.fertilizer || []).map(request => ({ ...request, category: 'Fertilizer' })),
    ...(requestsByType?.items || []).map(request => ({ ...request, category: 'Item' })),
  ].filter(request => request.regNo === regNo)

  const summarySource = allSupplierRequests.filter(request => {
    const statusMatch = summaryStatus === 'all' || request.status === summaryStatus
    const categoryMatch = summaryCategory === 'all' || request.category === summaryCategory
    return statusMatch && categoryMatch
  })

  const summary = ['approved', 'pending', 'rejected']
    .map(status => ({
      name: status,
      value: summarySource.filter(request => request.status === status).length,
    }))
    .filter(item => item.value > 0)

  const requestCounts = {
    advance: (requestsByType?.advance || []).filter(request => request.regNo === regNo).length,
    fertilizer: (requestsByType?.fertilizer || []).filter(request => request.regNo === regNo).length,
    items: (requestsByType?.items || []).filter(request => request.regNo === regNo).length,
  }

  const showBank = tab === 'advance' && /(bank|cheque|check)/i.test(supplier.payment || '')

  const supplierRows = [
    ['Registration No.', supplier.regNo],
    ['Route', supplier.route],
    ['Address', supplier.address],
    ['Phone', supplier.phone],
    ['Payment', supplier.payment],
    ['Status', supplier.status],
  ]

  const landRows = [
    ['Acres', supplier.land?.acres ?? 0],
    ['Rood', supplier.land?.rood ?? 0],
    ['Perch', supplier.land?.perch ?? 0],
    ['Total Land', `${supplier.land?.acres ?? 0}A ${supplier.land?.rood ?? 0}R ${supplier.land?.perch ?? 0}P`],
  ]

  const bankRows = [
    ['Bank', supplier.bank],
    ['Branch', supplier.branch],
    ['Account No.', supplier.accountNo],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-[0_24px_90px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
        <header className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-lime-400 to-green-700" />

          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar name={supplier.name} size="xl" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-bold text-slate-950 dark:text-white">{supplier.name}</h3>

                  <StatusBadge status={supplier.status || 'active'} className="text-[10px] font-bold uppercase" />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{supplier.regNo}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{supplier.route || '-'}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{supplier.payment || '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:flex">
                Salary date
                <span className="text-xs font-bold text-slate-800 dark:text-white">{salaryFrom}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="max-h-[82vh] overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">
          <div className="grid grid-cols-1 gap-4 xl:h-[min(70vh,700px)] xl:grid-cols-[340px_1fr] xl:grid-rows-[minmax(0,1fr)]">
            <aside className="space-y-3 overflow-y-auto pr-1 xl:h-full">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/40">
                    <User size={16} />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">Supplier profile</p>
                </div>

                <div className="space-y-2">
                  {supplierRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800"
                    >
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="max-w-[58%] text-right text-xs font-semibold text-slate-800 dark:text-slate-100">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-900/40">
                    <TreePine size={16} />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">Land profile</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {landRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md bg-amber-50 px-2.5 py-1.5 ring-1 ring-amber-100 dark:bg-amber-900/15 dark:ring-amber-900/40"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {showBank && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:ring-teal-900/40">
                      <Landmark size={16} />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">Bank profile</p>
                  </div>

                  <div className="space-y-2">
                    {bankRows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800"
                      >
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            <main className="flex min-h-0 flex-col gap-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:hidden">
                Salary date
                <span className="text-xs font-bold text-slate-800 dark:text-white">{salaryFrom}</span>
              </div>

              {isAdvanceView && (
                <section className="relative overflow-hidden rounded-lg border border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-white p-4 shadow-sm dark:border-emerald-900/50 dark:from-emerald-900/20 dark:via-slate-900 dark:to-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                        <WalletCards size={17} />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Maximum advance limit</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Eligibility cycle: {salaryFrom} to {cycleEnd || '-'}</p>
                      </div>
                    </div>

                    <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                      {advanceLimitLoading ? '...' : currency(realAdvanceLimit)}
                    </p>
                  </div>
                </section>
              )}

              <SupplierRequestSummaryPanel
                allSupplierRequests={allSupplierRequests}
                summarySource={summarySource}
                summary={summary}
                summaryStatus={summaryStatus}
                onSummaryStatusChange={setSummaryStatus}
                summaryCategory={summaryCategory}
                onSummaryCategoryChange={setSummaryCategory}
                requestCounts={requestCounts}
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
