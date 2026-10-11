import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, MobileNav } from './Sidebar'
import { useAuth } from '@/context/AuthContext'
import { LogOut } from 'lucide-react'

const PAGE_TITLES = {
  '/':          { title: 'Dashboard', subtitle: 'Overview of your craft supply chain' },
  '/villages':  { title: 'Villages & Artisans', subtitle: 'Manage villages and artisan directory' },
  '/supply':    { title: 'Supply & Production', subtitle: 'Raw materials, plant dispatches, and production' },
  '/inventory': { title: 'Products & Inventory', subtitle: 'Master product catalog, live stock levels, and quick stock audits' },
  '/sales':     { title: 'Store POS Sales', subtitle: 'Point of sale counter — sell products to customers' },
  '/analytics': { title: 'Analytics & Reports', subtitle: 'Charts, insights, and Excel exports' },
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const page = PAGE_TITLES[pathname] || { title: 'Hastkala', subtitle: '' }

  return (
    <div className="flex h-screen bg-[#f8f7f4] overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 md:px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <MobileNav />
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-lg">🏺</span>
            <span className="font-black text-gray-900 text-sm">Hastkala</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-base font-bold text-gray-900 leading-tight">{page.title}</h2>
            <p className="text-xs text-gray-400">{page.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium border border-primary-100">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block animate-pulse" />
              Live Data
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-colors font-medium border border-gray-200 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
