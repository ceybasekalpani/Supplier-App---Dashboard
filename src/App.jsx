import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Suppliers from './pages/Suppliers'
import Requests from './pages/Requests'
import Configurations from './pages/Configurations'
import Communication from './pages/Communication'
import UserManagement from './pages/UserManagement'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/"                index element={<Dashboard />} />
            <Route path="/suppliers"       element={<Suppliers />} />
            <Route path="/requests"        element={<Requests />} />
            <Route path="/configurations"  element={<Configurations />} />
            <Route path="/communication"   element={<Communication />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/settings"        element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}