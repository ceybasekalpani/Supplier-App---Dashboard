import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Suppliers from './pages/Suppliers'
import Requests from './pages/Requests'
import DisbursementManager from './pages/DisbursementManager'
import DisbursementTracking from './pages/DisbursementTracking'
import Configurations from './pages/Configurations'
import Communication from './pages/Communication'
import UserManagement from './pages/UserManagement'
import Settings from './pages/Settings'
import { PERMISSIONS } from './services/adminPermissions'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </ThemeProvider>
  )
}
