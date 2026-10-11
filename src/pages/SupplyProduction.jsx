import { useState } from 'react'
import { Package, Truck, Warehouse } from 'lucide-react'
import RawMaterials from '@/components/supply/RawMaterials'
import DispatchLog from '@/components/supply/DispatchLog'
import InventoryPage from '@/pages/InventoryPage'

const TABS = [
  { id: 'materials', label: 'Raw Materials', icon: Package },
  { id: 'dispatch',  label: 'Dispatch Log',   icon: Truck },
  { id: 'products',  label: 'Products & Inventory', icon: Warehouse },
]

export default function SupplyProduction() {
  const [tab, setTab] = useState('materials')

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'materials' && <RawMaterials />}
      {tab === 'dispatch'  && <DispatchLog />}
      {tab === 'products'  && <InventoryPage />}
    </div>
  )
}
