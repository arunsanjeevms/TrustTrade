import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck, ClipboardPaste, QrCode, UserRoundPlus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import AnimatedPage from '@/components/animated-page'
import JoinGuidance from '@/components/join-trade/join-guidance'
import RecentJoinHistory from '@/components/join-trade/recent-join-history'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { extractUserIdFromInvite } from '@/lib/qr'

const MotionDiv = motion.div

const initialHistory = [
  { id: 'jh-1', userId: 'u_trader007', status: 'accepted', time: 'Today, 10:24' },
  { id: 'jh-2', userId: 'u_ryan009', status: 'pending', time: 'Today, 09:42' },
  { id: 'jh-3', userId: 'u_camvera', status: 'accepted', time: 'Yesterday, 19:11' },
]

export default function JoinTradePage() {
  const location = useLocation()
  const [userId, setUserId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState(false)
  const [pasteError, setPasteError] = useState('')
  const [joinHistory, setJoinHistory] = useState(initialHistory)

  const hasError = touched && userId.trim().length < 4

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const inviteValue =
      params.get('invite') ||
      params.get('user') ||
      params.get('uid') ||
      params.get('id') ||
      ''

    if (!inviteValue) {
      return
    }

    const extracted = extractUserIdFromInvite(inviteValue)
    if (!extracted) {
      setPasteError('Scanned QR did not contain a valid User ID.')
      return
    }

    setUserId(extracted)
    setTouched(true)
    setSubmitted(false)
    setPasteError('')
  }, [location.search])

  const onPasteInvite = async () => {
    setPasteError('')

    try {
      const clipboardText = await navigator.clipboard.readText()
      const extracted = extractUserIdFromInvite(clipboardText)

      if (!extracted) {
        setPasteError('No valid User ID found in pasted link.')
        return
      }

      setUserId(extracted)
      setTouched(true)
      setSubmitted(false)
    } catch {
      setPasteError('Clipboard access failed. Paste manually if needed.')
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setTouched(true)

    if (userId.trim().length < 4) {
      return
    }

    setSubmitted(true)
    setJoinHistory((current) => [
      {
        id: `jh-${Date.now()}`,
        userId: userId.trim(),
        status: 'pending',
        time: 'Just now',
      },
      ...current,
    ].slice(0, 5))
  }

  return (
    <AnimatedPage className="space-y-6">
      <PageHeader
        title="Join Trade"
        subtitle="Send a secure join request using User ID, invite link, or QR flow."
      />

      <MotionDiv
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="mx-auto w-full max-w-2xl"
      >
        <Card interactive={false}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundPlus className="h-5 w-5 text-indigo-300" />
              Request Room Access
            </CardTitle>
            <CardDescription>Enter your partner User ID or quickly import from an invite.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <JoinGuidance />

            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="trade-user-id">User ID</Label>
                  <span className="text-xs text-muted-foreground">Example: u_trader007</span>
                </div>
                <Input
                  id="trade-user-id"
                  placeholder="e.g. u_trader007"
                  value={userId}
                  onChange={(event) => {
                    setUserId(event.target.value)
                    setSubmitted(false)
                    setPasteError('')
                  }}
                />
                {hasError ? <p className="text-xs text-red-300">User ID must be at least 4 characters.</p> : null}
                {pasteError ? <p className="text-xs text-warning">{pasteError}</p> : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={onPasteInvite}>
                  <ClipboardPaste className="h-4 w-4" />
                  Paste Invite Link
                </Button>
                <Button asChild variant="outline">
                  <Link to="/qr-scan">
                    <QrCode className="h-4 w-4" />
                    Scan QR
                  </Link>
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Send Request
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {submitted ? (
              <MotionDiv
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="rounded-2xl border border-success/35 bg-success/20 p-3 text-sm text-success-foreground"
              >
                <div className="mb-1 flex items-center gap-2 font-medium text-success-foreground">
                  <CircleCheck className="h-4 w-4" />
                  Request Sent
                </div>
                Invite successfully submitted to {userId.trim()}. They will appear in your room once accepted.
              </MotionDiv>
            ) : null}

            <div className="border-t border-white/10 pt-2">
              <RecentJoinHistory items={joinHistory} />
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </AnimatedPage>
  )
}
