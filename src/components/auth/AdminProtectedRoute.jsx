import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { adminAuthStorage } from '../../services/adminApiClient'

export default function AdminProtectedRoute({ children }) {
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

  return children || <Outlet />
}