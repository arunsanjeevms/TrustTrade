import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RadioTower } from 'lucide-react'
import ActivityTimelinePanel from '@/components/trade-room/activity-timeline-panel'
import RoleActionsPanel from '@/components/trade-room/role-actions-panel'
import StatusProgressTracker from '@/components/trade-room/status-progress-tracker'
import UploadDropzonePanel from '@/components/trade-room/upload-dropzone-panel'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import StatusBadge from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tradeRoomMessages } from '@/data/mock'

const MotionDiv = motion.div

const statusFlow = ['HOLD', 'SHIPPED', 'DELIVERED', 'COMPLETED']

const statusDescription = {
  HOLD: 'Funds are secured in escrow and waiting for shipment updates.',
  SHIPPED: 'Tracking has been submitted and shipment is currently in transit.',
  DELIVERED: 'Shipment delivered. Buyer verification is in progress.',
  COMPLETED: 'Trade finalized and escrow release is complete.',
}

const product = {
  name: 'MacBook Pro 16 M3',
  tradeId: 'TRD-4821',
  price: '$2,580.00',
  shipping: 'Express insured courier',
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TradeRoomPage() {
  const [role, setRole] = useState('seller')
  const [currentStatus, setCurrentStatus] = useState('HOLD')
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [roomClosed, setRoomClosed] = useState(false)
  const [messages, setMessages] = useState(
    tradeRoomMessages.map((message) => ({
      id: message.id,
      sender: message.sender,
      body: message.body,
      time: message.time,
    })),
  )
  const [uploadedFiles, setUploadedFiles] = useState([])

  const statusText = roomClosed
    ? 'Room is closed. No further state transitions are available.'
    : disputeOpen
      ? 'Dispute review is active. Completion flow is temporarily paused.'
      : statusDescription[currentStatus]

  const appendMessage = (sender, body) => {
    setMessages((current) => [
      ...current,
      {
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        sender,
        body,
        time: nowTime(),
      },
    ])
  }

  const transitionStatus = (nextStatus, note) => {
    if (nextStatus === currentStatus) {
      return
    }

    setCurrentStatus(nextStatus)
    appendMessage('System', note)
  }

  const onAction = (actionId) => {
    if (roomClosed) {
      return
    }

    if (actionId === 'add-tracking' && currentStatus === 'HOLD') {
      appendMessage('Seller', 'Tracking ID TTX-73319 uploaded with courier confirmation.')
      transitionStatus('SHIPPED', 'Status updated to SHIPPED after tracking verification.')
      return
    }

    if (actionId === 'confirm-delivery' && currentStatus === 'SHIPPED') {
      appendMessage('Buyer', 'Package delivered and condition verified by buyer.')
      transitionStatus('DELIVERED', 'Status updated to DELIVERED. Ready for escrow release.')
      return
    }

    if (actionId === 'release-escrow' && currentStatus === 'DELIVERED' && !disputeOpen) {
      transitionStatus('COMPLETED', 'Escrow has been released to seller. Trade is now complete.')
      return
    }

    if (actionId === 'raise-dispute' && currentStatus !== 'COMPLETED' && !disputeOpen) {
      setDisputeOpen(true)
      appendMessage(
        role.charAt(0).toUpperCase() + role.slice(1),
        'Dispute opened: item condition mismatch requires moderator review.',
      )
      appendMessage('System', 'Dispute ticket created. Workflow is paused until resolution.')
      return
    }

    if (actionId === 'close-room' && (currentStatus === 'COMPLETED' || disputeOpen)) {
      setRoomClosed(true)
      appendMessage('System', 'Trade room closed and archived for compliance records.')
    }
  }

  const onFilesAdded = (files) => {
    const prepared = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      uploadedAt: nowTime(),
    }))

    setUploadedFiles((current) => [...prepared, ...current].slice(0, 12))
    appendMessage(
      'System',
      `${prepared.length} file${prepared.length > 1 ? 's were' : ' was'} uploaded to verification vault.`,
    )
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Trade Room"
        subtitle="Professional escrow workflow with live activity, role controls, and clear status progression."
        actions={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success-foreground">
            <span className={`h-2 w-2 rounded-full bg-success ${roomClosed ? '' : 'animate-pulse'}`} />
            {roomClosed ? 'Room Closed' : 'Live Updates Active'}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <Card interactive={false} className="h-fit xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
            <CardDescription>Room #{product.tradeId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Product</p>
              <p className="mt-1 text-base font-semibold text-foreground">{product.name}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-foreground">{product.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground">{product.shipping}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trade ID</span>
                  <span className="font-semibold text-foreground">{product.tradeId}</span>
                </div>
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

        <RoleActionsPanel
          role={role}
          setRole={setRole}
          status={currentStatus}
          disputeOpen={disputeOpen}
          roomClosed={roomClosed}
          onAction={onAction}
        />
      </div>
    </AnimatedPage>
  )
}
