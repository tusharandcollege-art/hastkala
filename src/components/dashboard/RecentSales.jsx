import useStore from '@/store/useStore'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { ShoppingBag } from 'lucide-react'

export default function RecentSales() {
  const { sales = [], craftProducts = [], storeInventory = [] } = useStore()

  const recent = [...(sales || [])]
    .filter(s => s && !s.isUndone)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Recent Sales */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-500" />
              <h3 className="font-bold text-gray-800 text-sm">Recent Sales</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-2">
              {recent.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No sales yet</p>
              )}
              {recent.map(sale => (
                <div key={sale.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{sale.customerName || 'Customer'}</p>
                      {sale.customerPhone && (
                        <span className="text-[10px] text-gray-400 font-medium">({sale.customerPhone})</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {Array.isArray(sale.items)
                        ? sale.items.map(i => `${i.name || 'Item'} ×${i.qty || 1}`).join(', ')
                        : 'Items'}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{formatDateTime(sale.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <Badge variant={sale.paymentMode === 'Cash' ? 'cash' : 'upi'}>
                      {sale.paymentMode === 'Cash' ? '💵' : '📱'} {sale.paymentMode || 'Cash'}
                    </Badge>
                    <span className="font-bold text-gray-900 text-sm">{formatCurrency(sale.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
