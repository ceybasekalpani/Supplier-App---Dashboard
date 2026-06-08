import {
  activities,
  advanceRequests,
  chartData,
  fertilizerRequests,
  itemRequests,
} from './mockData'

const requestGroups = [
  { id: 'advance', label: 'Advance', requests: advanceRequests },
  { id: 'fertilizer', label: 'Fertilizer', requests: fertilizerRequests },
  { id: 'items', label: 'Items', requests: itemRequests },
]

const countByStatus = (requests, status) => requests.filter((request) => request.status === status).length

const getRequestGroupSummary = (group) => ({
  id: group.id,
  label: group.label,
  total: group.requests.length,
  approved: countByStatus(group.requests, 'approved'),
  pending: countByStatus(group.requests, 'pending'),
  rejected: countByStatus(group.requests, 'rejected'),
})

export const getDashboardMetrics = () => {
  return {
    stats: requestGroups.map(getRequestGroupSummary),
    monthlyRequestVolume: chartData,
    requestQueue: requestGroups.map(getRequestGroupSummary),
    recentActivities: activities.slice(0, 6),
  }
}
