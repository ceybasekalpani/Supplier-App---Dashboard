import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles = {
  '/':                'Dashboard',
  '/suppliers':       'Suppliers',
  '/requests':        'Requests',
  '/configurations':  'Configurations',
  '/communication':   'Communication',
  '/user-management': 'User Management',
  '/settings':        'Settings',
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-[60px]' : 'ml-[240px]'}`}>
        <Topbar pageTitle={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}