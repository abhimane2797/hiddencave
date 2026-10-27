import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastViewport } from '@/components/ui/Toast'
import { AuthProvider, useAuth } from '@/store/auth'
import { EntryProvider } from '@/store/entries'
import { TimerProvider } from '@/store/timer'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import HomeTab from '@/pages/HomeTab'
import EntriesTab from '@/pages/EntriesTab'
import DayCloseTab from '@/pages/DayCloseTab'
import ReportsTab from '@/pages/ReportsTab'
import LoginPage from '@/pages/LoginPage'

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function DashboardShell() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<HomeTab />} />
        <Route path="/entries" element={<EntriesTab />} />
        <Route path="/day-close" element={<DayCloseTab />} />
        <Route path="/reports" element={<ReportsTab />} />
      </Routes>
      <ToastViewport />
    </DashboardLayout>
  )
}

function LoginGuard() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }
  return <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <EntryProvider>
        <TimerProvider>
          <RouteEffects />
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route element={<DashboardShell />}>
              <Route path="/" element={<HomeTab />} />
              <Route path="/entries" element={<EntriesTab />} />
              <Route path="/day-close" element={<DayCloseTab />} />
              <Route path="/reports" element={<ReportsTab />} />
            </Route>
          </Routes>
        </TimerProvider>
      </EntryProvider>
    </AuthProvider>
  )
}
