import { useState } from 'react'
import useStore from '@/store/useStore'
import { formatCurrency, today } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import {
  ShoppingCart, Plus, Minus, Trash2, CheckCircle2,
  Banknote, Smartphone, RotateCcw, User, Clock, Search, X
} from 'lucide-react'
import { differenceInMinutes, parseISO, isValid } from 'date-fns'

// ─── Product Grid ─────────────────────────────────────────────────────────────

function ProductGrid({ craftProducts, getInventoryQty, onAdd }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = [...new Set(craftProducts.map(p => p.category).filter(Boolean))]

  const filtered = craftProducts.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category && p.category !== category) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 text-xs"
            placeholder="Search items to sell..."
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
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {filtered.map(product => {
          const availQty = getInventoryQty(product.id)
          const isOutOfStock = availQty <= 0

          return (
            <div
              key={product.id}
              onClick={() => !isOutOfStock && onAdd(product)}
              className={`pos-product-card group relative p-3 sm:p-4 rounded-2xl border bg-white transition-all select-none flex flex-col justify-between ${
                isOutOfStock
                  ? 'opacity-50 cursor-not-allowed border-gray-100'
                  : 'cursor-pointer hover:border-primary-400 hover:shadow-md border-gray-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-primary-700 bg-primary-50 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[80px] sm:max-w-none">
                    {product.category || 'Craft'}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-700'
                        : availQty <= 5
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isOutOfStock ? 'Out' : `${availQty} left`}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 sm:line-clamp-1">
                  {product.name}
                </h4>
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-50">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 block">Price</span>
                  <span className="text-sm sm:text-base font-extrabold text-gray-900">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                </div>

                <Button
                  size="sm"
                  disabled={isOutOfStock}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isOutOfStock) onAdd(product)
                  }}
                  className="rounded-xl px-2 sm:px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Checkout Confirmation Modal ──────────────────────────────────────────────

function CheckoutModal({ cart, totalAmount, totalProfit, customerName, setCustomerName, paymentMode, setPaymentMode, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={true} onClose={onClose} title="Confirm Sales Transaction" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Details */}
        <div>
          <label className="label">Customer Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Walk-in Customer"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Payment Mode Selection */}
        <div>
          <label className="label">Payment Method *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setPaymentMode('Cash')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                paymentMode === 'Cash'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span>💵 Cash</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setPaymentMode('UPI')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                paymentMode === 'UPI'
                  ? 'border-violet-500 bg-violet-50 text-violet-800 ring-2 ring-violet-400/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-5 h-5 text-violet-600" />
              <span>📱 UPI</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs">
          <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Order Summary</p>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-gray-800">
              <span>{item.name} × {item.qty}</span>
              <strong className="font-semibold">{formatCurrency(item.sellingPrice * item.qty)}</strong>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
            <span>Total Payable:</span>
            <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-emerald-700 font-semibold pt-1">
            <span>Estimated Profit Margin:</span>
            <span>{totalProfit >= 0 ? `+${formatCurrency(totalProfit)}` : formatCurrency(totalProfit)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Sale — {formatCurrency(totalAmount)}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Today's Sales Strip ──────────────────────────────────────────────────────

function TodaySaleStrip() {
  const { sales = [], undoSale } = useStore()
  const todaySales = (sales || [])
    .filter(s => s && !s.isUndone && s.date === today())
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const todayRevenue = todaySales.reduce((s, x) => s + (Number(x.totalAmount) || 0), 0)
  const todayProfit  = todaySales.reduce((s, x) => s + (Number(x.profit) || 0), 0)

  const canUndo = (sale) => {
    try {
      if (!sale?.createdAt) return false
      const parsed = parseISO(sale.createdAt)
      if (!isValid(parsed)) return false
      const mins = differenceInMinutes(new Date(), parsed)
      return !isNaN(mins) && mins <= 30
    } catch {
      return false
    }
  }

  if (todaySales.length === 0) return null

  return (
    <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-500" />
          <h3 className="font-bold text-sm text-gray-900">Today's Sales Register ({todaySales.length})</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-500">Revenue: <strong className="text-gray-900">{formatCurrency(todayRevenue)}</strong></span>
          <span className="text-emerald-600">Profit: <strong>{formatCurrency(todayProfit)}</strong></span>
        </div>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {todaySales.map(sale => (
          <div key={sale.id} className="flex items-center gap-3 text-xs py-2 border-b border-gray-50 last:border-0">
            <Badge variant={sale.paymentMode === 'Cash' ? 'cash' : 'upi'} className="flex-shrink-0">
              {sale.paymentMode === 'Cash' ? '💵' : '📱'} {sale.paymentMode}
            </Badge>
            <span className="font-medium text-gray-800 truncate flex-1">{sale.customerName || 'Walk-in Customer'}</span>
            <span className="text-gray-500 truncate hidden sm:block">
              {Array.isArray(sale.items)
                ? sale.items.map(i => `${i.name || 'Item'}×${i.qty || 1}`).join(', ')
                : '—'}
            </span>
            <span className="font-bold text-gray-900 flex-shrink-0">{formatCurrency(sale.totalAmount)}</span>
            {canUndo(sale) && (
              <button
                onClick={() => { if (confirm('Undo this sale? Stock will be returned to Store Inventory.')) undoSale(sale.id) }}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 flex-shrink-0 font-semibold"
                title="Undo within 30 minutes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Sales Counter Page ──────────────────────────────────────────────────

export default function SalesPage() {
  const {
    craftProducts = [],
    storeDispatches = [],
    sales = [],
    stockAdjustments = [],
    getInventoryQty,
    addSale
  } = useStore()

  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [showCheckout, setShowCheckout] = useState(false)
  const [lastSuccess, setLastSuccess] = useState(null)

  const handleAddToCart = (product) => {
    const availQty = getInventoryQty(product.id)
    const existing = cart.find(item => item.id === product.id)
    const currentCartQty = existing ? existing.qty : 0

    if (currentCartQty + 1 > availQty) {
      alert(`Cannot add more. Only ${availQty} available in Store Inventory.`)
      return
    }

    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  const handleUpdateQty = (productId, delta) => {
    const product = craftProducts.find(p => p.id === productId)
    const availQty = getInventoryQty(productId)

    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.qty + delta
        if (newQty > availQty) {
          alert(`Max available stock is ${availQty}`)
          return item
        }
        return newQty > 0 ? { ...item, qty: newQty } : null
      }
      return item
    }).filter(Boolean))
  }

  const handleRemove = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0)
  const totalProfit = cart.reduce((sum, item) => sum + (item.sellingPrice - (item.costPrice || 0)) * item.qty, 0)

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      setShowCheckout(false)
      return
    }

    try {
      addSale({
        date: today(),
        customerName: customerName.trim() || 'Walk-in Customer',
        paymentMode,
        items: cart.map(item => ({
          craftProductId: item.id,
          name: item.name,
          qty: item.qty,
          unitPrice: item.sellingPrice,
          costPrice: item.costPrice || 0
        })),
        totalAmount,
        profit: totalProfit,
        isUndone: false
      })

      setLastSuccess(`Sale of ${formatCurrency(totalAmount)} completed successfully! Stock updated.`)
      setTimeout(() => setLastSuccess(null), 5000)
    } catch (err) {
      console.error('Error confirming sale:', err)
      alert('Error recording sale: ' + err.message)
    } finally {
      // Guaranteed to reset cart and close modal
      setCart([])
      setCustomerName('')
      setShowCheckout(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Floating Global Success Toast */}
      {lastSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-full px-2 animate-fade-in pointer-events-auto">
          <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-gray-700/80 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Sale Completed
              </span>
              <p className="text-xs text-gray-200 mt-0.5 font-medium leading-relaxed">
                {lastSuccess}
              </p>
            </div>
            <button
              onClick={() => setLastSuccess(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Product Selection Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Store POS Counter</h2>
              <p className="text-xs text-gray-400">Select items from Store Inventory to process retail sales</p>
            </div>
          </div>

          <ProductGrid
            craftProducts={craftProducts}
            getInventoryQty={getInventoryQty}
            onAdd={handleAddToCart}
          />
        </div>

        {/* Right: Cart & Checkout Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900">Current Cart ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto stroke-1 text-gray-300" />
                  <p className="text-xs">Cart is empty.<br />Click products on the left to add items.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{formatCurrency(item.sellingPrice)} each</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="w-6 h-6 rounded-lg text-gray-400 hover:text-red-600 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary Footer */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-medium text-gray-500">Subtotal</span>
                    <strong className="text-xl font-extrabold text-gray-900">{formatCurrency(totalAmount)}</strong>
                  </div>

                  <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
                    <CheckCircle2 className="w-5 h-5" />
                    Checkout ({formatCurrency(totalAmount)})
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Floating Quick Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30 md:hidden flex items-center justify-between shadow-2xl px-4 animate-fade-in">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">
              Cart ({cart.reduce((s, i) => s + i.qty, 0)} {cart.reduce((s, i) => s + i.qty, 0) === 1 ? 'item' : 'items'})
            </p>
            <p className="text-base font-black text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <Button size="md" onClick={() => setShowCheckout(true)} className="shadow-md rounded-xl">
            <span>Checkout</span>
            <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Today's Sales History Strip */}
      <TodaySaleStrip />

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          totalAmount={totalAmount}
          totalProfit={totalProfit}
          customerName={customerName}
          setCustomerName={setCustomerName}
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleConfirmSale}
        />
      )}
    </div>
  )
}
