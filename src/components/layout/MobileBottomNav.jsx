import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, Warehouse, ShoppingCart, FileSpreadsheet
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_TABS = [
  { to: '/',          icon: LayoutDashboard, label: 'Home' },
  { to: '/villages',  icon: MapPin,          label: 'Artisans' },
  { to: '/inventory', icon: Warehouse,       label: 'Products' },
  { to: '/sales',     icon: ShoppingCart,    label: 'POS Sales' },
  { to: '/reports',   icon: FileSpreadsheet, label: 'Reports' },
]

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-lg px-1 py-1 flex items-center justify-around pb-safe">
      {MOBILE_TABS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-95 text-center select-none',
              isActive
                ? 'text-amber-700 font-bold'
                : 'text-gray-400 hover:text-gray-600 font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                'p-1 rounded-xl transition-all',
                isActive ? 'bg-amber-100/70 text-amber-800' : 'text-gray-400'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-[56px]">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
