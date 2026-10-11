import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '@/store/useStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import { formatCurrency, formatDate, getStockStatus, today } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import {
  Package, Search, Warehouse, AlertTriangle, CheckCircle2,
  Plus, Pencil, Trash2, History, ArrowDownToLine, SlidersHorizontal,
  X, Check, AlertCircle, ShoppingBag, FileSpreadsheet
} from 'lucide-react'

const CATEGORIES = [
  'Bags & Accessories', 'Textiles', 'Pottery', 'Home Decor',
  'Jewellery', 'Paintings & Art', 'Wooden Crafts', 'Other'
]

const ADJUSTMENT_REASONS = [
  'Correction / Typo Fix (mistyped initial count)',
  'Physical Audit Recount',
  'Damaged / Broken / Defective item',
  'Sample / Exhibition display piece',
  'Returned by Customer',
  'Lost / Misplaced',
  'Other'
]

// ─── Modal: Add / Edit Product Definition ────────────────────────────────────

function ProductModal({ product, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {
      name: '', category: CATEGORIES[0], costPrice: '', sellingPrice: '',
      unit: 'piece', initialStock: 0, description: ''
    }
  })

  const onSubmit = (data) => {
    onSave({
      ...data,
      costPrice: Number(data.costPrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      initialStock: Number(data.initialStock) || 0,
    })
  }

  return (
    <Modal open={true} onClose={onClose} title={product ? 'Edit Product Definition' : 'Add New Craft Product'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Product Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Handwoven Jute Tote Bag"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select className="input" {...register('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Unit of Measurement *</label>
            <select className="input" {...register('unit')}>
              <option value="piece">piece (pcs)</option>
              <option value="set">set</option>
              <option value="pair">pair</option>
              <option value="meter">meter</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Cost Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="e.g. 180"
              {...register('costPrice', { required: 'Cost price required', valueAsNumber: true })}
            />
            {errors.costPrice && <p className="text-xs text-red-500 mt-1">{errors.costPrice.message}</p>}
          </div>

          <div>
            <label className="label">Retail Selling Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="e.g. 450"
              {...register('sellingPrice', { required: 'Selling price required', valueAsNumber: true })}
            />
            {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice.message}</p>}
          </div>
        </div>

        {!product && (
          <div>
            <label className="label">Initial Stock on Hand (Optional)</label>
            <input
              type="number"
              min="0"
              className="input"
              placeholder="e.g. 20 (immediately available in inventory)"
              {...register('initialStock', { valueAsNumber: true })}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Entering a number here makes items available for sale immediately without an extra step.
            </p>
          </div>
        )}

        <div>
          <label className="label">Description / Craft Story</label>
          <textarea
            className="input"
            rows="2"
            placeholder="Brief craft description..."
            {...register('description')}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">
            <CheckCircle2 className="w-4 h-4" />
            {product ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Restock / Receive Incoming Batch ─────────────────────────────────

function RestockModal({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState('10')
  const [costPrice, setCostPrice] = useState(product.costPrice?.toString() || '')
  const [date, setDate] = useState(() => today())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const qty = Number(quantity) || 0
  const cost = Number(costPrice) || 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!qty || qty <= 0) {
      setError('Please enter a valid restock quantity of at least 1.')
      return
    }
    setError('')
    onSave({
      craftProductId: product.id,
      quantity: qty,
      costPrice: cost,
      date,
      notes: notes.trim() || 'Restock batch intake'
    })
  }

  return (
    <Modal open={true} onClose={onClose} title={`Restock Product — ${product.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{product.category}</span>
            <Badge variant="success">Restock Intake</Badge>
          </div>
          <p className="font-bold text-base text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-600">
            Incoming stock will be added directly into available store inventory.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Quantity to Add ({product.unit || 'pcs'}) *</label>
            <input
              type="number"
              min="1"
              required
              className="input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
          <div>
            <label className="label">Cost Price per unit (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder={`₹${product.costPrice}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Receipt Date *</label>
            <input
              type="date"
              required
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Batch / Artisan Source Notes</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Rampur cluster intake #3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {qty > 0 && cost > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex justify-between items-center">
            <span>Total Intake Valuation:</span>
            <strong className="text-sm">{formatCurrency(qty * cost)}</strong>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">
            <ArrowDownToLine className="w-4 h-4" />
            Confirm Restock (+{qty} {product.unit || 'pcs'})
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Stock Adjustment (Set Exact Count / Typo Fix / Audit) ─────────────

function AdjustStockModal({ product, currentStock, onClose, onSave }) {
  const [mode, setMode] = useState('audit') // 'audit' (set exact count) | 'delta' (+/- quick adjust)
  const [exactCount, setExactCount] = useState(currentStock.toString())
  const [deltaInput, setDeltaInput] = useState('')
  const [reason, setReason] = useState(ADJUSTMENT_REASONS[0])
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(() => today())
  const [error, setError] = useState('')

  // Calculate delta & newStock
  let delta = 0
  let newStock = currentStock

  if (mode === 'audit') {
    const parsedExact = Number(exactCount)
    if (!isNaN(parsedExact) && exactCount.trim() !== '') {
      newStock = Math.max(0, parsedExact)
      delta = newStock - currentStock
    }
  } else {
    const parsedDelta = Number(deltaInput)
    if (!isNaN(parsedDelta) && deltaInput.trim() !== '') {
      delta = parsedDelta
      newStock = Math.max(0, currentStock + delta)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (delta === 0) {
      setError('No change in stock. Enter a different physical count or adjustment quantity.')
      return
    }
    setError('')
    onSave({
      craftProductId: product.id,
      quantity: delta,
      reason,
      notes: notes.trim(),
      date,
      previousStock: currentStock,
      newStock
    })
  }

  return (
    <Modal open={true} onClose={onClose} title={`Adjust Stock — ${product.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current status banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">{product.category}</span>
            <h4 className="font-bold text-base text-gray-900 mt-0.5">{product.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-500 font-medium">Currently Recorded</span>
            <p className="text-lg font-black text-gray-900">{currentStock} {product.unit || 'pcs'}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('audit'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all text-center ${
              mode === 'audit' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ✏️ Set Exact Physical Count (Typo / Recount)
          </button>
          <button
            type="button"
            onClick={() => { setMode('delta'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all text-center ${
              mode === 'delta' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ⚖️ Quick (+ / -) Adjustment
          </button>
        </div>

        {/* Audit Mode: Set exact physical count */}
        {mode === 'audit' ? (
          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="label">Actual Physical Shelf Count ({product.unit || 'pcs'}) *</label>
              <input
                type="number"
                min="0"
                required
                className="input text-base font-bold"
                value={exactCount}
                onChange={(e) => { setExactCount(e.target.value); setError(''); }}
                placeholder="e.g. 10"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Enter the exact number of pieces you actually have right now.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-gray-600">Calculated Adjustment:</span>
              <strong className={`text-sm ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {delta > 0 ? `+${delta}` : delta} {product.unit || 'pcs'}
              </strong>
            </div>
          </div>
        ) : (
          /* Delta Mode: +/- quick change */
          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="label">Quantity to Add or Deduct *</label>
              <input
                type="number"
                required
                className="input text-base font-bold"
                value={deltaInput}
                onChange={(e) => { setDeltaInput(e.target.value); setError(''); }}
                placeholder="e.g. -2 for damaged, or +5 for restock"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Use a negative number (e.g. <code>-5</code>) to deduct, or positive (e.g. <code>5</code>) to add.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-gray-600">New Resulting Stock:</span>
              <strong className="text-sm text-gray-900">
                {newStock} {product.unit || 'pcs'}
              </strong>
            </div>
          </div>
        )}

        {/* Reason and Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Reason for Adjustment *</label>
            <select
              className="input text-xs"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {ADJUSTMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Adjustment Date *</label>
            <input
              type="date"
              required
              className="input text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Audit Notes (Optional)</label>
          <input
            type="text"
            className="input text-xs"
            placeholder="e.g. Corrected typo from initial batch entry"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Impact summary notice */}
        <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex justify-between items-center">
          <span>Final Stock after Saving:</span>
          <strong className="text-sm font-black text-blue-950">
            {newStock} {product.unit || 'pcs'}
          </strong>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">
            <Check className="w-4 h-4" />
            Save Stock Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: History / Passbook Timeline ───────────────────────────────────────

function ProductHistoryModal({ product, onClose }) {
  const { storeDispatches = [], stockAdjustments = [], sales = [] } = useStore()

  const productDispatches = (storeDispatches || []).filter(d => d.craftProductId === product.id)
  const productAdjustments = (stockAdjustments || []).filter(a => a.craftProductId === product.id)

  const productSales = (sales || [])
    .filter(s => s && !s.isUndone)
    .filter(s => Array.isArray(s.items) && s.items.some(i => i && i.craftProductId === product.id))
    .map(s => {
      const matchItem = s.items.find(i => i && i.craftProductId === product.id)
      return {
        id: s.id,
        date: s.date || s.createdAt?.slice(0, 10),
        type: 'SALE',
        label: `POS Sale — ${s.customerName || 'Customer'}`,
        quantity: matchItem ? matchItem.qty : 1,
        notes: `Payment: ${s.paymentMode || 'Cash'} • Total receipt: ${formatCurrency(s.totalAmount)}`,
        createdAt: s.createdAt
      }
    })

  // Merge into single timeline
  const timeline = [
    ...productDispatches.map(d => ({
      id: d.id,
      date: d.date,
      type: 'INWARD',
      label: d.notes?.includes('Initial') ? 'Initial Stock Intake' : 'Batch Restock',
      quantity: d.quantity,
      notes: d.notes,
      createdAt: d.createdAt
    })),
    ...productAdjustments.map(a => ({
      id: a.id,
      date: a.date,
      type: 'ADJUSTMENT',
      label: `Stock Adjustment (${a.reason || 'Manual'})`,
      quantity: a.quantity,
      notes: a.notes ? `${a.notes} ${a.previousStock !== undefined ? `(from ${a.previousStock} → ${a.newStock})` : ''}` : (a.previousStock !== undefined ? `Count changed from ${a.previousStock} → ${a.newStock}` : ''),
      createdAt: a.createdAt
    })),
    ...productSales
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  const totalInward = productDispatches.reduce((s, d) => s + (Number(d.quantity) || 0), 0)
  const totalAdjusted = productAdjustments.reduce((s, a) => s + (Number(a.quantity) || 0), 0)
  const totalSold = productSales.reduce((s, x) => s + (Number(x.quantity) || 0), 0)
  const currentCalculated = Math.max(0, totalInward + totalAdjusted - totalSold)

  return (
    <Modal open={true} onClose={onClose} title={`Stock Ledger — ${product.name}`} size="lg">
      <div className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
          <div>
            <span className="text-[10px] font-medium text-gray-500 uppercase">Restocked</span>
            <p className="text-base font-bold text-gray-900">+{totalInward}</p>
          </div>
          <div>
            <span className="text-[10px] font-medium text-gray-500 uppercase">Adjustments</span>
            <p className={`text-base font-bold ${totalAdjusted >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totalAdjusted >= 0 ? `+${totalAdjusted}` : totalAdjusted}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-medium text-gray-500 uppercase">Sold at POS</span>
            <p className="text-base font-bold text-red-600">-{totalSold}</p>
          </div>
          <div>
            <span className="text-[10px] font-medium text-gray-500 uppercase">Live Stock</span>
            <p className="text-base font-black text-primary-700">{currentCalculated} {product.unit || 'pcs'}</p>
          </div>
        </div>

        {/* Timeline list */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {timeline.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No transaction records found.</p>
          ) : (
            timeline.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  item.type === 'INWARD'
                    ? 'bg-emerald-50/50 border-emerald-100'
                    : item.type === 'SALE'
                    ? 'bg-rose-50/50 border-rose-100'
                    : 'bg-amber-50/50 border-amber-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'INWARD'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.type === 'SALE'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.type === 'INWARD' && <ArrowDownToLine className="w-4 h-4" />}
                    {item.type === 'SALE' && <ShoppingBag className="w-4 h-4" />}
                    {item.type === 'ADJUSTMENT' && <SlidersHorizontal className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.label}</span>
                      <span className="text-gray-400">• {formatDate(item.date)}</span>
                    </div>
                    {item.notes && <p className="text-gray-500 text-[11px] mt-0.5">{item.notes}</p>}
                  </div>
                </div>

                <span className={`font-bold text-sm ${
                  item.type === 'INWARD'
                    ? 'text-emerald-700'
                    : item.type === 'SALE'
                    ? 'text-rose-700'
                    : Number(item.quantity) >= 0
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}>
                  {item.type === 'SALE' ? `-${item.quantity}` : Number(item.quantity) > 0 ? `+${item.quantity}` : item.quantity} {product.unit || 'pcs'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Products & Inventory Hub Component ──────────────────────────────────

export default function InventoryPage() {
  const navigate = useNavigate()
  const {
    craftProducts = [],
    storeDispatches = [],
    sales = [],
    stockAdjustments = [],
    addCraftProduct,
    updateCraftProduct,
    deleteCraftProduct,
    restockProduct,
    adjustStock
  } = useStore()

  const [modal, setModal] = useState(null) // 'add' | { edit: p } | { restock: p } | { adjust: p } | { history: p }
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const categories = [...new Set(craftProducts.map(p => p.category).filter(Boolean))]

  // Compute live available stock for each product
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

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 5000)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Floating Global Success Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-full px-2 animate-fade-in pointer-events-auto">
          <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-gray-700/80 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Inventory Updated
              </span>
              <p className="text-xs text-gray-200 mt-0.5 font-medium leading-relaxed">
                {toastMessage}
              </p>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Products & Inventory Hub</h2>
          <p className="text-xs text-gray-400">
            Catalog products, live available stock, restocks, and manual stock audits with typo correction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/reports')}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:inline hidden text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-1">Reports</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button onClick={() => setModal('add')}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Top Banner KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalInStockItems.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">Total Items in Stock ({inventoryItems.length} Products)</p>
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

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 text-xs"
            placeholder="Search products by name..."
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

      {/* Desktop Master Inventory Table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <Thead>
              <Tr>
                <Th>Product & Category</Th>
                <Th>Unit</Th>
                <Th className="text-right">Cost Price</Th>
                <Th className="text-right">Selling Price</Th>
                <Th className="text-right">Available Stock</Th>
                <Th>Status</Th>
                <Th className="text-right">Retail Value</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <EmptyRow colSpan={8} message="No craft products found in inventory." />
              ) : (
                filtered.map(item => (
                  <Tr key={item.id}>
                    <Td>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <span className="text-[10px] text-primary-700 bg-primary-50 font-medium px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {item.category}
                        </span>
                      </div>
                    </Td>
                    <Td><Badge variant="secondary">{item.unit || 'pcs'}</Badge></Td>
                    <Td className="text-right text-xs text-gray-600 font-medium">{formatCurrency(item.costPrice)}</Td>
                    <Td className="text-right text-xs text-primary-700 font-bold">{formatCurrency(item.sellingPrice)}</Td>
                    <Td className="text-right">
                      <span className={`font-black text-base ${item.quantityAvailable > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                        {item.quantityAvailable} {item.unit || 'pcs'}
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
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Restock Button */}
                        <button
                          onClick={() => setModal({ restock: item })}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Restock incoming batch"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>+ Restock</span>
                        </button>

                        {/* Adjust Stock Button (Audit / Set Exact Count) */}
                        <button
                          onClick={() => setModal({ adjust: item })}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Set exact count or adjust stock"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </button>

                        {/* History / Ledger */}
                        <button
                          onClick={() => setModal({ history: item })}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Stock Ledger & History"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Edit Definition */}
                        <button
                          onClick={() => setModal({ edit: item })}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit product details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete product "${item.name}" from inventory?`)) {
                              deleteCraftProduct(item.id)
                              showToast(`Deleted product "${item.name}".`)
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      </div>

      {/* Mobile App Touch Cards View */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm shadow-xs">
            <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No craft products found in inventory.
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3 hover:border-gray-200 transition-colors"
            >
              {/* Product Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-primary-700 bg-primary-50 font-medium px-2 py-0.5 rounded-full inline-block">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Unit: {item.unit || 'pcs'}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${item.status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.status.dot}`} />
                  {item.status.label}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Stock</p>
                  <p className={`font-black text-base mt-0.5 ${item.quantityAvailable > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                    {item.quantityAvailable}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Price</p>
                  <p className="font-bold text-xs sm:text-sm text-primary-700 mt-1">
                    {formatCurrency(item.sellingPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Valuation</p>
                  <p className="font-bold text-xs sm:text-sm text-gray-900 mt-1 truncate">
                    {formatCurrency(item.totalRetailValue)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100/80">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => setModal({ restock: item })}
                    className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-2xs"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restock</span>
                  </button>

                  <button
                    onClick={() => setModal({ adjust: item })}
                    className="flex-1 py-2 px-2.5 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
                    <span>Adjust</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setModal({ history: item })}
                    className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Stock Ledger & History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setModal({ edit: item })}
                    className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Edit Product Details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete product "${item.name}" from inventory?`)) {
                        deleteCraftProduct(item.id)
                        showToast(`Deleted product "${item.name}".`)
                      }
                    }}
                    className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <ProductModal
          onClose={() => setModal(null)}
          onSave={(data) => {
            addCraftProduct(data)
            showToast(`Created product "${data.name}" with initial stock of ${data.initialStock} ${data.unit || 'pcs'}!`)
            setModal(null)
          }}
        />
      )}

      {modal?.edit && (
        <ProductModal
          product={modal.edit}
          onClose={() => setModal(null)}
          onSave={(data) => {
            updateCraftProduct(modal.edit.id, data)
            showToast(`Updated details for "${data.name}".`)
            setModal(null)
          }}
        />
      )}

      {modal?.restock && (
        <RestockModal
          product={modal.restock}
          onClose={() => setModal(null)}
          onSave={(data) => {
            restockProduct(data)
            showToast(`Restocked +${data.quantity} ${modal.restock.unit || 'pcs'} of "${modal.restock.name}"!`)
            setModal(null)
          }}
        />
      )}

      {modal?.adjust && (
        <AdjustStockModal
          product={modal.adjust}
          currentStock={modal.adjust.quantityAvailable}
          onClose={() => setModal(null)}
          onSave={(data) => {
            adjustStock(data)
            showToast(`Stock for "${modal.adjust.name}" updated from ${data.previousStock} → ${data.newStock} ${modal.adjust.unit || 'pcs'} (Reason: ${data.reason}).`)
            setModal(null)
          }}
        />
      )}

      {modal?.history && (
        <ProductHistoryModal
          product={modal.history}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
