
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, QrCode, Upload, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const MotionDiv = motion.div

const SCAN_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  SUCCESS: 'success',
  ERROR: 'error',
}

const scanLineVariants = {
  scanning: {
    y: [0, 240],
    transition: {
      y: {
        duration: 1.6,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },
  idle: { y: 0 },
  success: { y: 120, opacity: 0 },
  error: { y: 0, opacity: 0 },
}

export default function QrScanPage() {
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE)
  const [manualCode, setManualCode] = useState('')
  const [inputMode, setInputMode] = useState(false)
  const fileInputRef = useRef(null)

  // Simulate scanning process
  const startScan = () => {
    setScanState(SCAN_STATES.SCANNING)
    setTimeout(() => {
      // Randomly succeed or error for demo
      if (Math.random() > 0.2) setScanState(SCAN_STATES.SUCCESS)
      else setScanState(SCAN_STATES.ERROR)
    }, 1800)
  }

  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setScanState(SCAN_STATES.SCANNING)
      setTimeout(() => setScanState(SCAN_STATES.SUCCESS), 1200)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    setScanState(SCAN_STATES.SCANNING)
    setTimeout(() => {
      if (manualCode.trim().length > 3) setScanState(SCAN_STATES.SUCCESS)
      else setScanState(SCAN_STATES.ERROR)
    }, 1200)
  }

  const reset = () => {
    setScanState(SCAN_STATES.IDLE)
    setManualCode('')
    setInputMode(false)
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="QR Scan"
        subtitle="Scan QR codes to verify participants or join secure rooms."
      />
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-300" />
            QR Scanner
          </CardTitle>
          <CardDescription>Camera, upload, or manual code input. Animated, stateful, and real-feeling.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative mx-auto h-80 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 flex items-center justify-center">
            {/* Scanner frame with animated glow */}
            <MotionDiv
              className="relative h-60 w-60 rounded-2xl border-4 border-indigo-400/60 shadow-[0_0_32px_8px_rgba(99,102,241,0.25)] bg-slate-900/80 flex items-center justify-center"
              animate={scanState === SCAN_STATES.SCANNING ? { boxShadow: '0 0 48px 12px #6366f1aa' } : { boxShadow: '0 0 32px 8px #6366f144' }}
              transition={{ duration: 0.6 }}
            >
              {/* Animated scan line */}
              <MotionDiv
                className="absolute left-4 right-4 top-8 h-1.5 rounded-full bg-gradient-to-r from-transparent via-indigo-300 to-transparent shadow-[0_0_18px_rgba(129,140,248,0.8)]"
                variants={scanLineVariants}
                initial="idle"
                animate={scanState}
              />

              {/* Scanner content by state */}
              <AnimatePresence mode="wait">
                {scanState === SCAN_STATES.IDLE && (
                  <MotionDiv
                    key="idle"
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="text-slate-400 text-sm">Ready to scan</span>
                  </MotionDiv>
                )}
                {scanState === SCAN_STATES.SCANNING && (
                  <MotionDiv
                    key="scanning"
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="text-indigo-200 text-sm animate-pulse">Scanning...</span>
                  </MotionDiv>
                )}
                {scanState === SCAN_STATES.SUCCESS && (
                  <MotionDiv
                    key="success"
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
                    <span className="text-emerald-200 font-semibold">Scan Successful!</span>
                    <Button size="sm" variant="secondary" onClick={reset} className="mt-2">Scan Another</Button>
                  </MotionDiv>
                )}
                {scanState === SCAN_STATES.ERROR && (
                  <MotionDiv
                    key="error"
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <AlertCircle className="h-10 w-10 text-red-400 animate-shake" />
                    <span className="text-red-200 font-semibold">Scan Failed</span>
                    <Button size="sm" variant="secondary" onClick={reset} className="mt-2">Try Again</Button>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </MotionDiv>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={startScan} disabled={scanState === SCAN_STATES.SCANNING}>
              <Camera className="h-4 w-4" />
              Start Camera
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={scanState === SCAN_STATES.SCANNING}
            >
              <Upload className="h-4 w-4" />
              Upload QR Image
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={scanState === SCAN_STATES.SCANNING}
              />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setInputMode((v) => !v)}
              disabled={scanState === SCAN_STATES.SCANNING}
            >
              <Keyboard className="h-4 w-4" />
              Manual Code
            </Button>
          </div>

          {/* Manual input */}
          <AnimatePresence>
            {inputMode && (
              <MotionDiv
                key="manual-input"
                className="mx-auto w-full max-w-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    placeholder="Enter code manually"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    disabled={scanState === SCAN_STATES.SCANNING}
                  />
                  <Button type="submit" disabled={scanState === SCAN_STATES.SCANNING || !manualCode.trim()}>
                    Submit
                  </Button>
                </form>
              </MotionDiv>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
