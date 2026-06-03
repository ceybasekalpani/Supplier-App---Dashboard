import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Settings2,
  MessageCircle, UserCheck, SlidersHorizontal,
  Leaf, ChevronLeft, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/',               label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/suppliers',      label: 'Suppliers',       icon: Users           },
  { to: '/requests',       label: 'Requests',        icon: FileText,  badge: 13 },
  { to: '/configurations', label: 'Configurations',  icon: Settings2       },
  { to: '/communication',  label: 'Communication',   icon: MessageCircle   },
  { to: '/user-management',label: 'User Management', icon: UserCheck       },
  { to: '/settings',       label: 'Settings',        icon: SlidersHorizontal},
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
          <Leaf size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Tea Factory</p>
            <p className="text-[10px] text-slate-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group relative
               ${isActive
                 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                 : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
               }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
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
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}