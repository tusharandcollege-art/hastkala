import { useState } from 'react'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import { Plus, Pencil, Trash2, Search, UserCheck, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'

const FIELD_TYPE_LABELS = {
  text: 'Text', number: 'Number', date: 'Date',
  select: 'Dropdown', photo: 'Photo', textarea: 'Long Text'
}

function DynamicArtisanForm({ schema, defaultValues = {}, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: defaultValues.dynamicFields || {}
  })

  const handlePhotoChange = (fieldKey, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setValue(fieldKey, reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit(data => onSubmit({ dynamicFields: data }))} className="space-y-4">
      {schema.map(field => (
        <div key={field.id}>
          <label className="label">{field.label}{field.required && ' *'}</label>
          {field.type === 'text' && (
            <input className="input" {...register(field.fieldKey, { required: field.required ? 'Required' : false })} />
          )}
          {field.type === 'number' && (
            <input type="number" className="input" {...register(field.fieldKey, { required: field.required ? 'Required' : false })} />
          )}
          {field.type === 'date' && (
            <input type="date" className="input" {...register(field.fieldKey, { required: field.required ? 'Required' : false })} />
          )}
          {field.type === 'textarea' && (
            <textarea rows={3} className="input resize-none" {...register(field.fieldKey)} />
          )}
          {field.type === 'select' && (
            <select className="input" {...register(field.fieldKey, { required: field.required ? 'Required' : false })}>
              <option value="">Select…</option>
              {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {field.type === 'photo' && (
            <div className="space-y-2">
              <input type="file" accept="image/*" className="input py-1.5" onChange={e => handlePhotoChange(field.fieldKey, e)} />
              {watch(field.fieldKey) && (
                <img src={watch(field.fieldKey)} alt="Preview" className="w-20 h-20 rounded-xl object-cover border" />
              )}
            </div>
          )}
          {errors[field.fieldKey] && <p className="text-xs text-red-500 mt-1">{errors[field.fieldKey].message}</p>}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Button type="submit">Save Artisan</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

function ArtisanProfile({ artisan, schema, onClose }) {
  const fields = artisan.dynamicFields || {}
  const photoField = schema.find(f => f.type === 'photo')
  const photo = photoField ? fields[photoField.fieldKey] : null
  const nameField = schema.find(f => f.fieldKey === 'fullName')
  const name = nameField ? fields[nameField.fieldKey] : 'Artisan'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {photo ? (
          <img src={photo} alt={name} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-200" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl">👩</div>
        )}
        <div>
          <h3 className="font-bold text-xl text-gray-900">{name}</h3>
          <p className="text-sm text-gray-400">Registered: {formatDate(artisan.createdAt)}</p>
          <Badge variant={artisan.isActive ? 'success' : 'danger'} className="mt-1">
            {artisan.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
      <div className="divider" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {schema.filter(f => f.type !== 'photo').map(f => {
          const val = fields[f.fieldKey]
          if (!val) return null
          return (
            <div key={f.id} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium mb-1">{f.label}</p>
              <p className="text-sm text-gray-800 font-semibold break-words">{val}</p>
            </div>
          )
        })}
      </div>
      <Button variant="secondary" onClick={onClose} className="w-full">Close</Button>
    </div>
  )
}

export default function ArtisanDirectory({ filterVillageId }) {
  const { artisans, villages, artisanFormSchema, addArtisan, updateArtisan, deleteArtisan } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(null)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [villageFilter, setVillageFilter] = useState(filterVillageId || '')

  const filtered = artisans.filter(a => {
    if (villageFilter && a.villageId !== villageFilter) return false
    if (search) {
      const name = (a.dynamicFields?.fullName || '').toLowerCase()
      if (!name.includes(search.toLowerCase())) return false
    }
    return true
  })

  const handleSubmit = (data) => {
    const payload = { ...data, villageId: villageFilter || (villages[0]?.id || ''), isActive: true }
    if (editing) updateArtisan(editing.id, payload)
    else addArtisan(payload)
    setModalOpen(false); setEditing(null)
  }

  return (
    <div>
      <div className="section-header flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Artisans Directory</h2>
          <p className="text-xs text-gray-400">{filtered.length} artisans found</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Register Artisan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto min-w-40"
          value={villageFilter}
          onChange={e => setVillageFilter(e.target.value)}
        >
          <option value="">All Villages</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Artisan</Th>
            <Th>Village</Th>
            <Th>Craft Skill</Th>
            <Th>Phone</Th>
            <Th>Status</Th>
            <Th>Registered</Th>
            <Th></Th>
          </tr>
        </Thead>
        <Tbody>
          {filtered.length === 0 && <EmptyRow cols={7} message="No artisans found" />}
          {filtered.map(a => {
            const f = a.dynamicFields || {}
            const village = villages.find(v => v.id === a.villageId)
            const photoField = artisanFormSchema.find(s => s.type === 'photo')
            const photo = photoField ? f[photoField.fieldKey] : null
            return (
              <Tr key={a.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    {photo ? (
                      <img src={photo} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-sm flex-shrink-0">👩</div>
                    )}
                    <span className="font-medium text-gray-900">{f.fullName || '—'}</span>
                  </div>
                </Td>
                <Td>{village?.name || '—'}</Td>
                <Td>{f.craftSkill || '—'}</Td>
                <Td>{f.phone || '—'}</Td>
                <Td>
                  <Badge variant={a.isActive ? 'success' : 'danger'}>
                    {a.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>{formatDate(a.createdAt)}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button className="btn-ghost p-1.5" onClick={() => setProfileOpen(a)} title="View Profile">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="btn-ghost p-1.5" onClick={() => { setEditing(a); setModalOpen(true) }} title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      onClick={() => { if (confirm(`Remove ${f.fullName}?`)) deleteArtisan(a.id) }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>

      {/* Register / Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Artisan' : 'Register Artisan'} size="lg">
        {!villageFilter && !editing && (
          <div className="mb-4">
            <label className="label">Village *</label>
            <select className="input" id="villageSelect">
              {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        )}
        <DynamicArtisanForm
          schema={artisanFormSchema.sort((a,b) => a.order - b.order)}
          defaultValues={editing || {}}
          onSubmit={(data) => {
            const villageId = editing?.villageId || villageFilter ||
              (document.getElementById('villageSelect')?.value || villages[0]?.id)
            handleSubmit({ ...data, villageId })
          }}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
        />
      </Modal>

      {/* Profile Modal */}
      <Modal open={!!profileOpen} onClose={() => setProfileOpen(null)} title="Artisan Profile" size="md">
        {profileOpen && (
          <ArtisanProfile artisan={profileOpen} schema={artisanFormSchema} onClose={() => setProfileOpen(null)} />
        )}
      </Modal>
    </div>
  )
}
