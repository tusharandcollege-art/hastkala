import { Link } from 'react-router-dom'
import KPICards from '@/components/dashboard/KPICards'
import { SalesTrendChart, TopCraftsChart, VillageYieldChart, PaymentSplitChart } from '@/components/dashboard/Charts'
import RecentSales from '@/components/dashboard/RecentSales'
import { ShoppingCart, Package, Users, FileSpreadsheet, ArrowRight, Sparkles } from 'lucide-react'
import useStore from '@/store/useStore'

export default function Dashboard() {
  const { sales = [], craftProducts = [] } = useStore()
  const activeSales = (sales || []).filter(s => s && !s.isUndone)

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-4">
      {/* Mobile App Hero Banner */}
      <div className="block md:hidden bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 text-8xl pointer-events-none translate-x-4 translate-y-4">
          🏺
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏺</span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-200/90 bg-amber-700/50 px-2 py-0.5 rounded-full border border-amber-500/30">
              Hastkala CSR
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Rural Craft Portal</h1>
            <p className="text-xs text-amber-100/80 font-normal mt-0.5">
              Empowering rural artisans • Live inventory & POS sales
            </p>
          </div>

          {/* Quick Action Navigation Pills on Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/sales"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-xs font-bold text-white transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-300" />
                <span>POS Sales</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              to="/inventory"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-xs font-bold text-white transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-300" />
                <span>Inventory</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              to="/villages"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-xs font-bold text-white transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-300" />
                <span>Artisans</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-xs font-bold text-white transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-300" />
                <span>Reports</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="md:col-span-2"><SalesTrendChart /></div>
        <TopCraftsChart />
        <VillageYieldChart />
      </div>

      {/* Recent Sales Register */}
      <RecentSales />
    </div>
  )
}
