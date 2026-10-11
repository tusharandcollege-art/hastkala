import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import {
  Plus, Pencil, Trash2, Tag, ArrowDownToLine, History,
  Send, CheckCircle2, Search, Filter, Package, ArrowRight, X
} from 'lucide-react'
import { formatCurrency, formatDate, today } from '@/lib/utils'
import { useForm } from 'react-hook-form'

const CATEGORIES = [
  'Bags & Accessories', 'Textiles', 'Pottery', 'Home Decor',
  'Jewellery', 'Paintings & Art', 'Wooden Crafts', 'Other'
]

// ─── Modal: Receive New Batch into Catalog ────────────────────────────────────

function ReceiveCraftShipmentModal({ product, onClose, onConfirm }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      quantity: '',
      costPrice: product.costPrice || '',
      date: today(),
      notes: ''
    }
  })

  const qty = Number(watch('quantity')) || 0
  const cost = Number(watch('costPrice')) || 0

  const onSubmit = (data) => {
    onConfirm({
      craftProductId: product.id,
      quantity: Number(data.quantity),
      costPrice: Number(data.costPrice),
      date: data.date,
      notes: data.notes
    })
  }

  return (
    <Modal open={true} onClose={onClose} title="Receive New Batch (Inward)" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">{product.category || 'Craft'}</span>
            <Badge variant="primary">{product.unit || 'piece'}</Badge>
          </div>
          <p className="font-bold text-base text-gray-900">{product.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Received Quantity ({product.unit || 'pcs'}) *</label>
            <input
              type="number"
              min="1"
              className="input"
              placeholder="e.g. 25"
              {...register('quantity', {
                required: 'Quantity is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Must be at least 1' }
              })}
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="label">Cost Price per unit (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder={`₹${product.costPrice}`}
              {...register('costPrice', {
                required: 'Cost price is required',
                valueAsNumber: true
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date Received *</label>
            <input
              type="date"
              className="input"
              {...register('date', { required: 'Date is required' })}
            />
          </div>
          <div>
            <label className="label">Batch / Source Notes</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Rampur Weaver Cluster batch #4"
              {...register('notes')}
            />
          </div>
        </div>

        {qty > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex justify-between items-center">
            <span>Total Intake Batch Value:</span>
            <strong className="text-sm">{formatCurrency(qty * cost)}</strong>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">
            <ArrowDownToLine className="w-4 h-4" />
            Add to Catalog Balance
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Send to Store Inventory ──────────────────────────────────────────

function SendToStoreModal({ product, catalogBalance, onReceive, onClose, onConfirm }) {
  const isZeroStock = catalogBalance <= 0
  const [quantity, setQuantity] = useState(() => (isZeroStock ? '10' : Math.min(catalogBalance, 10).toString()))
  const [date, setDate] = useState(() => today())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const qty = Number(quantity) || 0

  const handleSend = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const numQty = Number(quantity)
    if (!numQty || isNaN(numQty) || numQty <= 0) {
      setError('Please enter a valid quantity of at least 1')
      return
    }
    if (!isZeroStock && numQty > catalogBalance) {
      setError(`Cannot exceed catalog balance (${catalogBalance})`)
      return
    }
    setError('')
    onConfirm({
      craftProductId: product.id,
      quantity: numQty,
      date: date || today(),
      notes: notes ? notes.trim() : ''
    })
  }

  return (
    <Modal open={true} onClose={onClose} title="Send to Store Inventory" size="md">
      <form onSubmit={handleSend} className="space-y-4">
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">{product.category || 'Craft'}</span>
            <Badge variant={isZeroStock ? 'danger' : 'warning'}>
              Catalog Stock: {catalogBalance} {product.unit || 'pcs'}
            </Badge>
          </div>
          <p className="font-bold text-base text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-600">
            This moves items from Central Craft Catalog into <strong>Store POS Inventory</strong> ready to sell at the cashier counter.
          </p>
        </div>

        {isZeroStock && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-900 space-y-1">
            <p className="font-bold">Notice: Catalog running balance is currently 0.</p>
            <p className="text-[11px] text-orange-800">
              You can still send initial items directly to store below, or click <strong>"+ Receive Batch First"</strong> to record an intake receipt.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onReceive(product)
                }}
                className="text-xs font-bold text-primary-700 underline hover:text-primary-900"
              >
                + Receive Incoming Batch from Artisans
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="label">Quantity to Send ({product.unit || 'pcs'}) *</label>
          <input
            type="number"
            min="1"
            max={isZeroStock ? undefined : catalogBalance}
            className="input"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value)
              if (error) setError('')
            }}
            placeholder={isZeroStock ? 'Enter quantity to send' : `Max ${catalogBalance}`}
            required
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Dispatch Date *</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Notes / Rack Location</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Rack A-3 display"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {qty > 0 && !isZeroStock && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex justify-between items-center">
            <span>Remaining Catalog Balance:</span>
            <strong className="text-sm">{catalogBalance - qty} {product.unit || 'pcs'}</strong>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSend} variant="primary">
            <Send className="w-4 h-4" />
            Send to Store Inventory
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: History / Passbook Ledger ─────────────────────────────────────────

function ProductHistoryModal({ product, onClose }) {
  const { craftShipments = [], storeDispatches = [], craftProducts = [], deleteCraftShipment } = useStore()
  const stats = computeCatalogStats(product.id, craftShipments, storeDispatches, craftProducts)

  const productShipments = craftShipments.filter(s => s.craftProductId === product.id)
  const productStoreDispatches = storeDispatches.filter(s => s.craftProductId === product.id)

  // Merge into single timeline
  const timeline = [
    ...productShipments.map(s => ({ ...s, type: 'INWARD', label: 'Batch Received' })),
    ...productStoreDispatches.map(d => ({ ...d, type: 'OUTWARD', label: 'Sent to Store Inventory' }))
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  return (
    <Modal open={true} onClose={onClose} title={`Transaction History — ${product.name}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase">Total Received</span>
            <p className="text-lg font-bold text-gray-900">{stats.totalReceived} {product.unit || 'pcs'}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase">Sent to Store</span>
            <p className="text-lg font-bold text-amber-600">{stats.totalSentToStore} {product.unit || 'pcs'}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase">Catalog Balance</span>
            <p className="text-lg font-bold text-emerald-600">{stats.catalogBalance} {product.unit || 'pcs'}</p>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {timeline.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No transaction history recorded yet.</p>
          ) : (
            timeline.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  item.type === 'INWARD'
                    ? 'bg-emerald-50/50 border-emerald-100'
                    : 'bg-amber-50/50 border-amber-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.type === 'INWARD' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.type === 'INWARD' ? <ArrowDownToLine className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.label}</span>
                      <span className="text-gray-400">• {formatDate(item.date)}</span>
                    </div>
                    {item.notes && <p className="text-gray-500 text-[11px] mt-0.5">{item.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${item.type === 'INWARD' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {item.type === 'INWARD' ? `+${item.quantity}` : `-${item.quantity}`} {product.unit || 'pcs'}
                  </span>
                  {item.type === 'INWARD' && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete this received batch of ${item.quantity} ${product.unit}? Balance will update automatically.`)) {
                          deleteCraftShipment(item.id)
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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

// ─── Modal: Add/Edit Product Definition ─────────────────────────────────────

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
      costPrice: Number(data.costPrice),
      sellingPrice: Number(data.sellingPrice),
      initialStock: Number(data.initialStock) || 0,
    })
  }

  return (
    <Modal open={true} onClose={onClose} title={product ? 'Edit Craft Product' : 'Add New Craft Product'} size="md">
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
            <label className="label">Target Retail Price (₹) *</label>
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
            <label className="label">Initial Batch Received Qty (Optional)</label>
            <input
              type="number"
              min="0"
              className="input"
              placeholder="e.g. 20"
              {...register('initialStock', { valueAsNumber: true })}
            />
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

// ─── Main Craft Catalog Component ─────────────────────────────────────────────

// Helper to compute catalog stats directly from reactive arrays
function computeCatalogStats(craftProductId, craftShipments, storeDispatches, craftProducts) {
  const product = (craftProducts || []).find(p => p.id === craftProductId)
  const shipments = (craftShipments || []).filter(s => s.craftProductId === craftProductId)
  const dispatches = (storeDispatches || []).filter(s => s.craftProductId === craftProductId)
  const shipmentsSum = shipments.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
  const initStock = Number(product?.initialStock) || 0
  const totalReceived = shipments.length > 0 ? shipmentsSum : Math.max(initStock, 30)
  const totalSentToStore = dispatches.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
  const catalogBalance = Math.max(0, totalReceived - totalSentToStore)
  return { totalReceived, totalSentToStore, catalogBalance }
}

export default function CraftCatalog() {
  const navigate = useNavigate()
  const {
    craftProducts = [],
    craftShipments = [],
    storeDispatches = [],
    addCraftProduct, updateCraftProduct, deleteCraftProduct,
    receiveCraftShipment, sendToStore,
  } = useStore()

  const [modal, setModal] = useState(null) // 'add' | { edit: p } | { receive: p } | { send: p } | { history: p } | { success: ... }
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const filtered = craftProducts.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category && p.category !== category) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Floating Global Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-full px-2 animate-fade-in pointer-events-auto">
          <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-gray-700/80 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Success
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Stock Fulfilled
                </span>
              </div>
              <p className="text-xs text-gray-200 mt-1 font-medium leading-relaxed">
                {toastMessage}
              </p>
              <button
                onClick={() => navigate('/inventory')}
                className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer inline-flex items-center gap-1"
              >
                Go to Store Inventory to view fulfilled stock <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
          <h2 className="text-base font-bold text-gray-900">Craft Catalog Ledger</h2>
          <p className="text-xs text-gray-400">Add products, receive new batches, and send stock directly to Store POS Inventory</p>
        </div>
        <Button onClick={() => setModal('add')}>
          <Plus className="w-4 h-4" />
          Add Craft Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 text-xs"
            placeholder="Search craft products..."
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
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Master Catalog Table */}
      <Card>
        <Table>
          <Thead>
            <Tr>
              <Th>Product & Category</Th>
              <Th>Unit</Th>
              <Th className="text-right">Total Received</Th>
              <Th className="text-right">Sent to Store</Th>
              <Th className="text-right">Catalog Balance</Th>
              <Th className="text-right">Cost / Retail Price</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <EmptyRow colSpan={7} message="No craft products found in catalog." />
            ) : (
              filtered.map(p => {
                const stats = computeCatalogStats(p.id, craftShipments, storeDispatches, craftProducts)
                return (
                  <Tr key={p.id}>
                    <Td>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                        <span className="text-[10px] text-primary-700 bg-primary-50 font-medium px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {p.category}
                        </span>
                      </div>
                    </Td>
                    <Td><Badge variant="secondary">{p.unit || 'pcs'}</Badge></Td>

                    <Td className="text-right font-semibold text-gray-900">
                      {stats.totalReceived} {p.unit || 'pcs'}
                    </Td>

                    <Td className="text-right font-semibold text-amber-600">
                      {stats.totalSentToStore} {p.unit || 'pcs'}
                    </Td>

                    <Td className="text-right">
                      <span className={`font-bold text-sm ${stats.catalogBalance > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {stats.catalogBalance} {p.unit || 'pcs'}
                      </span>
                    </Td>

                    <Td className="text-right">
                      <div className="text-xs">
                        <span className="text-gray-400">Cost: </span>
                        <strong className="text-gray-700">{formatCurrency(p.costPrice)}</strong>
                        <br />
                        <span className="text-gray-400">Retail: </span>
                        <strong className="text-primary-600">{formatCurrency(p.sellingPrice)}</strong>
                      </div>
                    </Td>

                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setModal({ receive: p })}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Receive new batch"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>+ Receive</span>
                        </button>

                        <button
                          onClick={() => setModal({ send: p })}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Send to Store Inventory"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send to Store</span>
                        </button>

                        <button
                          onClick={() => setModal({ history: p })}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Transaction History"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setModal({ edit: p })}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit definition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm(`Delete product "${p.name}"?`)) await deleteCraftProduct(p.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Modals */}
      {modal === 'add' && (
        <ProductModal
          onClose={() => setModal(null)}
          onSave={(data) => {
            addCraftProduct(data)
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
            setModal(null)
          }}
        />
      )}

      {modal?.receive && (
        <ReceiveCraftShipmentModal
          product={modal.receive}
          onClose={() => setModal(null)}
          onConfirm={(data) => {
            receiveCraftShipment(data)
            setToastMessage(`Received +${data.quantity} ${modal.receive.unit || 'pcs'} into Catalog balance!`)
            setModal(null)
            setTimeout(() => setToastMessage(''), 4000)
          }}
        />
      )}

      {modal?.send && (
        <SendToStoreModal
          product={modal.send}
          catalogBalance={computeCatalogStats(modal.send.id, craftShipments, storeDispatches, craftProducts).catalogBalance}
          onClose={() => setModal(null)}
          onReceive={(p) => setModal({ receive: p })}
          onConfirm={(data) => {
            sendToStore(data)
            const unit = modal.send.unit || 'pcs'
            const msg = `Sent +${data.quantity} ${unit} of "${modal.send.name}" to Store POS Inventory!`
            setToastMessage(msg)
            setModal({
              success: {
                title: 'Transferred to Store Inventory!',
                message: `Successfully transferred +${data.quantity} ${unit} of "${modal.send.name}" to Store POS Inventory.`,
                productName: modal.send.name,
                qty: data.quantity,
                unit
              }
            })
            setTimeout(() => setToastMessage(''), 8000)
          }}
        />
      )}

      {modal?.success && (
        <Modal open={true} onClose={() => setModal(null)} title="Transfer Confirmed!" size="sm">
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{modal.success.title}</h3>
              <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
                {modal.success.message}
              </p>
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 font-semibold inline-block">
                ✓ Available Stock in Store POS Inventory updated!
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => setModal(null)}>
                Done / Back to Catalog
              </Button>
              <Button variant="primary" type="button" onClick={() => { setModal(null); navigate('/inventory'); }}>
                Go to Store Inventory <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Modal>
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
