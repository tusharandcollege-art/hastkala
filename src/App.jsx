import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import VillagesArtisans from '@/pages/VillagesArtisans'
import SupplyProduction from '@/pages/SupplyProduction'
import InventoryPage from '@/pages/InventoryPage'
import SalesPage from '@/pages/SalesPage'
import Analytics from '@/pages/Analytics'
import LoginPage from '@/pages/LoginPage'
import { AuthProvider, useAuth } from '@/context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/villages"  element={<VillagesArtisans />} />
            <Route path="/supply"    element={<SupplyProduction />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/sales"     element={<SalesPage />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
