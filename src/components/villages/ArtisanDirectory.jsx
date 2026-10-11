import { useState } from 'react'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import { Plus, Pencil, Trash2, Search, Eye, Building2, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'

const MARITAL_STATUS_OPTIONS = ['Married', 'Unmarried / Single', 'Widowed', 'Divorced / Separated']
const CASTE_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'Other']
const EDUCATION_OPTIONS = [
  'No Formal Education',
  'Primary (5th Pass)',
  'Middle (8th Pass)',
  'High School (10th Pass)',
  'Intermediate (12th Pass)',
  'Graduate',
  'Post Graduate / Other'
]
const TRIDENT_OPTIONS = ['No', 'Yes - Factory / Plant', 'Yes - Office / Staff', 'Yes - Other']
const CRAFT_SKILL_OPTIONS = ['Weaving', 'Embroidery', 'Pottery', 'Basket Weaving', 'Block Printing', 'Jewellery Making', 'Other']

// ─── Modal Form: Register / Edit Artisan ──────────────────────────────────────

function ArtisanFormModal({ artisan, villages, defaultVillageId, onClose, onSave }) {
  const fields = artisan?.dynamicFields || {}
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      villageId: artisan?.villageId || defaultVillageId || villages[0]?.id || '',
      firstName: fields.firstName || fields.fullName || '',
      age: fields.age || '',
      maritalStatus: fields.maritalStatus || 'Married',
      caste: fields.caste || 'OBC',
      aadhaarNumber: fields.aadhaarNumber || '',
      education: fields.education || 'High School (10th Pass)',
      tridentRelative: fields.tridentRelative || 'No',
      tridentRelativeDetails: fields.tridentRelativeDetails || '',
      phone: fields.phone || '',
      craftSkill: fields.craftSkill || 'Weaving',
      photo: fields.photo || ''
    }
  })

  const tridentRelativeValue = watch('tridentRelative')
  const photoValue = watch('photo')

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setValue('photo', reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = (data) => {
    onSave({
      villageId: data.villageId,
      isActive: artisan ? artisan.isActive : true,
      dynamicFields: {
        firstName: data.firstName,
        fullName: data.firstName,
        age: Number(data.age) || null,
        maritalStatus: data.maritalStatus,
        caste: data.caste,
        aadhaarNumber: data.aadhaarNumber,
        education: data.education,
        tridentRelative: data.tridentRelative,
        tridentRelativeDetails: data.tridentRelativeDetails,
        phone: data.phone,
        craftSkill: data.craftSkill,
        photo: data.photo
      }
    })
  }

  return (
    <Modal open={true} onClose={onClose} title={artisan ? 'Edit Artisan Profile' : 'Register Woman Artisan'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Village & First Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Village *</label>
            <select
              className="input"
              {...register('villageId', { required: 'Village is required' })}
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.district || 'Village'})</option>
              ))}
            </select>
            {errors.villageId && <p className="text-xs text-red-500 mt-1">{errors.villageId.message}</p>}
          </div>

          <div>
            <label className="label">First Name / Full Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Savitri Devi"
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>
        </div>

        {/* Row 2: Age, Marital Status & Caste */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Age (Years) *</label>
            <input
              type="number"
              min="16"
              max="99"
              className="input"
              placeholder="e.g. 32"
              {...register('age', {
                required: 'Age is required',
                valueAsNumber: true,
                min: { value: 16, message: 'Minimum 16' },
                max: { value: 99, message: 'Valid age' }
              })}
            />
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age.message}</p>}
          </div>

          <div>
            <label className="label">Marital Status *</label>
            <select className="input" {...register('maritalStatus', { required: 'Required' })}>
              {MARITAL_STATUS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Caste / Category *</label>
            <select className="input" {...register('caste', { required: 'Required' })}>
              {CASTE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: Aadhaar Number & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Aadhaar Number</label>
            <input
              type="text"
              className="input"
              placeholder="XXXX-XXXX-XXXX (12 digits)"
              {...register('aadhaarNumber')}
            />
          </div>

          <div>
            <label className="label">Education Level *</label>
            <select className="input" {...register('education')}>
              {EDUCATION_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: Trident Relative question */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-700" />
            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Whether some of their relative work in Trident? *
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <select className="input bg-white" {...register('tridentRelative')}>
                {TRIDENT_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {tridentRelativeValue && tridentRelativeValue !== 'No' && (
              <div>
                <input
                  type="text"
                  className="input bg-white"
                  placeholder="Relative name, relationship & department"
                  {...register('tridentRelativeDetails')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Contact & Craft Skill */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              className="input"
              placeholder="10-digit mobile number"
              {...register('phone')}
            />
          </div>

          <div>
            <label className="label">Primary Craft Skill *</label>
            <select className="input" {...register('craftSkill')}>
              {CRAFT_SKILL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Row 6: Photo Upload */}
        <div>
          <label className="label">Artisan Photo (Optional)</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              className="input py-1.5 flex-1 text-xs"
              onChange={handlePhotoUpload}
            />
            {photoValue && (
              <img
                src={photoValue}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-primary-200 flex-shrink-0"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">
            {artisan ? 'Update Artisan' : 'Save & Register Artisan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Artisan Profile Viewer ────────────────────────────────────────────

function ArtisanProfileModal({ artisan, village, onClose }) {
  const f = artisan.dynamicFields || {}
  const name = f.firstName || f.fullName || 'Artisan'

  return (
    <Modal open={true} onClose={onClose} title="Artisan Profile Card" size="md">
      <div className="space-y-4">
        {/* Header Header Card */}
        <div className="flex items-center gap-4 bg-primary-50/70 border border-primary-100 p-4 rounded-2xl">
          {f.photo ? (
            <img src={f.photo} alt={name} className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-300 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-200 flex items-center justify-center text-3xl flex-shrink-0">
              👩
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-lg text-gray-900 truncate">{name}</h3>
            <p className="text-xs text-primary-700 font-semibold">{village?.name || 'Village'} Village</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">{f.craftSkill || 'Craft'}</Badge>
              <Badge variant={artisan.isActive ? 'success' : 'danger'}>
                {artisan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-gray-400 block font-medium">Age</span>
            <strong className="text-sm text-gray-900">{f.age ? `${f.age} years` : '—'}</strong>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-gray-400 block font-medium">Marital Status</span>
            <strong className="text-sm text-gray-900">{f.maritalStatus || '—'}</strong>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-gray-400 block font-medium">Caste / Category</span>
            <strong className="text-sm text-gray-900">{f.caste || '—'}</strong>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-gray-400 block font-medium">Education</span>
            <strong className="text-sm text-gray-900">{f.education || '—'}</strong>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-gray-400 block font-medium">Aadhaar Number</span>
            <strong className="text-sm text-gray-900">{f.aadhaarNumber || '—'}</strong>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-gray-400 block font-medium">Phone Number</span>
            <strong className="text-sm text-gray-900">{f.phone || '—'}</strong>
          </div>
        </div>

        {/* Trident Relation Card */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
              Relative Working in Trident?
            </span>
          </div>
          <p className="font-bold text-sm text-gray-900">{f.tridentRelative || 'No'}</p>
          {f.tridentRelativeDetails && (
            <p className="text-gray-600 mt-1 italic text-[11px]">{f.tridentRelativeDetails}</p>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Artisan Directory Page ──────────────────────────────────────────────

export default function ArtisanDirectory({ filterVillageId }) {
  const { artisans = [], villages = [], addArtisan, updateArtisan, deleteArtisan } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingArtisan, setEditingArtisan] = useState(null)
  const [profileArtisan, setProfileArtisan] = useState(null)
  const [search, setSearch] = useState('')
  const [villageFilter, setVillageFilter] = useState(filterVillageId || '')

  const filtered = artisans.filter(a => {
    if (villageFilter && a.villageId !== villageFilter) return false
    if (search) {
      const f = a.dynamicFields || {}
      const name = (f.firstName || f.fullName || '').toLowerCase()
      const phone = (f.phone || '').toLowerCase()
      const aadhaar = (f.aadhaarNumber || '').toLowerCase()
      const s = search.toLowerCase()
      if (!name.includes(s) && !phone.includes(s) && !aadhaar.includes(s)) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Women Artisans Directory</h2>
          <p className="text-xs text-gray-400">Total {filtered.length} registered artisans across villages</p>
        </div>
        <Button onClick={() => { setEditingArtisan(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" />
          Register Artisan
        </Button>
      </div>

      {/* Search & Village Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 text-xs"
            placeholder="Search by name, phone, or Aadhaar…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input w-auto text-xs"
          value={villageFilter}
          onChange={e => setVillageFilter(e.target.value)}
        >
          <option value="">All Villages</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      {/* Desktop Artisans Table */}
      <div className="hidden md:block">
        <Table padding="compact">
          <Thead>
            <tr>
              <Th>Artisan Name</Th>
              <Th>Village</Th>
              <Th>Age & Status</Th>
              <Th>Caste</Th>
              <Th>Education</Th>
              <Th>Trident Relative?</Th>
              <Th>Skill</Th>
              <Th>Phone / Aadhaar</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={9} message="No artisans registered matching your filters." />
            ) : (
              filtered.map(a => {
                const f = a.dynamicFields || {}
                const village = villages.find(v => v.id === a.villageId)
                const name = f.firstName || f.fullName || 'Artisan'
                const hasTrident = f.tridentRelative && f.tridentRelative !== 'No'

                return (
                  <Tr key={a.id}>
                    {/* Name + Photo */}
                    <Td>
                      <div className="flex items-center gap-2.5">
                        {f.photo ? (
                          <img src={f.photo} alt={name} className="w-8 h-8 rounded-full object-cover border border-primary-200 flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm flex-shrink-0">
                            👩
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
                          <span className="text-[10px] text-gray-400">Reg: {formatDate(a.createdAt)}</span>
                        </div>
                      </div>
                    </Td>

                    {/* Village */}
                    <Td>
                      <span className="font-medium text-xs text-gray-800">{village?.name || '—'}</span>
                    </Td>

                    {/* Age & Marital Status */}
                    <Td>
                      <div className="text-xs">
                        <span className="font-bold text-gray-900">{f.age ? `${f.age} yrs` : '—'}</span>
                        <p className="text-[10px] text-gray-400">{f.maritalStatus || '—'}</p>
                      </div>
                    </Td>

                    {/* Caste */}
                    <Td>
                      <Badge variant="secondary">{f.caste || '—'}</Badge>
                    </Td>

                    {/* Education */}
                    <Td>
                      <span className="text-xs text-gray-700 font-medium">{f.education || '—'}</span>
                    </Td>

                    {/* Trident Relative */}
                    <Td>
                      {hasTrident ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" title={f.tridentRelativeDetails || f.tridentRelative}>
                          <Building2 className="w-3 h-3" />
                          {f.tridentRelative}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No</span>
                      )}
                    </Td>

                    {/* Skill */}
                    <Td>
                      <Badge variant="primary">{f.craftSkill || 'Craft'}</Badge>
                    </Td>

                    {/* Phone / Aadhaar */}
                    <Td>
                      <div className="text-xs">
                        <p className="font-semibold text-gray-800">{f.phone || '—'}</p>
                        {f.aadhaarNumber && (
                          <p className="text-[10px] text-gray-400 font-mono">{f.aadhaarNumber}</p>
                        )}
                      </div>
                    </Td>

                    {/* Actions */}
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setProfileArtisan(a)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingArtisan(a)
                            setModalOpen(true)
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove artisan ${name}?`)) deleteArtisan(a.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Artisan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>
      </div>

      {/* Mobile App Touch Cards View */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm shadow-xs">
            <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No artisans registered matching your filters.
          </div>
        ) : (
          filtered.map(a => {
            const f = a.dynamicFields || {}
            const village = villages.find(v => v.id === a.villageId)
            const name = f.firstName || f.fullName || 'Artisan'
            const hasTrident = f.tridentRelative && f.tridentRelative !== 'No'

            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {f.photo ? (
                      <img src={f.photo} alt={name} className="w-11 h-11 rounded-full object-cover border border-primary-200 flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-lg flex-shrink-0">
                        👩
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-snug">{name}</h4>
                      <p className="text-xs text-primary-700 font-medium mt-0.5">📍 {village?.name || 'Village'}</p>
                    </div>
                  </div>

                  <Badge variant="primary">{f.craftSkill || 'Craft'}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Age & Status</span>
                    <span className="font-bold text-gray-800">{f.age ? `${f.age} yrs` : '—'} • {f.maritalStatus || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Caste & Education</span>
                    <span className="font-bold text-gray-800">{f.caste || '—'} • {f.education || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Phone</span>
                    <span className="font-bold text-gray-800">{f.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Trident Relative</span>
                    <span className={`font-bold ${hasTrident ? 'text-amber-800' : 'text-gray-500'}`}>
                      {hasTrident ? f.tridentRelative : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setProfileArtisan(a)}
                    className="flex-1 rounded-xl text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Button>

                  <button
                    onClick={() => {
                      setEditingArtisan(a)
                      setModalOpen(true)
                    }}
                    className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Edit Details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove artisan ${name}?`)) deleteArtisan(a.id)
                    }}
                    className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    title="Delete Artisan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal: Register / Edit Artisan */}
      {modalOpen && (
        <ArtisanFormModal
          artisan={editingArtisan}
          villages={villages}
          defaultVillageId={villageFilter}
          onClose={() => {
            setModalOpen(false)
            setEditingArtisan(null)
          }}
          onSave={(data) => {
            if (editingArtisan) {
              updateArtisan(editingArtisan.id, data)
            } else {
              addArtisan(data)
            }
            setModalOpen(false)
            setEditingArtisan(null)
          }}
        />
      )}

      {/* Modal: Profile Viewer */}
      {profileArtisan && (
        <ArtisanProfileModal
          artisan={profileArtisan}
          village={villages.find(v => v.id === profileArtisan.villageId)}
          onClose={() => setProfileArtisan(null)}
        />
      )}
    </div>
  )
}
