import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { adminAuthStorage } from '../../services/adminApiClient'
import { canAccessRoute, hasAdminPermission, PERMISSIONS } from '../../services/adminPermissions'

const permissionRoutes = [
  { to: '/dashboard', permission: PERMISSIONS.dashboard },
  { to: '/suppliers', permission: PERMISSIONS.suppliers },
  { to: '/requests', permission: PERMISSIONS.requests },
  { to: '/disbursements', permission: PERMISSIONS.disbursements },
  { to: '/disbursement-tracking', permission: PERMISSIONS.disbursementTracking },
  { to: '/configurations', permission: PERMISSIONS.configurations },
  { to: '/communication', permission: PERMISSIONS.communication },
  { to: '/user-management', permission: PERMISSIONS.userManagement },
  { to: '/settings', permission: PERMISSIONS.permissions },
]

export default function AdminProtectedRoute({ children, permission }) {
  const location = useLocation()

  if (!adminAuthStorage.isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  const currentAdmin = adminAuthStorage.getUser()

  if (!canAccessRoute(currentAdmin, permission)) {
    const fallbackRoute = permissionRoutes.find(route => hasAdminPermission(currentAdmin, route.permission))

    if (!fallbackRoute || fallbackRoute.to === location.pathname) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">No permission assigned</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your dashboard account does not have access to this page. Please ask the main administrator to update your user permissions.
            </p>
          </div>
        </div>
      )
    }

    return (
      <Navigate
        to={fallbackRoute.to}
        replace
        state={{ deniedFrom: location }}
      />
    )
  }

  return children || <Outlet />
}
