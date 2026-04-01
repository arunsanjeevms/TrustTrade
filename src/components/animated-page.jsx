import { motion } from 'framer-motion'
import { usePageTransition } from '@/hooks/use-page-transition'
import { cn } from '@/lib/utils'

const MotionSection = motion.section

export default function AnimatedPage({ className, children }) {
  const transitionConfig = usePageTransition()

  return (
    <MotionSection
      initial={transitionConfig.initial}
      animate={transitionConfig.animate}
      exit={transitionConfig.exit}
      transition={transitionConfig.transition}
      className={cn('space-y-6', className)}
    >
      {children}
    </MotionSection>
  )
}
