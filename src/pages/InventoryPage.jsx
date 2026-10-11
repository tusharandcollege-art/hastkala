import { useState } from 'react'
import useStore from '@/store/useStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import { formatCurrency, getStockStatus } from '@/lib/utils'
import { Package, Search, Warehouse, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function InventoryPage() {
  const {
    craftProducts = [],
    storeDispatches = [],
    sales = [],
    stockAdjustments = []
  } = useStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const categories = [...new Set(craftProducts.map(p => p.category).filter(Boolean))]

  const inventoryItems = craftProducts.map(p => {
    const dispatches = (storeDispatches || []).filter(d => d.craftProductId === p.id)
    const adjustments = (stockAdjustments || []).filter(a => a.craftProductId === p.id)
    const activeSales = (sales || []).filter(s => s && !s.isUndone)

    const totalSent = dispatches.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0)
    const totalAdj = adjustments.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0)
    const totalSold = activeSales.reduce((sum, s) => {
      if (!Array.isArray(s.items)) return sum
      const itemSold = s.items
        .filter(i => i && i.craftProductId === p.id)
        .reduce((iSum, i) => iSum + (Number(i.qty) || 0), 0)
      return sum + itemSold
    }, 0)

    const qty = Math.max(0, totalSent + totalAdj - totalSold)
    const status = getStockStatus(qty)
    const totalCostValue = qty * (Number(p.costPrice) || 0)
    const totalRetailValue = qty * (Number(p.sellingPrice) || 0)
    return {
      ...p,
      quantityAvailable: qty,
      status,
      totalCostValue,
      totalRetailValue
    }
  })

  const filtered = inventoryItems.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category && item.category !== category) return false
    if (statusFilter === 'in' && item.quantityAvailable <= 5) return false
    if (statusFilter === 'low' && (item.quantityAvailable <= 0 || item.quantityAvailable > 5)) return false
    if (statusFilter === 'out' && item.quantityAvailable > 0) return false
    return true
  })

  const totalInStockItems = inventoryItems.reduce((acc, item) => acc + item.quantityAvailable, 0)
  const totalCostValuation = inventoryItems.reduce((acc, item) => acc + item.totalCostValue, 0)
  const totalRetailValuation = inventoryItems.reduce((acc, item) => acc + item.totalRetailValue, 0)
  const lowStockCount = inventoryItems.filter(item => item.quantityAvailable > 0 && item.quantityAvailable <= 5).length
  const outOfStockCount = inventoryItems.filter(item => item.quantityAvailable === 0).length

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner KPI summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalInStockItems.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">Total Items in Store</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRetailValuation)}</p>
            <p className="text-xs text-gray-500 font-medium">Total Retail Valuation</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            <p className="text-xs text-gray-500 font-medium">Low Stock Products (≤ 5)</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
            <p className="text-xs text-gray-500 font-medium">Out of Stock Products</p>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            Stock is transferred into Store Inventory from <strong>Supply & Production ➔ Craft Catalog</strong> using the <strong>"Send to Store"</strong> button.
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 text-xs"
            placeholder="Search store inventory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input w-auto text-xs"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="input w-auto text-xs"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Stock Status</option>
          <option value="in">In Stock (&gt; 5)</option>
          <option value="low">Low Stock (1 - 5)</option>
          <option value="out">Out of Stock (0)</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <Thead>
            <Tr>
              <Th>Product Name</Th>
              <Th>Category</Th>
              <Th>Unit</Th>
              <Th className="text-right">Cost Price</Th>
              <Th className="text-right">Selling Price</Th>
              <Th className="text-right">Available Stock</Th>
              <Th>Status</Th>
              <Th className="text-right">Retail Valuation</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <EmptyRow colSpan={8} message="No items match your filter criteria." />
            ) : (
              filtered.map(item => (
                <Tr key={item.id}>
                  <Td>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                      {item.description && <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>}
                    </div>
                  </Td>
                  <Td><span className="text-xs font-medium text-gray-600">{item.category}</span></Td>
                  <Td><Badge variant="secondary">{item.unit || 'pcs'}</Badge></Td>
                  <Td className="text-right text-xs text-gray-600 font-medium">{formatCurrency(item.costPrice)}</Td>
                  <Td className="text-right text-xs text-primary-700 font-bold">{formatCurrency(item.sellingPrice)}</Td>
                  <Td className="text-right">
                    <span className={`font-bold text-base ${item.quantityAvailable > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                      {item.quantityAvailable}
                    </span>
                  </Td>
                  <Td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status.dot}`} />
                      {item.status.label}
                    </span>
                  </Td>
                  <Td className="text-right font-bold text-gray-900 text-sm">
                    {formatCurrency(item.totalRetailValue)}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
