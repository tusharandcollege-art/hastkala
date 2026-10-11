import { useState } from 'react'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { MapPin, Plus, Pencil, Trash2, Users, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'

function VillageForm({ defaultValues, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Village Name *</label>
          <input className="input" placeholder="e.g. Rampur" {...register('name', { required: 'Required' })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">District</label>
          <input className="input" placeholder="e.g. Barabanki" {...register('district')} />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" placeholder="e.g. Uttar Pradesh" {...register('state')} />
        </div>
        <div>
          <label className="label">Contact Person</label>
          <input className="input" placeholder="Sarpanch name" {...register('contactPerson')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Phone</label>
          <input className="input" placeholder="10-digit mobile number" {...register('phone')} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">Save Village</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function VillageList({ onSelectVillage }) {
  const { villages, artisans, addVillage, updateVillage, deleteVillage } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSubmit = (data) => {
    if (editing) updateVillage(editing.id, data)
    else addVillage(data)
    setModalOpen(false); setEditing(null)
  }

  const handleDelete = (v) => {
    const artisanCount = artisans.filter(a => a.villageId === v.id).length
    if (artisanCount > 0) { setConfirmDelete(v) } else { deleteVillage(v.id) }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Villages</h2>
          <p className="text-xs text-gray-400">{villages.length} villages in the program</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Add Village
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {villages.map(v => {
          const count = artisans.filter(a => a.villageId === v.id && a.isActive).length
          return (
            <Card key={v.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectVillage(v)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-50 rounded-xl">
                    <MapPin className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{v.name}</h3>
                    <p className="text-xs text-gray-400">{v.district}{v.state ? `, ${v.state}` : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    onClick={() => { setEditing(v); setModalOpen(true) }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                    onClick={() => handleDelete(v)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="primary">
                  <Users className="w-3 h-3 mr-1" />{count} artisan{count !== 1 ? 's' : ''}
                </Badge>
                {v.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone className="w-3 h-3" />{v.phone}
                  </span>
                )}
              </div>
              {v.contactPerson && <p className="text-xs text-gray-400 mt-2">📋 {v.contactPerson}</p>}
            </Card>
          )
        })}

        {villages.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No villages added yet.</p>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Village' : 'Add Village'}>
        <VillageForm defaultValues={editing || {}} onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null) }} />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Village?" size="sm">
        <Alert type="warning">
          <strong>{confirmDelete?.name}</strong> has artisans registered under it. Deleting the village will not delete artisans — they will become village-less. Continue?
        </Alert>
        <div className="flex gap-2 mt-4">
          <Button variant="danger" onClick={() => { deleteVillage(confirmDelete.id); setConfirmDelete(null) }}>
            Delete Anyway
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}
