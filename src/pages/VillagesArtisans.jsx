import { useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import VillageList from '@/components/villages/VillageList'
import ArtisanDirectory from '@/components/villages/ArtisanDirectory'

const TABS = [
  { id: 'villages',  label: 'Villages',          icon: MapPin },
  { id: 'artisans',  label: 'Artisans Directory', icon: Users },
]

export default function VillagesArtisans() {
  const [tab, setTab] = useState('villages')
  const [selectedVillage, setSelectedVillage] = useState(null)

  const handleSelectVillage = (v) => {
    setSelectedVillage(v)
    setTab('artisans')
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'villages' && <VillageList onSelectVillage={handleSelectVillage} />}
      {tab === 'artisans' && <ArtisanDirectory filterVillageId={selectedVillage?.id} />}
    </div>
  )
}
