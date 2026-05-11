import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@multiplayer-app/session-recorder-react'
import { ToastProvider } from './context/ToastContext'
import AutoCreatedSessionModal from './components/AutoCreatedSessionModal'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ToastProvider>
        <AutoCreatedSessionModal />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to='/dashboard' replace />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='users' element={<Users />} />
              <Route path='orders' element={<Orders />} />
              <Route path='analytics' element={<Analytics />} />
              <Route path='settings' element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
