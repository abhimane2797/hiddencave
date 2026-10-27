import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, Menu as MenuIcon, X, Clock, Gamepad, Users, IndianRupee } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'
import { TimeOverAlert } from '@/components/dashboard/TimeOverAlert'
import { cx } from '@/lib/utils'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
            <TimeOverAlert />
          </div>
        </main>
      </div>

      {/* Mobile overlay: unmounts entirely when closed so nothing blocks clicks */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 left-0 w-[270px] border-r border-white/10 bg-ink-900/95 backdrop-blur-2xl"
          >
            <Sidebar mobileOpen={true} onClose={() => setMobileOpen(false)} />
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}
