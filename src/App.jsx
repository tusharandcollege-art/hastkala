import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import VillagesArtisans from '@/pages/VillagesArtisans'
import SupplyProduction from '@/pages/SupplyProduction'
import InventoryPage from '@/pages/InventoryPage'
import SalesPage from '@/pages/SalesPage'
import Analytics from '@/pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/villages"  element={<VillagesArtisans />} />
          <Route path="/supply"    element={<SupplyProduction />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales"     element={<SalesPage />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
