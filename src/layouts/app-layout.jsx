import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import AppHeader from '@/layouts/app-header'
import AppSidebar from '@/layouts/app-sidebar'

const MotionButton = motion.button
const MotionDiv = motion.div

export default function AppLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh-radial opacity-80" />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 lg:block">
        <AppSidebar />
      </aside>

      <div className="lg:pl-72">
        <AppHeader onOpenMenu={() => setIsMobileNavOpen(true)} />
        <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {isMobileNavOpen ? (
          <>
            <MotionButton
              aria-label="Close navigation"
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />

            <MotionDiv
              className="fixed inset-y-0 left-0 z-40 w-80 max-w-[88vw] lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="relative h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="absolute right-3 top-3 z-10"
                >
                  <X className="h-5 w-5" />
                </Button>
                <AppSidebar onNavigate={() => setIsMobileNavOpen(false)} />
              </div>
            </MotionDiv>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
