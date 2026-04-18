import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useNavigationRecorder } from '@multiplayer-app/session-recorder-react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

/**
 * Invisible component that reports React Router navigation events
 * to the Multiplayer session recorder. Must live inside <BrowserRouter>
 * so it can access the router context via useLocation.
 */
function NavigationRecorder() {
  const { pathname } = useLocation()
  useNavigationRecorder(pathname)
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      {/* NavigationRecorder must be inside BrowserRouter to access router context */}
      <NavigationRecorder />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
