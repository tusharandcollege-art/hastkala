import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import useStore from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO, isValid } from 'date-fns'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

const COLORS = ['#f79a08','#22c55e','#8b5cf6','#3b82f6','#ec4899','#14b8a6']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{color: p.color}} className="flex gap-2">
          <span>{p.name}:</span>
          <span className="font-bold">
            {typeof p.value === 'number' && p.name !== 'Qty'
              ? formatCurrency(p.value)
              : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

export function SalesTrendChart() {
  const { sales = [] } = useStore()
  const activeSales = (sales || []).filter(s => s && !s.isUndone)

  // Group by month
  const byMonth = {}
  activeSales.forEach(s => {
    try {
      if (!s.date) return
      const d = parseISO(s.date)
      const key = isValid(d) ? format(d, 'MMM yy') : 'Other'
      if (!byMonth[key]) byMonth[key] = { month: key, Revenue: 0, Profit: 0 }
      byMonth[key].Revenue += Number(s.totalAmount) || 0
      byMonth[key].Profit  += Number(s.profit) || 0
    } catch {
      // ignore invalid date
    }
  })
  const data = Object.values(byMonth)

  return (
    <Card>
      <CardHeader>
        <h3 className="font-bold text-gray-800 text-sm">Revenue & Profit Trend</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="Revenue" stroke="#f79a08" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Profit"  stroke="#22c55e" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}

export function TopCraftsChart() {
  const { sales = [], craftProducts = [] } = useStore()
  const activeSales = (sales || []).filter(s => s && !s.isUndone)

  const byProduct = {}
  activeSales.forEach(s => {
    if (Array.isArray(s.items)) {
      s.items.forEach(i => {
        if (!i) return
        if (!byProduct[i.craftProductId]) byProduct[i.craftProductId] = { qty: 0, revenue: 0 }
        byProduct[i.craftProductId].qty     += Number(i.qty) || 0
        byProduct[i.craftProductId].revenue += (Number(i.qty) || 0) * (Number(i.unitPrice) || 0)
      })
    }
  })
  const data = Object.entries(byProduct)
    .map(([id, v]) => {
      const p = (craftProducts || []).find(c => c.id === id)
      return { name: p ? p.name.split(' ').slice(0,3).join(' ') : id, Revenue: v.revenue, Qty: v.qty }
    })
    .sort((a, b) => b.Revenue - a.Revenue)
    .slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <h3 className="font-bold text-gray-800 text-sm">Top Selling Crafts</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Revenue" fill="#f79a08" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}

export function VillageYieldChart() {
  const { dispatches = [], villages = [] } = useStore()

  const byVillage = {}
  ;(dispatches || []).forEach(d => {
    if (!d || !d.villageId) return
    if (!byVillage[d.villageId]) byVillage[d.villageId] = 0
    byVillage[d.villageId] += Number(d.quantityDispatched) || 0
  })
  const data = Object.entries(byVillage).map(([id, qty]) => {
    const v = (villages || []).find(vil => vil.id === id)
    return { name: v ? v.name : id, value: qty }
  })

  return (
    <Card>
      <CardHeader>
        <h3 className="font-bold text-gray-800 text-sm">Village Material Dispatches</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data.length ? data : [{ name: 'None', value: 1 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
              dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
              labelLine={false} fontSize={11}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`${v} qty`, 'Dispatched']} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}

export function PaymentSplitChart() {
  const { sales = [] } = useStore()
  const activeSales = (sales || []).filter(s => s && !s.isUndone)
  const cashAmt = activeSales.filter(s => s.paymentMode === 'Cash').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
  const upiAmt  = activeSales.filter(s => s.paymentMode === 'UPI').reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
  const data = [
    { name: '💵 Cash', value: cashAmt },
    { name: '📱 UPI',  value: upiAmt },
  ]
  return (
    <Card>
      <CardHeader>
        <h3 className="font-bold text-gray-800 text-sm">Payment Split</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
              labelLine={false} fontSize={11}
            >
              <Cell fill="#22c55e" />
              <Cell fill="#8b5cf6" />
            </Pie>
            <Tooltip formatter={v => [formatCurrency(v), 'Amount']} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
