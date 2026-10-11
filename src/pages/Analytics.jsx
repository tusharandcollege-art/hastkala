import { useState, useMemo } from 'react'
import useStore from '@/store/useStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import ExcelExport from '@/components/reports/ExcelExport'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { format, parseISO, isValid } from 'date-fns'
import { Filter, Truck } from 'lucide-react'

const COLORS = ['#f79a08','#22c55e','#8b5cf6','#3b82f6','#ec4899','#14b8a6','#f97316']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{color: p.color}}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name !== 'Qty' ? formatCurrency(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { sales = [], artisans = [], villages = [], craftProducts = [], rawMaterials = [], dispatches = [] } = useStore()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const filteredSales = useMemo(() => (sales || []).filter(s => {
    if (!s || s.isUndone) return false
    if (dateFrom && s.date < dateFrom) return false
    if (dateTo   && s.date > dateTo)   return false
    return true
  }), [sales, dateFrom, dateTo])

  const filteredDispatches = useMemo(() => (dispatches || []).filter(d => {
    if (!d) return false
    if (dateFrom && d.date < dateFrom) return false
    if (dateTo   && d.date > dateTo)   return false
    return true
  }), [dispatches, dateFrom, dateTo])

  // Monthly revenue/profit
  const monthly = useMemo(() => {
    const m = {}
    filteredSales.forEach(s => {
      let key = 'Other'
      try {
        if (s.date) {
          const parsed = parseISO(s.date)
          if (isValid(parsed)) {
            key = format(parsed, 'MMM yy')
          }
        }
      } catch (e) {}
      if (!m[key]) m[key] = { month: key, Revenue: 0, Profit: 0, Transactions: 0 }
      m[key].Revenue += Number(s.totalAmount) || 0
      m[key].Profit  += Number(s.profit) || 0
      m[key].Transactions++
    })
    return Object.values(m)
  }, [filteredSales])

  // Top products
  const topProducts = useMemo(() => {
    const p = {}
    filteredSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach(i => {
          if (!i || !i.craftProductId) return
          if (!p[i.craftProductId]) p[i.craftProductId] = { revenue: 0, qty: 0 }
          p[i.craftProductId].revenue += (Number(i.qty) || 0) * (Number(i.unitPrice) || 0)
          p[i.craftProductId].qty     += Number(i.qty) || 0
        })
      }
    })
    return Object.entries(p)
      .map(([id, v]) => {
        const product = (craftProducts || []).find(c => c.id === id)
        return { name: product?.name || id, ...v }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [filteredSales, craftProducts])

  // Village dispatches breakdown
  const villageDispatches = useMemo(() => {
    const v = {}
    filteredDispatches.forEach(d => {
      if (!d || !d.villageId) return
      if (!v[d.villageId]) v[d.villageId] = 0
      v[d.villageId] += Number(d.quantityDispatched) || 0
    })
    return Object.entries(v).map(([id, qty]) => ({
      name: (villages || []).find(v => v.id === id)?.name || id, qty
    })).sort((a, b) => b.qty - a.qty)
  }, [filteredDispatches, villages])

  // Payment split
  const paymentSplit = useMemo(() => {
    const cash = filteredSales.filter(s => s.paymentMode === 'Cash').reduce((s, x) => s + (Number(x.totalAmount) || 0), 0)
    const upi  = filteredSales.filter(s => s.paymentMode === 'UPI').reduce((s, x) => s + (Number(x.totalAmount) || 0), 0)
    return [{ name: '💵 Cash', value: cash }, { name: '📱 UPI', value: upi }]
  }, [filteredSales])

  const totalRevenue = filteredSales.reduce((s, x) => s + (Number(x.totalAmount) || 0), 0)
  const totalProfit  = filteredSales.reduce((s, x) => s + (Number(x.profit) || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-xs text-gray-400 mt-0.5">Filter by date range to drill into specific periods</p>
        </div>
        <ExcelExport />
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-100 p-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
        <input type="date" className="input w-auto text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
        <span className="text-gray-400 text-xs">to</span>
        <input type="date" className="input w-auto text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }}
            className="text-xs text-gray-400 hover:text-gray-600 underline">Clear filter</button>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-primary-600' },
          { label: 'Net Profit',     value: formatCurrency(totalProfit),  color: 'text-green-600' },
          { label: 'Sales Transactions', value: filteredSales.length, color: 'text-blue-600' },
          { label: 'Dispatches Logged', value: filteredDispatches.length, color: 'text-violet-600' },
        ].map(k => (
          <Card key={k.label} className="p-4 text-center">
            <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-gray-800 text-sm">Revenue & Profit Over Time</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthly}>
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
        </div>
        <Card>
          <CardHeader>
            <h3 className="font-bold text-gray-800 text-sm">Payment Mode Split</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={paymentSplit} cx="50%" cy="45%" outerRadius={80} dataKey="value"
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
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Village Raw Material Dispatches */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-500" />
              <h3 className="font-bold text-gray-800 text-sm">Village Material Dispatches (Qty)</h3>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={villageDispatches} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip formatter={v => [v, 'Qty Dispatched']} />
                <Bar dataKey="qty" fill="#f79a08" radius={[0,6,6,0]} name="Qty Dispatched" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-gray-800 text-sm">Top Products by Sales Revenue</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
