import { useEffect, useState } from 'react'
import { AlertCircle, Leaf, RefreshCw } from 'lucide-react'
import DashboardStats from '../components/dashboard/DashboardStats'
import MonthlyRequestChart from '../components/dashboard/MonthlyRequestChart'
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel'
import RecentActivityTable from '../components/dashboard/RecentActivityTable'
import PageHeader from '../components/ui/PageHeader'
import { dashboardMetricsApi } from '../services/dashboardMetricsApi'
import { adminAuthStorage } from '../services/adminApiClient'
import { hasAdminPermission } from '../services/adminPermissions'
import { dashboardPermissionsApi } from '../services/dashboardPermissionsApi'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(() => ({
    stats: [],
    monthlyRequestVolume: [],
    requestQueue: [],
    recentActivities: [],
    source: 'initial',
  }))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentAdmin, setCurrentAdmin] = useState(() => adminAuthStorage.getUser())

  const canQuickActions = hasAdminPermission(currentAdmin, ['dashboard.quickActions'])

  useEffect(() => {
    const admin = adminAuthStorage.getUser()
    if (!admin?.id || admin.isSuperAdmin) {
      return
    }

    let mounted = true
    dashboardPermissionsApi
      .getUserPermissions(admin.id)
      .then(permissions => {
        if (!mounted) return
        const updatedAdmin = {
          ...admin,
          hasPermissionData: true,
          modulePermissions: permissions.modulePermissions || {},
          subPermissions: permissions.subPermissions || {},
        }
        adminAuthStorage.setUser(updatedAdmin)
        setCurrentAdmin(updatedAdmin)
      })
      .catch(() => {
        if (mounted) setCurrentAdmin(admin)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')

      dashboardMetricsApi
        .getMetrics({
          months: 6,
          recent: 10,
          signal: controller.signal,
        })
        .then(metrics => {
          setDashboard(metrics)
          setError(metrics.warning || '')
        })
        .catch(loadError => {
          if (loadError.name !== 'AbortError') {
            setError(loadError.message || 'Unable to load dashboard metrics')
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [refreshKey])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Factory Dashboard"
          description="Supplier requests, leaf intake, and approval movement at a glance."
          badge="Tea supplier operations"
          icon={Leaf}
        />

        <button
          type="button"
          onClick={() => setRefreshKey(current => current + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-200">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Dashboard metrics could not be loaded</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      <DashboardStats stats={(dashboard.requestQueue?.length ? dashboard.requestQueue : dashboard.stats) || []} />

      <div className={`grid min-w-0 grid-cols-1 gap-5 ${canQuickActions ? 'xl:grid-cols-[1.5fr_1fr]' : ''}`}>
        <MonthlyRequestChart data={dashboard.monthlyRequestVolume || []} />
        {canQuickActions && <QuickActionsPanel queue={dashboard.requestQueue || []} />}
      </div>

      <RecentActivityTable activities={dashboard.recentActivities || []} />
    </div>
  )
}
