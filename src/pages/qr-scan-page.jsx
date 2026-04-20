
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QrScanner from 'qr-scanner'
import qrWorkerPath from 'qr-scanner/qr-scanner-worker.min?url'
import { QRCodeCanvas } from 'qrcode.react'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Keyboard,
  QrCode,
  Upload,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { normalizeScannedPayload, toShareableQrValue } from '@/lib/qr'

QrScanner.WORKER_PATH = qrWorkerPath

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('scan')
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE)
  const [manualCode, setManualCode] = useState('')
  const [inputMode, setInputMode] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const [scanError, setScanError] = useState('')
  const [copiedScan, setCopiedScan] = useState(false)
  const [qrInput, setQrInput] = useState('u_trader007')
  const [copiedQrValue, setCopiedQrValue] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const hasDecodedRef = useRef(false)
  const qrPreviewRef = useRef(null)

  const appOrigin = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin
    }

    return 'http://localhost:5173'
  }, [])

  const qrValue = useMemo(() => toShareableQrValue(qrInput, appOrigin), [qrInput, appOrigin])
  const parsedScan = useMemo(() => normalizeScannedPayload(scanResult), [scanResult])

  useEffect(() => {
    if (activeTab !== 'scan' && scanState === SCAN_STATES.SCANNING && scannerRef.current) {
      scannerRef.current.stop().catch(() => undefined)
      setScanState(SCAN_STATES.IDLE)
    }
  }, [activeTab, scanState])

  useEffect(() => {
    return () => {
      if (!scannerRef.current) {
        return
      }

      scannerRef.current.stop().catch(() => undefined)
      scannerRef.current.destroy()
      scannerRef.current = null
    }
  }, [])

  const readDecodedText = (result) => {
    if (typeof result === 'string') {
      return result
    }

    return result?.data || ''
  }

  const stopCameraScan = async () => {
    if (!scannerRef.current) {
      return
    }

    try {
      await scannerRef.current.stop()
    } catch {
      // Camera can already be stopped; ignore noisy stop errors.
    }
  }

  const applyDecodedResult = async (decodedText) => {
    const normalized = String(decodedText || '').trim()
    if (!normalized || hasDecodedRef.current) {
      return
    }

    hasDecodedRef.current = true
    setCopiedScan(false)
    setScanError('')
    setScanResult(normalized)
    setScanState(SCAN_STATES.SUCCESS)
    await stopCameraScan()
  }

  const startCameraScan = async () => {
    setScanError('')
    setScanResult('')
    setCopiedScan(false)
    hasDecodedRef.current = false

    try {
      if (!videoRef.current) {
        throw new Error('Camera preview is not ready yet.')
      }

      if (!scannerRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            const decodedText = readDecodedText(result)
            applyDecodedResult(decodedText)
          },
          {
            preferredCamera: 'environment',
            maxScansPerSecond: 8,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          },
        )
      }

      await scannerRef.current.start()
      setScanState(SCAN_STATES.SCANNING)
    } catch {
      setScanState(SCAN_STATES.ERROR)
      setScanError('Unable to start camera scan. Allow camera permission and use HTTPS or localhost.')
    }
  }

  const toggleCameraScan = async () => {
    if (scanState === SCAN_STATES.SCANNING) {
      await stopCameraScan()
      setScanState(SCAN_STATES.IDLE)
      return
    }

    await startCameraScan()
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await stopCameraScan()
    hasDecodedRef.current = false
    setScanError('')
    setScanResult('')
    setCopiedScan(false)
    setScanState(SCAN_STATES.SCANNING)

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      })
      await applyDecodedResult(readDecodedText(result))
    } catch {
      setScanState(SCAN_STATES.ERROR)
      setScanError('No readable QR code was found in the uploaded image.')
    } finally {
      event.target.value = ''
    }
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    if (!manualCode.trim()) {
      return
    }

    await stopCameraScan()
    hasDecodedRef.current = false
    setScanError('')
    setScanResult('')
    setCopiedScan(false)
    setScanState(SCAN_STATES.SCANNING)
    await applyDecodedResult(manualCode.trim())
  }

  const reset = async () => {
    await stopCameraScan()
    hasDecodedRef.current = false
    setScanState(SCAN_STATES.IDLE)
    setScanResult('')
    setScanError('')
    setCopiedScan(false)
    setManualCode('')
    setInputMode(false)
  }

  const useScanForJoin = () => {
    if (!scanResult) {
      return
    }

    navigate(`/join-trade?invite=${encodeURIComponent(scanResult)}`)
  }

  const openScannedUrl = () => {
    if (!parsedScan.isUrl || typeof window === 'undefined') {
      return
    }

    window.open(parsedScan.raw, '_blank', 'noopener,noreferrer')
  }

  const copyScannedPayload = async () => {
    if (!scanResult || !navigator?.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(scanResult)
      setCopiedScan(true)
    } catch {
      setScanError('Failed to copy the decoded value.')
    }
  }

  const copyGeneratedPayload = async () => {
    if (!qrValue || !navigator?.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(qrValue)
      setCopiedQrValue(true)
    } catch {
      setScanError('Failed to copy QR payload.')
    }
  }

  const downloadQrImage = () => {
    const canvas = qrPreviewRef.current?.querySelector('canvas')
    if (!canvas) {
      return
    }

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'trusttrade-qr.png'
    link.click()
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="QR Scan"
        subtitle="Scan and generate real QR payloads for secure trade invites."
      />
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-300" />
            QR Scanner
          </CardTitle>
          <CardDescription>Use camera, image upload, or manual input. Generate QR invite payloads instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-6">
              <div className="relative mx-auto h-80 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <MotionDiv
                  className="relative h-full w-full overflow-hidden rounded-2xl border-4 border-indigo-400/60 bg-slate-900/80 shadow-[0_0_32px_8px_rgba(99,102,241,0.25)]"
                  animate={scanState === SCAN_STATES.SCANNING ? { boxShadow: '0 0 48px 12px #6366f1aa' } : { boxShadow: '0 0 32px 8px #6366f144' }}
                  transition={{ duration: 0.6 }}
                >
                  <video
                    ref={videoRef}
                    className={`h-full w-full object-cover transition-opacity duration-500 ${scanState === SCAN_STATES.SCANNING ? 'opacity-100' : 'opacity-25'}`}
                    playsInline
                    muted
                  />

                  {scanState === SCAN_STATES.SCANNING ? (
                    <MotionDiv
                      className="absolute left-4 right-4 top-8 h-1.5 rounded-full bg-gradient-to-r from-transparent via-indigo-300 to-transparent shadow-[0_0_18px_rgba(129,140,248,0.8)]"
                      variants={scanLineVariants}
                      initial="idle"
                      animate={scanState}
                    />
                  ) : null}

                  <div className="absolute inset-0 grid place-items-center bg-slate-950/35 p-4 text-center">
                    <AnimatePresence mode="wait">
                      {scanState === SCAN_STATES.IDLE && (
                        <MotionDiv
                          key="idle"
                          className="space-y-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="text-slate-200">Ready to scan</p>
                          <p className="text-xs text-slate-400">Point your camera at any QR invite.</p>
                        </MotionDiv>
                      )}

                      {scanState === SCAN_STATES.SCANNING && (
                        <MotionDiv
                          key="scanning"
                          className="space-y-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="text-indigo-200 animate-pulse">Scanning...</p>
                          <p className="text-xs text-indigo-100/80">Hold steady until the code is detected.</p>
                        </MotionDiv>
                      )}

                      {scanState === SCAN_STATES.SUCCESS && (
                        <MotionDiv
                          key="success"
                          className="space-y-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                        >
                          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                          <p className="font-semibold text-emerald-200">Scan Successful</p>
                        </MotionDiv>
                      )}

                      {scanState === SCAN_STATES.ERROR && (
                        <MotionDiv
                          key="error"
                          className="space-y-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                        >
                          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
                          <p className="font-semibold text-red-200">Scan Failed</p>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                  </div>
                </MotionDiv>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={toggleCameraScan}>
                  <Camera className="h-4 w-4" />
                  {scanState === SCAN_STATES.SCANNING ? 'Stop Camera' : 'Start Camera'}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload QR Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setInputMode((value) => !value)}
                >
                  <Keyboard className="h-4 w-4" />
                  Manual Code
                </Button>

                <Button variant="outline" onClick={reset}>Reset</Button>
              </div>

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
                        placeholder="Paste or enter code"
                        value={manualCode}
                        onChange={(event) => setManualCode(event.target.value)}
                        disabled={scanState === SCAN_STATES.SCANNING}
                      />
                      <Button type="submit" disabled={!manualCode.trim() || scanState === SCAN_STATES.SCANNING}>
                        Decode
                      </Button>
                    </form>
                  </MotionDiv>
                )}
              </AnimatePresence>

              {scanError ? (
                <div className="mx-auto max-w-lg rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {scanError}
                </div>
              ) : null}

              {scanResult ? (
                <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Decoded Payload</p>
                  <p className="mt-2 break-all text-sm text-slate-100">{parsedScan.raw}</p>
                  <p className="mt-3 text-sm text-slate-300">
                    {parsedScan.userId
                      ? `Detected User ID: ${parsedScan.userId}`
                      : 'No User ID pattern found in payload. You can still copy or open it.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {parsedScan.userId ? (
                      <Button onClick={useScanForJoin}>Use in Join Trade</Button>
                    ) : null}

                    {parsedScan.isUrl ? (
                      <Button variant="secondary" onClick={openScannedUrl}>
                        <ExternalLink className="h-4 w-4" />
                        Open Link
                      </Button>
                    ) : null}

                    <Button variant="secondary" onClick={copyScannedPayload}>
                      <Copy className="h-4 w-4" />
                      {copiedScan ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="generate" className="space-y-5">
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-generator-input">Invite value or User ID</Label>
                    <Input
                      id="qr-generator-input"
                      placeholder="u_trader007 or https://..."
                      value={qrInput}
                      onChange={(event) => {
                        setQrInput(event.target.value)
                        setCopiedQrValue(false)
                      }}
                    />
                    <p className="text-xs text-slate-400">
                      User IDs are automatically converted to a join invite URL.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">QR Payload</p>
                    <p className="mt-2 break-all text-sm text-slate-100">{qrValue}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={copyGeneratedPayload}>
                      <Copy className="h-4 w-4" />
                      {copiedQrValue ? 'Copied' : 'Copy Payload'}
                    </Button>
                    <Button variant="secondary" onClick={downloadQrImage}>
                      <Download className="h-4 w-4" />
                      Download PNG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/join-trade?invite=${encodeURIComponent(qrValue)}`)}
                    >
                      Use Value in Join Flow
                    </Button>
                  </div>
                </div>

                <div
                  ref={qrPreviewRef}
                  className="mx-auto grid w-full max-w-[280px] place-items-center rounded-3xl border border-white/10 bg-slate-900/70 p-5"
                >
                  <QRCodeCanvas
                    value={qrValue}
                    size={220}
                    includeMargin
                    bgColor="#0f172a"
                    fgColor="#e2e8f0"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
