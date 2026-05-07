import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RadioTower, Users } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import ActivityTimelinePanel from '@/components/trade-room/activity-timeline-panel'
import RoleActionsPanel from '@/components/trade-room/role-actions-panel'
import StatusProgressTracker from '@/components/trade-room/status-progress-tracker'
import UploadDropzonePanel from '@/components/trade-room/upload-dropzone-panel'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import StatusBadge from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTradeRoom } from '@/hooks/use-trade-room'
import { getAuthUser } from '@/lib/auth-storage'
import { addTradeActivity, closeTradeRoom, updateTradeStatus, getTradeQrPayload } from '@/services/trades'
import { openDispute as apiOpenDispute } from '@/services/disputes'
import { QrCode, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

const MotionDiv = motion.div

const statusFlow = ['PENDING_JOIN', 'HOLD', 'SHIPPED', 'DELIVERED', 'COMPLETED']

const statusDescription = {
  PENDING_JOIN: 'Waiting for buyer to join and lock escrow funds.',
  HOLD: 'Funds are secured in escrow and waiting for shipment updates.',
  SHIPPED: 'Tracking has been submitted and shipment is currently in transit.',
  DELIVERED: 'Shipment delivered. Buyer verification is in progress.',
  COMPLETED: 'Trade finalized and escrow release is complete.',
  CANCELLED: 'Trade was cancelled and escrow flow stopped.',
  DISPUTED: 'Dispute opened. Resolution is in progress.',
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TradeRoomPage() {
  const { tradeId } = useParams()
  const navigate = useNavigate()
  const { trade, activities, isLoading, error } = useTradeRoom(tradeId)
  const [role, setRole] = useState('seller')
  const [uploadedFiles, setUploadedFiles] = useState([])
  
  // QR Dialog State
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [qrPayload, setQrPayload] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')
  const qrCanvasRef = useRef(null)

  // Dispute Dialog State
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)

  const currentStatus = trade?.status || 'PENDING_JOIN'
  const disputeOpen = trade?.status === 'DISPUTED'
  const roomClosed = Boolean(trade?.roomClosed)
  const authUser = getAuthUser()

  const openQrDialog = async () => {
    setShowQrDialog(true)
    setQrLoading(true)
    setQrError('')
    
    try {
      const payload = await getTradeQrPayload(tradeId)
      setQrPayload(payload)
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Unable to load QR payload.')
    } finally {
      setQrLoading(false)
    }
  }

  const downloadQr = () => {
    if (!qrCanvasRef.current || !qrPayload?.token || !trade) return
    const dataUrl = qrCanvasRef.current.toDataURL('image/png')
    const anchor = document.createElement('a')
    anchor.href = dataUrl
    anchor.download = `trusttrade-${trade.publicId || trade.id}-qr.png`
    anchor.click()
  }

  useEffect(() => {
    if (!trade) {
      return
    }

    const participantRole = trade.participants?.find((participant) => participant.userId === authUser?.id)?.role
    if (participantRole) {
      setRole(participantRole.toLowerCase())
      return
    }

    if (trade.createdBy?.id === authUser?.id) {
      setRole('seller')
      return
    }

    setRole('buyer')
  }, [trade, authUser?.id])

  const messages = useMemo(() => {
    return (activities || []).map((activity) => ({
      id: activity.id,
      sender: activity.actor?.fullName || (activity.actorId ? 'Participant' : 'System'),
      body: activity.message,
      time: new Date(activity.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))
  }, [activities])

  const statusText = roomClosed
    ? 'Room is closed. No further state transitions are available.'
    : disputeOpen
      ? 'Dispute review is active. Completion flow is temporarily paused.'
      : statusDescription[currentStatus] || 'Workflow update pending.'

  const onAction = async (actionId) => {
    if (!trade || roomClosed) {
      return
    }

    if (actionId === 'pay-escrow') {
      navigate(`/payment?tradeId=${trade.id}`)
      return
    }

    if (actionId === 'add-tracking' && currentStatus === 'HOLD') {
      await updateTradeStatus(trade.id, 'SHIPPED', 'Seller added tracking details.')
      return
    }

    if (actionId === 'confirm-delivery' && currentStatus === 'SHIPPED') {
      await updateTradeStatus(trade.id, 'DELIVERED', 'Buyer confirmed delivery.')
      return
    }

    if (actionId === 'release-escrow' && currentStatus === 'DELIVERED' && !disputeOpen) {
      await updateTradeStatus(trade.id, 'COMPLETED', 'Escrow released to seller.')
      return
    }

    if (actionId === 'raise-dispute' && currentStatus !== 'COMPLETED' && !disputeOpen) {
      setDisputeReason('')
      setShowDisputeDialog(true)
      return
    }

    if (actionId === 'close-room' && (currentStatus === 'COMPLETED' || disputeOpen || currentStatus === 'CANCELLED')) {
      await closeTradeRoom(trade.id)
    }
  }

  const handleDisputeSubmit = async () => {
    if (!disputeReason.trim()) return
    setIsSubmittingDispute(true)
    try {
      const evidence = uploadedFiles.map((file) => ({
        evidenceType: file.name.match(/\.(pdf)$/i) ? 'PDF' : file.name.match(/\.(mp4|mov)$/i) ? 'VIDEO' : 'IMAGE',
        description: file.name,
      }))
      
      await apiOpenDispute({ tradeId: trade.id, reason: disputeReason.trim(), evidence })
      setShowDisputeDialog(false)
      navigate('/disputes')
    } catch (err) {
      console.error(err)
      // handle error gracefully if needed
    } finally {
      setIsSubmittingDispute(false)
    }
  }

  const onFilesAdded = async (files) => {
    const prepared = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      uploadedAt: nowTime(),
    }))

    setUploadedFiles((current) => [...prepared, ...current].slice(0, 12))
    if (trade) {
      await addTradeActivity(
        trade.id,
        `${prepared.length} file${prepared.length > 1 ? 's were' : ' was'} uploaded to verification vault.`,
      )
    }
  }

  if (isLoading && !trade) {
    return (
      <AnimatedPage>
        <PageHeader title="Trade Room" subtitle="Loading trade room..." />
      </AnimatedPage>
    )
  }

  if (!trade) {
    return (
      <AnimatedPage>
        <PageHeader title="Trade Room" subtitle={error || 'Trade room not found.'} />
      </AnimatedPage>
    )
  }

  const priceLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: trade.currency || 'USD',
  }).format(Number(trade.amount || 0))

  const roleLabel = role.toUpperCase()

  return (
    <AnimatedPage>
      <PageHeader
        title="Trade Room"
        subtitle="Professional escrow workflow with live activity, role controls, and clear status progression."
        actions={
          <div className="flex items-center gap-3">
            {/* User role indicator */}
            <div className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-bold h-8 ${
              roleLabel === 'SELLER'
                ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-300'
                : 'border-amber-400/40 bg-amber-500/15 text-amber-300'
            }`}>
              <Users className="h-3.5 w-3.5" />
              You are the {roleLabel}
            </div>
            <Button variant="outline" size="sm" onClick={openQrDialog} className="h-8 gap-2">
              <QrCode className="h-4 w-4" />
              Get Invite QR
            </Button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success-foreground h-8">
              <span className={`h-2 w-2 rounded-full bg-success ${roomClosed ? '' : 'animate-pulse'}`} />
              {roomClosed ? 'Room Closed' : 'Live'}
            </div>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <Card interactive={false} className="h-fit xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
            <CardDescription>Room #{trade.publicId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Product</p>
              <p className="mt-1 text-base font-semibold text-foreground">{trade.title}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-foreground">{priceLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground">{trade.shippingMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trade ID</span>
                  <span className="font-semibold text-foreground">{trade.publicId}</span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5"><Users className="h-3 w-3" /> Participants</p>
              <div className="mt-3 space-y-2">
                {trade.participants?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground">{p.user?.fullName || p.user?.email || 'Unknown'}</span>
                    <Badge variant={p.role === 'SELLER' ? 'default' : 'secondary'} className="text-[10px]">{p.role}</Badge>
                  </div>
                ))}
                {(!trade.participants || trade.participants.length < 2) && (
                  <p className="text-xs text-muted-foreground italic">Waiting for second participant to join...</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={currentStatus} />
              {disputeOpen ? <Badge variant="danger">DISPUTE OPEN</Badge> : null}
              {roomClosed ? <Badge variant="secondary">ROOM CLOSED</Badge> : null}
              <Badge variant="secondary" className="gap-1">
                <RadioTower className="h-3 w-3" />
                Live
              </Badge>
            </div>

            <StatusProgressTracker statuses={statusFlow} currentStatus={currentStatus} />

            <AnimatePresence mode="wait">
              <MotionDiv
                key={`${currentStatus}-${disputeOpen}-${roomClosed}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="rounded-2xl border border-primary/30 bg-primary/15 p-4"
              >
                <p className="text-sm text-primary-foreground">{statusText}</p>
              </MotionDiv>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <ActivityTimelinePanel messages={messages} live={!roomClosed} />
          <UploadDropzonePanel files={uploadedFiles} onFilesAdded={onFilesAdded} />
        </div>

        <div className="flex flex-col gap-4">
          {disputeOpen && (
            <Card interactive={false} className="border-amber-400/30 bg-amber-500/5">
              <CardContent className="flex flex-col items-center gap-3 py-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-500/20">
                  <RadioTower className="h-6 w-6 text-amber-400" />
                </div>
                <p className="text-center text-sm font-semibold text-amber-200">Dispute is Active</p>
                <p className="text-center text-xs text-amber-100/70">This trade has an open dispute. Track progress and communicate in the Disputes module.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/disputes')} className="mt-1 gap-2">
                  Go to Disputes
                </Button>
              </CardContent>
            </Card>
          )}
          <RoleActionsPanel
            role={role}
            status={currentStatus}
            escrowStatus={trade?.escrowStatus || 'PENDING'}
            disputeOpen={disputeOpen}
            roomClosed={roomClosed}
            onAction={onAction}
          />
        </div>
      </div>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trade Invite QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code with the buyer. When they scan it, they will join the room and their payment will be automatically locked in escrow.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {qrLoading ? (
              <p className="text-sm text-muted-foreground">Generating QR...</p>
            ) : qrError ? (
              <p className="text-sm text-warning">{qrError}</p>
            ) : qrPayload?.token ? (
              <QRCodeCanvas value={qrPayload.token} size={200} ref={qrCanvasRef} />
            ) : (
              <p className="text-sm text-muted-foreground">QR not available.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={downloadQr} disabled={!qrPayload?.token}>
              <Download className="h-4 w-4" />
              Download JPG/PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a Dispute</DialogTitle>
            <DialogDescription>
              Please provide a detailed reason for the dispute. Any files uploaded to the Verification Vault will be attached as evidence automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="Explain the issue in detail..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDisputeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!disputeReason.trim() || isSubmittingDispute} onClick={handleDisputeSubmit}>
              {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
