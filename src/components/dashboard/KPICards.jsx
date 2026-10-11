import useStore from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, Package, ShoppingCart, Banknote, MapPin, AlertTriangle } from 'lucide-react'

function KPICard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 line-clamp-1">{label}</span>
        <div className={`p-2 sm:p-2.5 rounded-xl ${bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
        </div>
      </div>
      <div>
        <p className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">{value}</p>
        {sub && <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate font-medium">{sub}</p>}
      </div>
    </div>
  )
}

export default function KPICards() {
  const {
    rawMaterials = [], villages = [], artisans = [],
    craftProducts = [], storeDispatches = [], sales = [], stockAdjustments = [],
    getInventoryQty
  } = useStore()

  const activeSales = (sales || []).filter(s => s && !s.isUndone)
  const totalRevenue = activeSales.reduce((s, x) => s + (Number(x.totalAmount) || 0), 0)
  const totalProfit  = activeSales.reduce((s, x) => s + (Number(x.profit) || 0), 0)
  const totalSentToStore = (storeDispatches || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0)
  const rawMatValue  = (rawMaterials || []).reduce((s, m) => s + (Number(m.quantity) || 0) * (Number(m.unitCost) || 0), 0)

  const productStocks = (craftProducts || []).map(p => getInventoryQty(p.id))
  const lowStock     = productStocks.filter(qty => qty > 0 && qty <= 5).length
  const outStock     = productStocks.filter(qty => qty <= 0).length

  const cards = [
    { icon: Banknote,      label: 'Total Sales Revenue',     value: formatCurrency(totalRevenue), sub: `${activeSales.length} transactions`,  color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: TrendingUp,    label: 'Net Profit',               value: formatCurrency(totalProfit),  sub: `${totalRevenue > 0 ? Math.round(totalProfit/totalRevenue*100) : 0}% margin`,         color: 'text-green-600',   bg: 'bg-green-50' },
    { icon: Package,       label: 'Craft Items Sent to Store', value: totalSentToStore.toLocaleString(), sub: `${(craftProducts || []).length} product types`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Users,         label: 'Active Artisans',          value: (artisans || []).filter(a=>a && a.isActive).length, sub: `Across ${(villages || []).length} villages`, color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: MapPin,        label: 'Villages Active',          value: (villages || []).length,              sub: 'in the program',                       color: 'text-earth-600',   bg: 'bg-earth-50' },
    { icon: ShoppingCart,  label: 'Raw Material Stock Value', value: formatCurrency(rawMatValue),  sub: `${(rawMaterials || []).length} materials`,     color: 'text-amber-600',   bg: 'bg-amber-50' },
  ]

  return (
    <>
      {(lowStock > 0 || outStock > 0) && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Stock Alert:</strong>{' '}
            {outStock > 0 && <span>{outStock} product{outStock>1?'s':''} out of stock. </span>}
            {lowStock > 0 && <span>{lowStock} product{lowStock>1?'s':''} running low.</span>}
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map(c => <KPICard key={c.label} {...c} />)}
      </div>
    </>
  )
}
