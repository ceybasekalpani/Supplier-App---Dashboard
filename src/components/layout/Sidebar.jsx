import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Settings2,
  MessageCircle, UserCheck, SlidersHorizontal,
  Leaf, ChevronLeft, ChevronRight, Send, CheckCircle
} from 'lucide-react'
import { adminAuthStorage } from '../../services/adminApiClient'
import { hasAdminPermission, PERMISSIONS } from '../../services/adminPermissions'

const navItems = [
  { to: '/dashboard',      label: 'Dashboard',       icon: LayoutDashboard, permission: PERMISSIONS.dashboard },
  { to: '/suppliers',      label: 'Suppliers',       icon: Users, permission: PERMISSIONS.suppliers },
  { to: '/requests',       label: 'Requests',        icon: FileText, permission: PERMISSIONS.requests },
  { to: '/disbursements',  label: 'Disbursements',   icon: Send, permission: PERMISSIONS.disbursements },
  { to: '/disbursement-tracking', label: 'Disbursement Tracking', icon: CheckCircle, permission: PERMISSIONS.disbursementTracking },
  { to: '/configurations', label: 'Configurations',  icon: Settings2, permission: PERMISSIONS.configurations },
  { to: '/communication',  label: 'Communication',   icon: MessageCircle, permission: PERMISSIONS.communication },
  { to: '/user-management',label: 'User Management', icon: UserCheck, permission: PERMISSIONS.userManagement },
  { to: '/settings',       label: 'Permission Management', icon: SlidersHorizontal, permission: PERMISSIONS.permissions },
]

export default function Sidebar({ collapsed, onToggle }) {
  const currentAdmin = adminAuthStorage.getUser()
  const visibleNavItems = navItems.filter(item => hasAdminPermission(currentAdmin, item.permission))

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-15' : 'w-60'}`}
      style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
    >

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--theme-primary)' }}>
          <Leaf size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold leading-tight" style={{ color: 'var(--theme-text)' }}>Tea Factory</p>
            <p className="text-[10px]" style={{ color: 'var(--theme-textMuted)' }}>Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleNavItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group relative
               ${isActive
                 ? 'text-white'
                 : 'hover:bg-slate-100 dark:hover:bg-slate-800'
               }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--theme-primary)' : 'transparent',
              color: isActive ? 'var(--theme-white)' : 'var(--theme-textSecondary)',
            })}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="flex-1 truncate">{label}</span>}
            {!collapsed && badge && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          style={{ color: 'var(--theme-textSecondary)' }}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
