import { useState } from 'react'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { slugify } from '@/lib/utils'
import {
  Plus, Trash2, GripVertical, Pencil, Save, ChevronUp, ChevronDown
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

const FIELD_TYPES = [
  { value: 'text',     label: '📝 Text' },
  { value: 'number',   label: '🔢 Number' },
  { value: 'date',     label: '📅 Date' },
  { value: 'select',   label: '📋 Dropdown' },
  { value: 'photo',    label: '📷 Photo' },
  { value: 'textarea', label: '📄 Long Text' },
]

function FieldEditor({ field, onSave, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      label: field.label,
      type: field.type,
      required: field.required,
      options: (field.options || []).join('\n'),
    }
  })
  const type = watch('type')

  return (
    <form onSubmit={handleSubmit(data => onSave({
      ...field,
      label: data.label,
      fieldKey: field.fieldKey || slugify(data.label),
      type: data.type,
      required: data.required,
      options: data.type === 'select' ? data.options.split('\n').map(o=>o.trim()).filter(Boolean) : undefined,
    }))} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-primary-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Field Label *</label>
          <input className="input text-sm" placeholder="e.g. Aadhaar Number"
            {...register('label', { required: 'Required' })} />
          {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label.message}</p>}
        </div>
        <div>
          <label className="label text-xs">Field Type *</label>
          <select className="input text-sm" {...register('type', { required: true })}>
            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      {type === 'select' && (
        <div>
          <label className="label text-xs">Options (one per line)</label>
          <textarea className="input resize-none text-sm" rows={4}
            placeholder={"Option 1\nOption 2\nOption 3"} {...register('options')} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input type="checkbox" id={`req-${field.id}`} className="rounded" {...register('required')} />
        <label htmlFor={`req-${field.id}`} className="text-sm text-gray-700">Required field</label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm"><Save className="w-3 h-3" /> Save</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function FormBuilder() {
  const { artisanFormSchema, setArtisanFormSchema } = useStore()
  const [schema, setSchema] = useState([...artisanFormSchema].sort((a,b) => a.order - b.order))
  const [editingId, setEditingId] = useState(null)
  const [saved, setSaved] = useState(false)

  const addField = () => {
    const newField = {
      id: uuidv4(), label: 'New Field', fieldKey: `field_${Date.now()}`,
      type: 'text', required: false, order: schema.length
    }
    setSchema(s => [...s, newField])
    setEditingId(newField.id)
  }

  const moveField = (idx, dir) => {
    const s = [...schema]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= s.length) return;
    [s[idx], s[swapIdx]] = [s[swapIdx], s[idx]]
    s.forEach((f, i) => { f.order = i })
    setSchema(s)
  }

  const removeField = (id) => {
    setSchema(s => s.filter(f => f.id !== id).map((f, i) => ({ ...f, order: i })))
  }

  const saveField = (updated) => {
    setSchema(s => s.map(f => f.id === updated.id ? updated : f))
    setEditingId(null)
  }

  const saveSchema = () => {
    setArtisanFormSchema(schema)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const typeColors = {
    text:'default', number:'info', date:'primary', select:'earth', photo:'warning', textarea:'success'
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Artisan Registration Form Builder</h2>
          <p className="text-xs text-gray-400">Define what information to collect from artisans. Drag to reorder.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={addField}><Plus className="w-4 h-4" /> Add Field</Button>
          <Button onClick={saveSchema}><Save className="w-4 h-4" /> Save Schema</Button>
        </div>
      </div>

      {saved && (
        <Alert type="success" className="mb-4">Form schema saved successfully! All new artisan registrations will use this schema.</Alert>
      )}

      <Alert type="info" className="mb-4">
        <strong>Admin Control:</strong> Add, remove, or reorder fields. Changes affect all future artisan registrations. Existing artisan data is preserved.
      </Alert>

      <div className="space-y-2">
        {schema.map((field, idx) => (
          <div key={field.id}>
            {editingId === field.id ? (
              <FieldEditor field={field} onSave={saveField} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3.5 group hover:border-gray-200 transition-colors">
                <div className="flex flex-col gap-0.5 text-gray-300">
                  <button onClick={() => moveField(idx, -1)} className="hover:text-gray-600 disabled:opacity-20" disabled={idx === 0}>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <GripVertical className="w-4 h-4" />
                  <button onClick={() => moveField(idx, 1)} className="hover:text-gray-600 disabled:opacity-20" disabled={idx === schema.length - 1}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{field.label}</span>
                    {field.required && <Badge variant="danger" className="text-[10px] px-1.5 py-0">Required</Badge>}
                    <Badge variant={typeColors[field.type] || 'default'} className="text-[10px] px-1.5 py-0">
                      {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">key: {field.fieldKey}</p>
                  {field.type === 'select' && field.options?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{field.options.join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                    onClick={() => setEditingId(field.id)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                    onClick={() => removeField(field.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {schema.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No fields defined. Click "Add Field" to start building the form.</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button onClick={saveSchema}><Save className="w-4 h-4" /> Save Schema ({schema.length} fields)</Button>
      </div>
    </div>
  )
}
