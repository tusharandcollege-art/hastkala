import { useState } from 'react'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import {
  Plus, Pencil, Trash2, Package, History, ArrowDownToLine,
  CheckCircle2, PlusCircle, Calendar, FileText
} from 'lucide-react'
import { formatDate, formatCurrency, today } from '@/lib/utils'
import { useForm } from 'react-hook-form'

const UNITS = ['kg', 'meters', 'liters', 'rolls', 'pieces', 'bundles', 'bags', 'boxes']

// ─── Modal to Receive a New Shipment for an Existing Material ──────────────────

function ReceiveMaterialShipmentModal({ material, onClose, onConfirm }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      quantity: '',
      unitCost: material.unitCost || '',
      receivedDate: today(),
      notes: ''
    }
  })

  const qty = Number(watch('quantity')) || 0
  const cost = Number(watch('unitCost')) || 0
  const totalBatchValue = qty * cost
  const newTotalQty = (Number(material.quantity) || 0) + qty

  const onSubmit = (data) => {
    onConfirm({
      rawMaterialId: material.id,
      quantity: Number(data.quantity),
      unitCost: Number(data.unitCost),
      date: data.receivedDate,
      notes: data.notes
    })
  }

  return (
    <Modal open={true} onClose={onClose} title="Receive New Shipment" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Material Summary Card */}
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">Raw Material</span>
            <Badge variant="primary">{material.unit}</Badge>
          </div>
          <p className="font-bold text-base text-gray-900">{material.name}</p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary-200/50 text-xs">
            <div>
              <span className="text-gray-500">Current Total Received:</span>
              <p className="font-bold text-gray-900 text-sm">
                {material.quantity} {material.unit}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Latest Unit Cost:</span>
              <p className="font-bold text-gray-900 text-sm">
                {formatCurrency(material.unitCost)} / {material.unit}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Shipment Quantity ({material.unit}) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              placeholder={`e.g. 200`}
              {...register('quantity', {
                required: 'Quantity is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be > 0' }
              })}
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="label">Unit Cost for this Shipment (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              placeholder={`₹${material.unitCost}`}
              {...register('unitCost', {
                required: 'Unit cost is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be > 0' }
              })}
            />
            {errors.unitCost && <p className="text-xs text-red-500 mt-1">{errors.unitCost.message}</p>}
          </div>

          <div>
            <label className="label">Date Received</label>
            <input type="date" className="input" {...register('receivedDate')} />
          </div>

          <div>
            <label className="label">Batch Valuation</label>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-primary-700">
              {formatCurrency(totalBatchValue)}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Shipment Story / Supplier / Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="e.g. Invoice #B-104 from Calcutta Jute Mills, 2nd batch for festive season"
              {...register('notes')}
            />
          </div>
        </div>

        {qty > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between text-xs text-green-900">
            <span>Updated Cumulative Stock:</span>
            <span className="font-bold text-sm text-green-700">
              {material.quantity} + {qty} = {newTotalQty} {material.unit}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit">
            <PlusCircle className="w-4 h-4" /> Add +{qty || 0} {material.unit} to Balance
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal for Shipment History / Passbook ────────────────────────────────────

function MaterialHistoryModal({ material, shipments, dispatches, onClose, onOpenReceive }) {
  const matShipments = shipments
    .filter(s => s.rawMaterialId === material.id)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  const matDispatches = dispatches
    .filter(d => d.rawMaterialId === material.id)
    .reduce((s, d) => s + d.quantityDispatched, 0)

  const balance = (Number(material.quantity) || 0) - matDispatches

  return (
    <Modal open={true} onClose={onClose} title={`Shipment Passbook — ${material.name}`} size="lg">
      <div className="space-y-4">
        {/* Passbook Header Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Total Received</p>
            <p className="text-base font-black text-gray-900">{material.quantity} {material.unit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Dispatched</p>
            <p className="text-base font-black text-amber-700">{matDispatches} {material.unit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-base font-black text-green-700">{balance} {material.unit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Unit Cost</p>
            <p className="text-base font-black text-primary-700">{formatCurrency(material.unitCost)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <History className="w-4 h-4 text-primary-500" />
            Transaction & Shipment History ({matShipments.length} batches)
          </h3>
          <Button
            size="sm"
            onClick={() => {
              onClose()
              onOpenReceive(material)
            }}
          >
            <Plus className="w-3.5 h-3.5" /> + Receive New Shipment
          </Button>
        </div>

        {/* Ledger Table */}
        <Table>
          <Thead>
            <tr>
              <Th>Date</Th>
              <Th>Batch Qty</Th>
              <Th>Unit Cost</Th>
              <Th>Total Value</Th>
              <Th>Story / Supplier Notes</Th>
            </tr>
          </Thead>
          <Tbody>
            {matShipments.length === 0 && (
              <EmptyRow cols={5} message="No shipment transaction history recorded" />
            )}
            {matShipments.map((s, idx) => (
              <Tr key={s.id || idx}>
                <Td className="whitespace-nowrap font-medium text-gray-700">
                  {formatDate(s.date || s.createdAt)}
                </Td>
                <Td>
                  <span className="font-bold text-green-700">
                    +{s.quantity} {material.unit}
                  </span>
                </Td>
                <Td>{formatCurrency(s.unitCost)}</Td>
                <Td className="font-semibold">{formatCurrency(s.totalCost || s.quantity * s.unitCost)}</Td>
                <Td className="text-xs text-gray-600 max-w-xs">
                  {s.notes || <span className="text-gray-400 italic">No notes</span>}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Modal for Creating Brand New Material ────────────────────────────────────

function MaterialForm({ defaultValues, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Material Name *</label>
          <input className="input" placeholder="e.g. Copper Wire, Jute Fabric" {...register('name', { required: 'Required' })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Unit of Measurement *</label>
          <select className="input" {...register('unit', { required: 'Required' })}>
            <option value="">Select unit…</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit.message}</p>}
        </div>
        <div>
          <label className="label">Initial Quantity Received *</label>
          <input type="number" step="0.01" min="0" className="input"
            {...register('quantity', { required: 'Required', min: 0, valueAsNumber: true })} />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="label">Unit Cost (₹) *</label>
          <input type="number" step="0.01" min="0" className="input"
            {...register('unitCost', { required: 'Required', min: 0, valueAsNumber: true })} />
          {errors.unitCost && <p className="text-xs text-red-500 mt-1">{errors.unitCost.message}</p>}
        </div>
        <div>
          <label className="label">Received Date</label>
          <input type="date" defaultValue={today()} className="input" {...register('receivedDate')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Initial Batch Story / Supplier Notes</label>
          <textarea className="input resize-none" rows={2} placeholder="e.g. Initial stock intake from central warehouse" {...register('notes')} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">Save Material & Record Initial Batch</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// ─── Main RawMaterials Component ──────────────────────────────────────────────

export default function RawMaterials() {
  const {
    rawMaterials, materialShipments, dispatches,
    addRawMaterial, receiveMaterialShipment, updateRawMaterial, deleteRawMaterial
  } = useStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [receivingMaterial, setReceivingMaterial] = useState(null)
  const [historyMaterial, setHistoryMaterial] = useState(null)
  const [toast, setToast] = useState('')

  const handleCreateOrUpdate = (data) => {
    if (editing) {
      updateRawMaterial(editing.id, data)
      setToast('Raw material updated!')
    } else {
      addRawMaterial(data)
      setToast('New raw material added with initial shipment batch!')
    }
    setModalOpen(false)
    setEditing(null)
    setTimeout(() => setToast(''), 3500)
  }

  const handleReceiveShipment = (shipmentData) => {
    receiveMaterialShipment(shipmentData)
    setReceivingMaterial(null)
    setToast('New shipment received! Stock balance and transaction history updated.')
    setTimeout(() => setToast(''), 3500)
  }

  const totalValue = rawMaterials.reduce((s, m) => s + m.quantity * m.unitCost, 0)

  return (
    <div className="space-y-4">
      <div className="section-header flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Raw Materials (Central Intake)</h2>
          <p className="text-xs text-gray-400">
            {rawMaterials.length} materials · Total inventory valuation: {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4" /> Add New Material
          </Button>
        </div>
      </div>

      {toast && (
        <Alert type="success" onClose={() => setToast('')} className="animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 inline mr-1" />
          {toast}
        </Alert>
      )}

      <Table>
        <Thead>
          <tr>
            <Th>Material</Th>
            <Th>Unit</Th>
            <Th>Total Received</Th>
            <Th>Dispatched</Th>
            <Th>Stock Balance</Th>
            <Th>Avg Unit Cost</Th>
            <Th>Total Value</Th>
            <Th>Shipments</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {rawMaterials.length === 0 && <EmptyRow cols={9} message="No raw materials added yet" />}
          {rawMaterials.map(m => {
            const dispatched = dispatches.filter(d => d.rawMaterialId === m.id).reduce((s,d) => s + d.quantityDispatched, 0)
            const balance = m.quantity - dispatched
            const lowBal = balance <= m.quantity * 0.2
            const shipmentCount = (materialShipments || []).filter(s => s.rawMaterialId === m.id).length

            return (
              <Tr key={m.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg flex-shrink-0">
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      {m.notes && <p className="text-xs text-gray-400 truncate max-w-32">{m.notes}</p>}
                    </div>
                  </div>
                </Td>
                <Td>{m.unit}</Td>
                <Td className="font-semibold text-gray-800">{m.quantity} {m.unit}</Td>
                <Td className="text-amber-700">{dispatched} {m.unit}</Td>
                <Td>
                  <Badge variant={lowBal && balance > 0 ? 'warning' : balance <= 0 ? 'danger' : 'success'}>
                    {balance} {m.unit}
                  </Badge>
                </Td>
                <Td>{formatCurrency(m.unitCost)}/{m.unit}</Td>
                <Td className="font-bold text-gray-900">{formatCurrency(m.quantity * m.unitCost)}</Td>
                <Td>
                  {/* History Passbook Link */}
                  <button
                    onClick={() => setHistoryMaterial(m)}
                    className="inline-flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900 font-semibold bg-primary-50 px-2 py-0.5 rounded-md hover:bg-primary-100 transition-colors"
                    title="View shipment ledger"
                  >
                    <History className="w-3 h-3" />
                    <span>{shipmentCount || 1} batch{shipmentCount !== 1 ? 'es' : ''}</span>
                  </button>
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* + Receive Shipment Button */}
                    <button
                      onClick={() => setReceivingMaterial(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                      title="Receive another shipment of this material"
                    >
                      <ArrowDownToLine className="w-3 h-3" />
                      <span>+ Receive</span>
                    </button>

                    {/* Edit */}
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      onClick={() => { setEditing(m); setModalOpen(true) }}
                      title="Edit Material"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      onClick={() => { if (confirm(`Delete ${m.name}?`)) deleteRawMaterial(m.id) }}
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>

      {/* Add / Edit Material Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Raw Material' : 'Add New Raw Material'}>
        <MaterialForm defaultValues={editing || {}} onSubmit={handleCreateOrUpdate}
          onCancel={() => { setModalOpen(false); setEditing(null) }} />
      </Modal>

      {/* Receive Shipment Modal */}
      {receivingMaterial && (
        <ReceiveMaterialShipmentModal
          material={receivingMaterial}
          onClose={() => setReceivingMaterial(null)}
          onConfirm={handleReceiveShipment}
        />
      )}

      {/* History Ledger Modal */}
      {historyMaterial && (
        <MaterialHistoryModal
          material={historyMaterial}
          shipments={materialShipments || []}
          dispatches={dispatches || []}
          onClose={() => setHistoryMaterial(null)}
          onOpenReceive={(mat) => setReceivingMaterial(mat)}
        />
      )}
    </div>
  )
}
