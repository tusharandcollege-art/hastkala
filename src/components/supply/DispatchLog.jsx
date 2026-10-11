import { useState } from 'react'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import {
  Plus, Trash2, ArrowRight, Filter, Search, PlusCircle,
  PackagePlus, CheckCircle2, History, X
} from 'lucide-react'
import { formatDate, today } from '@/lib/utils'
import { useForm } from 'react-hook-form'

// ─── Modal to Add Additional Quantity to an Existing Dispatch ─────────────────

function AddQuantityModal({ dispatch, onClose, onConfirm }) {
  const { rawMaterials, getRawMaterialBalance } = useStore()
  const mat = rawMaterials.find(m => m.id === dispatch.rawMaterialId)
  const availableBal = mat ? getRawMaterialBalance(mat.id) : 0

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { additionalQty: '', note: '' }
  })

  const additionalQty = Number(watch('additionalQty')) || 0
  const newTotal = (Number(dispatch.quantityDispatched) || 0) + additionalQty

  const onSubmit = (data) => {
    onConfirm(dispatch.id, Number(data.additionalQty), data.note?.trim())
  }

  return (
    <Modal open={true} onClose={onClose} title="Add More Quantity to Dispatch" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Context Card */}
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-800 uppercase tracking-wider">Existing Dispatch</span>
            <Badge variant="primary">{dispatch.village?.name || 'Village'}</Badge>
          </div>
          <div className="text-sm text-gray-800">
            <p className="font-bold text-base text-gray-900">{dispatch.material?.name || 'Material'}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Recipient: <span className="font-medium text-gray-800">{dispatch.artisan?.dynamicFields?.fullName || 'Village General'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary-200/50 text-xs">
            <div>
              <span className="text-gray-500">Current Dispatched:</span>
              <p className="font-bold text-gray-900 text-sm">
                {dispatch.quantityDispatched} {dispatch.material?.unit}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Plant Stock Available:</span>
              <p className={`font-bold text-sm ${availableBal > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {availableBal} {dispatch.material?.unit}
              </p>
            </div>
          </div>
        </div>

        {availableBal <= 0 ? (
          <Alert type="danger">
            Plant stock has 0 {dispatch.material?.unit} remaining. You cannot dispatch additional quantity of this material.
          </Alert>
        ) : (
          <>
            <div>
              <label className="label">Additional Quantity to Add *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={availableBal}
                  placeholder={`Max ${availableBal} ${dispatch.material?.unit}`}
                  className="input pr-16"
                  {...register('additionalQty', {
                    required: 'Please enter additional quantity',
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Quantity must be greater than 0' },
                    max: { value: availableBal, message: `Cannot exceed plant available stock (${availableBal} ${dispatch.material?.unit})` }
                  })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                  {dispatch.material?.unit}
                </span>
              </div>
              {errors.additionalQty && (
                <p className="text-xs text-red-500 mt-1">{errors.additionalQty.message}</p>
              )}
            </div>

            {additionalQty > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between text-xs text-green-900">
                <span>New Dispatched Total:</span>
                <span className="font-bold text-sm text-green-700">
                  {dispatch.quantityDispatched} + {additionalQty} = {newTotal} {dispatch.material?.unit}
                </span>
              </div>
            )}

            <div>
              <label className="label">Note / Batch Remark (optional)</label>
              <input
                className="input text-sm"
                placeholder="e.g. 2nd batch dispatched for festive orders"
                {...register('note')}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit">
                <PlusCircle className="w-4 h-4" /> Add +{additionalQty || 0} {dispatch.material?.unit || ''}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}

// ─── New Dispatch Form (with auto-detect existing dispatch) ───────────────────

function DispatchForm({ onSubmit, onCancel }) {
  const { rawMaterials, villages, artisans, dispatches, getRawMaterialBalance } = useStore()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { date: today(), mergeWithExisting: true }
  })

  const selectedMatId = watch('rawMaterialId')
  const selectedVillageId = watch('villageId')
  const selectedArtisanId = watch('artisanId') || null
  const balance = selectedMatId ? getRawMaterialBalance(selectedMatId) : 0
  const mat = rawMaterials.find(m => m.id === selectedMatId)
  const villageArtisans = selectedVillageId ? artisans.filter(a => a.villageId === selectedVillageId && a.isActive) : []

  // Check if a dispatch for this material and village already exists
  const existingDispatch = selectedMatId && selectedVillageId
    ? dispatches.find(d =>
        d.rawMaterialId === selectedMatId &&
        d.villageId === selectedVillageId &&
        (selectedArtisanId ? d.artisanId === selectedArtisanId : !d.artisanId)
      )
    : null

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      artisanId: data.artisanId || null,
      existingDispatchId: existingDispatch && data.mergeWithExisting ? existingDispatch.id : null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Raw Material *</label>
          <select className="input" {...register('rawMaterialId', { required: 'Required' })}>
            <option value="">Select material…</option>
            {rawMaterials.map(m => {
              const bal = getRawMaterialBalance(m.id)
              return (
                <option key={m.id} value={m.id} disabled={bal <= 0}>
                  {m.name} ({bal} {m.unit} available)
                </option>
              )
            })}
          </select>
          {errors.rawMaterialId && <p className="text-xs text-red-500 mt-1">{errors.rawMaterialId.message}</p>}
          {selectedMatId && mat && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              Available in plant stock: {balance} {mat.unit}
            </p>
          )}
        </div>

        <div>
          <label className="label">Destination Village *</label>
          <select className="input" {...register('villageId', { required: 'Required' })}>
            <option value="">Select village…</option>
            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          {errors.villageId && <p className="text-xs text-red-500 mt-1">{errors.villageId.message}</p>}
        </div>

        <div>
          <label className="label">Specific Artisan (optional)</label>
          <select className="input" {...register('artisanId')}>
            <option value="">All / Village General</option>
            {villageArtisans.map(a => (
              <option key={a.id} value={a.id}>{a.dynamicFields?.fullName || 'Artisan'}</option>
            ))}
          </select>
        </div>

        {/* Existing dispatch prompt */}
        {existingDispatch && (
          <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <p className="font-semibold mb-1">
              ⚡ Existing dispatch found for {mat?.name} → {villages.find(v => v.id === selectedVillageId)?.name}:
            </p>
            <p className="text-amber-800 mb-2">
              Currently dispatched: <strong>{existingDispatch.quantityDispatched} {mat?.unit}</strong>
            </p>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-950">
                <input
                  type="radio"
                  name="mergeChoice"
                  value="true"
                  defaultChecked
                  onChange={() => setValue('mergeWithExisting', true)}
                />
                Add to existing dispatch (+ combine quantity)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-950">
                <input
                  type="radio"
                  name="mergeChoice"
                  value="false"
                  onChange={() => setValue('mergeWithExisting', false)}
                />
                Create separate entry
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="label">Quantity to Dispatch *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={balance}
            className="input"
            {...register('quantityDispatched', {
              required: 'Required',
              valueAsNumber: true,
              min: 0.01,
              max: { value: balance, message: `Cannot exceed available balance (${balance} ${mat?.unit || ''})` }
            })}
          />
          {errors.quantityDispatched && <p className="text-xs text-red-500 mt-1">{errors.quantityDispatched.message}</p>}
        </div>

        <div>
          <label className="label">Date</label>
          <input type="date" className="input" {...register('date')} />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Notes / Remarks</label>
          <textarea className="input resize-none" rows={2} placeholder="Optional notes for this dispatch" {...register('notes')} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">Dispatch Material</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// ─── Dispatch History Helper & Modal ───────────────────────────────────────────

function getDispatchHistoryEntries(dispatch) {
  if (Array.isArray(dispatch?.history) && dispatch.history.length > 0) {
    return dispatch.history
  }
  const notesStr = dispatch?.notes || ''
  if (!notesStr) {
    return [{
      quantity: dispatch?.quantityDispatched || 0,
      date: dispatch?.date || (dispatch?.createdAt ? dispatch.createdAt.slice(0, 10) : today()),
      notes: 'Initial dispatch intake'
    }]
  }

  const parts = notesStr.split(' | ')
  return parts.map((part, idx) => {
    const match = part.match(/\(\+(\d+(\.\d+)?)(?: on ([^:]+))?:\s*(.+)\)/)
    if (match) {
      return {
        quantity: Number(match[1]),
        date: match[3] || dispatch?.date || today(),
        notes: match[4] || 'Additional batch added'
      }
    }
    return {
      quantity: idx === 0 ? Number(dispatch?.quantityDispatched) || 0 : 0,
      date: dispatch?.date || today(),
      notes: part
    }
  })
}

function DispatchHistoryModal({ dispatch, onAddMore, onClose }) {
  const entries = getDispatchHistoryEntries(dispatch)
  const total = Number(dispatch.quantityDispatched) || 0
  const unit = dispatch.material?.unit || 'units'

  return (
    <Modal open={true} onClose={onClose} title="Dispatch History & Remarks" size="md">
      <div className="space-y-4">
        {/* Context Card */}
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
              {dispatch.material?.name || 'Raw Material'}
            </span>
            <Badge variant="primary">🏡 {dispatch.village?.name || 'Village'}</Badge>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-gray-600">
              Recipient: <strong className="text-gray-900">{dispatch.artisan?.dynamicFields?.fullName || 'Village General'}</strong>
            </span>
            <span className="text-sm font-extrabold text-primary-900">
              Total Dispatched: {total} {unit}
            </span>
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {entries.map((entry, idx) => (
            <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  {idx === 0 ? 'Batch #1 (Initial Dispatch)' : `Top-up #${idx + 1}`}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {formatDate(entry.date)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-600 italic">"{entry.notes || 'No remarks recorded'}"</p>
                {entry.quantity > 0 && (
                  <Badge variant={idx === 0 ? 'secondary' : 'success'} className="font-bold flex-shrink-0">
                    {idx === 0 ? '' : '+'}{entry.quantity} {unit}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button
            size="sm"
            onClick={() => {
              onClose()
              onAddMore(dispatch)
            }}
            className="rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" /> Add More Qty
          </Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main DispatchLog Component ───────────────────────────────────────────────

export default function DispatchLog() {
  const {
    dispatches, rawMaterials, villages, artisans,
    addDispatch, addQuantityToDispatch, deleteDispatch
  } = useStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [topUpDispatch, setTopUpDispatch] = useState(null)
  const [historyDispatch, setHistoryDispatch] = useState(null)
  const [villageFilter, setVillageFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Handle new dispatch or merge
  const handleSubmit = (data) => {
    if (data.existingDispatchId) {
      addQuantityToDispatch(
        data.existingDispatchId,
        data.quantityDispatched,
        data.notes || 'Additional quantity added'
      )
      setToastMessage('Additional quantity added to existing dispatch!')
    } else {
      addDispatch({
        rawMaterialId: data.rawMaterialId,
        villageId: data.villageId,
        artisanId: data.artisanId,
        quantityDispatched: data.quantityDispatched,
        date: data.date,
        notes: data.notes,
      })
      setToastMessage('New dispatch recorded successfully!')
    }
    setModalOpen(false)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Handle adding more quantity directly to an existing dispatch
  const handleTopUpConfirm = (dispatchId, additionalQty, note) => {
    addQuantityToDispatch(dispatchId, additionalQty, note)
    setTopUpDispatch(null)
    setToastMessage(`Added +${additionalQty} to dispatch successfully!`)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Enriched dispatches
  const enriched = dispatches
    .map(d => ({
      ...d,
      material: rawMaterials.find(m => m.id === d.rawMaterialId),
      village:  villages.find(v => v.id === d.villageId),
      artisan:  artisans.find(a => a.id === d.artisanId),
    }))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))

  // Filtered dispatches
  const filtered = enriched.filter(d => {
    // 1. Village filter
    if (villageFilter && d.villageId !== villageFilter) return false

    // 2. Material filter
    if (materialFilter && d.rawMaterialId !== materialFilter) return false

    // 3. Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const matName = d.material?.name?.toLowerCase() || ''
      const vilName = d.village?.name?.toLowerCase() || ''
      const artName = d.artisan?.dynamicFields?.fullName?.toLowerCase() || ''
      const notes   = d.notes?.toLowerCase() || ''
      if (!matName.includes(q) && !vilName.includes(q) && !artName.includes(q) && !notes.includes(q)) {
        return false
      }
    }
    return true
  })

  // Total quantity dispatched across currently filtered view
  const activeVillageObj = villages.find(v => v.id === villageFilter)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="section-header flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dispatch Log</h2>
          <p className="text-xs text-gray-400">
            Raw materials sent from plant to villages & artisans · {dispatches.length} total entries
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Dispatch
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <Alert type="success" onClose={() => setToastMessage('')} className="animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 inline mr-1" />
          {toastMessage}
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Village Filter */}
          <div className="flex items-center gap-2 min-w-48 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <select
              value={villageFilter}
              onChange={e => setVillageFilter(e.target.value)}
              className="input text-xs font-medium py-2"
            >
              <option value="">🏡 All Villages ({villages.length})</option>
              {villages.map(v => {
                const count = dispatches.filter(d => d.villageId === v.id).length
                return (
                  <option key={v.id} value={v.id}>
                    {v.name} ({count} dispatch{count !== 1 ? 'es' : ''})
                  </option>
                )
              })}
            </select>
          </div>

          {/* Material Filter */}
          <div className="min-w-44 flex-1 sm:flex-initial">
            <select
              value={materialFilter}
              onChange={e => setMaterialFilter(e.target.value)}
              className="input text-xs font-medium py-2"
            >
              <option value="">📦 All Raw Materials</option>
              {rawMaterials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              className="input text-xs pl-8 py-2"
              placeholder="Search by material, village, artisan..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters */}
          {(villageFilter || materialFilter || searchTerm) && (
            <button
              onClick={() => {
                setVillageFilter('')
                setMaterialFilter('')
                setSearchTerm('')
              }}
              className="text-xs text-primary-600 hover:text-primary-800 font-semibold underline px-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter status strip */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-50">
          <div>
            Showing <strong className="text-gray-900">{filtered.length}</strong> of{' '}
            <strong className="text-gray-900">{dispatches.length}</strong> dispatches
            {activeVillageObj && (
              <span className="ml-1 text-primary-700 font-medium">
                • Filtered for <strong>{activeVillageObj.name}</strong>
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            Tip: Click <strong>"+ Add Qty"</strong> to add more quantity to an existing dispatch entry.
          </span>
        </div>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <tr>
            <Th>Material</Th>
            <Th></Th>
            <Th>Destination</Th>
            <Th>Artisan</Th>
            <Th>Dispatched Qty</Th>
            <Th>Date</Th>
            <Th>Notes / History</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && (
            <EmptyRow
              cols={8}
              message={
                villageFilter || materialFilter || searchTerm
                  ? 'No dispatches match the selected filters'
                  : 'No dispatches recorded yet'
              }
            />
          )}
          {filtered.map(d => (
            <Tr key={d.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-xs text-primary-700 font-bold flex-shrink-0">
                    📦
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{d.material?.name || '—'}</span>
                    <p className="text-[10px] text-gray-400">{d.material?.unit}</p>
                  </div>
                </div>
              </Td>

              <Td>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
              </Td>

              <Td>
                <span className="inline-flex items-center gap-1 font-semibold text-primary-800 bg-primary-50/80 px-2 py-0.5 rounded-md text-xs border border-primary-200/50">
                  🏡 {d.village?.name || '—'}
                </span>
              </Td>

              <Td>
                {d.artisan?.dynamicFields?.fullName ? (
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    👩 {d.artisan.dynamicFields.fullName}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Village General</span>
                )}
              </Td>

              <Td>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-gray-900 text-sm">
                    {d.quantityDispatched}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {d.material?.unit || ''}
                  </span>
                </div>
              </Td>

              <Td>{formatDate(d.date || d.createdAt)}</Td>

              <Td>
                <div className="flex flex-col items-start gap-1">
                  <button
                    onClick={() => setHistoryDispatch(d)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-800 border border-gray-200 hover:border-primary-300 transition-all cursor-pointer shadow-2xs group"
                    title="Click to view history timeline and notes"
                  >
                    <History className="w-3.5 h-3.5 text-primary-600 group-hover:rotate-[-45deg] transition-transform" />
                    <span>History ({getDispatchHistoryEntries(d).length})</span>
                  </button>
                  {d.notes && (
                    <p
                      onClick={() => setHistoryDispatch(d)}
                      className="text-[11px] text-gray-400 hover:text-gray-600 truncate max-w-44 cursor-pointer"
                      title="Click to view full notes"
                    >
                      {d.notes}
                    </p>
                  )}
                </div>
              </Td>

              <Td className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {/* + Add More Quantity Button */}
                  <button
                    onClick={() => setTopUpDispatch(d)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                    title={`Add more ${d.material?.name || 'items'} to this dispatch`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Qty</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => {
                      if (confirm(`Delete dispatch of ${d.quantityDispatched} ${d.material?.unit || ''} to ${d.village?.name || 'village'}?`)) {
                        deleteDispatch(d.id)
                      }
                    }}
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* New Dispatch Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Dispatch Raw Material" size="md">
        <DispatchForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Add Additional Quantity Modal */}
      {topUpDispatch && (
        <AddQuantityModal
          dispatch={topUpDispatch}
          onClose={() => setTopUpDispatch(null)}
          onConfirm={handleTopUpConfirm}
        />
      )}

      {/* Dispatch History & Remarks Modal */}
      {historyDispatch && (
        <DispatchHistoryModal
          dispatch={historyDispatch}
          onAddMore={(disp) => setTopUpDispatch(disp)}
          onClose={() => setHistoryDispatch(null)}
        />
      )}
    </div>
  )
}
