import { motion } from 'framer-motion'

const MotionP = motion.p

export default function FormError({ message }) {
  if (!message) {
    return null
  }

  return (
    <MotionP
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="mt-1 text-xs font-medium text-rose-300"
    >
      {message}
    </MotionP>
  )
}
