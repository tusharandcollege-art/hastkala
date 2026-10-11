import KPICards from '@/components/dashboard/KPICards'
import { SalesTrendChart, TopCraftsChart, VillageYieldChart, PaymentSplitChart } from '@/components/dashboard/Charts'
import RecentSales from '@/components/dashboard/RecentSales'

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <KPICards />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="md:col-span-2"><SalesTrendChart /></div>
        <TopCraftsChart />
        <VillageYieldChart />
      </div>

      <RecentSales />
    </div>
  )
}
