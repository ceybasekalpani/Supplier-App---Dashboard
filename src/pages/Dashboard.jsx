import { Leaf } from 'lucide-react'
import DashboardStats from '../components/dashboard/DashboardStats'
import MonthlyRequestChart from '../components/dashboard/MonthlyRequestChart'
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel'
import RecentActivityTable from '../components/dashboard/RecentActivityTable'
import PageHeader from '../components/ui/PageHeader'
import { getDashboardMetrics } from '../data/dashboardMetrics'

export default function Dashboard() {
  const dashboard = getDashboardMetrics()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Dashboard"
        description="Supplier requests, leaf intake, and approval movement at a glance."
        badge="Tea supplier operations"
        icon={Leaf}
      />

      <DashboardStats stats={dashboard.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        <MonthlyRequestChart data={dashboard.monthlyRequestVolume} />
        <QuickActionsPanel queue={dashboard.requestQueue} />
      </div>

      <RecentActivityTable activities={dashboard.recentActivities} />
    </div>
  )
}
