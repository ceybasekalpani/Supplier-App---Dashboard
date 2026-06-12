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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          <Route element={<AdminProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/disbursements" element={<DisbursementManager />} />
              <Route path="/disbursement-tracking" element={<DisbursementTracking />} />
              <Route path="/configurations" element={<Configurations />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}