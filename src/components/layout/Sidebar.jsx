import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, Package, Warehouse, ShoppingCart,
  BarChart3, ChevronLeft, ChevronRight, Menu, X, LogOut, User, FileSpreadsheet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/villages',    icon: MapPin,           label: 'Villages & Artisans' },
  { to: '/supply',      icon: Package,          label: 'Supply & Production' },
  { to: '/inventory',   icon: Warehouse,        label: 'Products & Inventory' },
  { to: '/sales',       icon: ShoppingCart,     label: 'Sales' },
  { to: '/analytics',   icon: BarChart3,        label: 'Analytics & Reports' },
  { to: '/reports',     icon: FileSpreadsheet,  label: 'Reports & Export' },
]

export function Sidebar({ collapsed, onCollapse }) {
  const { user, logout } = useAuth()

  return (
    <aside className={cn(
      'hidden md:flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-gray-100',
        collapsed && 'justify-center px-2'
      )}>
        <span className="text-2xl flex-shrink-0">🏺</span>
        {!collapsed && (
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight">Hastkala</h1>
            <p className="text-[10px] text-gray-400 font-medium">Rural Artisan Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive',
                collapsed && 'justify-center px-0')
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout section */}
      <div className="p-2 border-t border-gray-100">
        {!collapsed ? (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-800 truncate">{user?.username || 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title="Sign Out"
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onCollapse}
        className="flex items-center justify-center p-3 border-t border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : (
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <ChevronLeft className="w-4 h-4" /> Collapse
          </span>
        )}
      </button>
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏺</span>
                <div>
                  <h1 className="text-base font-black text-gray-900">Hastkala</h1>
                  <p className="text-[10px] text-gray-400">Rural Artisan Platform</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.username || 'Admin'})</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
