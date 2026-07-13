import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { PERMISSIONS } from './services/adminPermissions'

const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const Suppliers = lazy(() => import('./features/suppliers/Suppliers'))
const Requests = lazy(() => import('./features/requests/Requests'))
const DisbursementManager = lazy(() => import('./features/disbursements/DisbursementManager'))
const DisbursementTracking = lazy(() => import('./features/disbursement-tracking/DisbursementTracking'))
const Configurations = lazy(() => import('./features/configurations/Configurations'))
const Communication = lazy(() => import('./features/communication/Communication'))
const UserManagement = lazy(() => import('./features/user-management/UserManagement'))
const Settings = lazy(() => import('./features/settings/Settings'))

function RouteLoadingFallback() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-green-700" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route index element={<AdminLogin />} />
            <Route path="/login" element={<AdminLogin />} />

            <Route element={<AdminProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<AdminProtectedRoute permission={PERMISSIONS.dashboard}><Dashboard /></AdminProtectedRoute>} />
                <Route path="/suppliers" element={<AdminProtectedRoute permission={PERMISSIONS.suppliers}><Suppliers /></AdminProtectedRoute>} />
                <Route path="/requests" element={<AdminProtectedRoute permission={PERMISSIONS.requests}><Requests /></AdminProtectedRoute>} />
                <Route path="/disbursements" element={<AdminProtectedRoute permission={PERMISSIONS.disbursements}><DisbursementManager /></AdminProtectedRoute>} />
                <Route path="/disbursement-tracking" element={<AdminProtectedRoute permission={PERMISSIONS.disbursementTracking}><DisbursementTracking /></AdminProtectedRoute>} />
                <Route path="/configurations" element={<AdminProtectedRoute permission={PERMISSIONS.configurations}><Configurations /></AdminProtectedRoute>} />
                <Route path="/communication" element={<AdminProtectedRoute permission={PERMISSIONS.communication}><Communication /></AdminProtectedRoute>} />
                <Route path="/user-management" element={<AdminProtectedRoute permission={PERMISSIONS.userManagement}><UserManagement /></AdminProtectedRoute>} />
                <Route path="/settings" element={<AdminProtectedRoute permission={PERMISSIONS.permissions}><Settings /></AdminProtectedRoute>} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
