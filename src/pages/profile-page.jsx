
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheckBig, Shield, UserCircle2, BadgeCheck, Lock, KeyRound, Mail, Phone, User, CheckCircle2, AlertCircle, Wallet2, BarChart2 } from 'lucide-react'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const MotionDiv = motion.div

const defaultProfile = {
  fullName: 'Ari Johnson',
  email: 'ari@trusttrade.app',
  phone: '+1 (555) 218-4100',
  bio: 'Product trader focused on high-value electronics and camera gear.',
  avatar: '',
}

const trustScore = 4.9
const trustScoreMax = 5.0
const trustScoreBreakdown = {
  completionRate: 98.7,
  disputeRatio: 0.8,
  avgTradeTime: '2h 14m',
}
const wallet = {
  balance: 3120.45,
  locked: 820.00,
  released: 2300.45,
}
const verification = {
  isVerifiedSeller: true,
  kycStatus: 'Verified',
}
const security = {
  twoFA: true,
  logs: [
    { id: 1, type: '2FA', status: 'Success', time: '2026-03-29 21:10', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
    { id: 2, type: 'Login', status: 'Success', time: '2026-03-29 20:55', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
    { id: 3, type: 'Password Change', status: 'Alert', time: '2026-03-28 18:22', icon: <AlertCircle className="h-4 w-4 text-yellow-400" /> },
  ],
}

function ProfileCompletionBar({ percent }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-300">Profile completion</span>
        <span className="text-xs font-semibold text-indigo-200">{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(defaultProfile)
  const [saved, setSaved] = useState(false)

  // For demo, profile completion is static. In real app, calculate based on filled fields and verifications.
  const profileCompletion = 88

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Profile"
        subtitle="Manage your identity, verification, wallet, and security."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left column: Overview, Trust, Verification, Wallet */}
        <div className="space-y-6 xl:col-span-1">
          <Card className="p-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-300" /> Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ProfileCompletionBar percent={profileCompletion} />
              <div className="flex items-center gap-4 mb-3">
                <Avatar className="h-16 w-16 border border-white/10">
                  <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg text-white">{profile.fullName}</div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Mail className="h-4 w-4" /> {profile.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                    <Phone className="h-4 w-4" /> {profile.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-300" /> Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-indigo-200">{trustScore}</span>
                <span className="text-slate-400">/ {trustScoreMax}</span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${(trustScore / trustScoreMax) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 mt-2">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-white">{trustScoreBreakdown.completionRate}%</span>
                  <span className="text-slate-400">Completion</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-white">{trustScoreBreakdown.disputeRatio}%</span>
                  <span className="text-slate-400">Disputes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-white">{trustScoreBreakdown.avgTradeTime}</span>
                  <span className="text-slate-400">Avg Time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-indigo-300" /> Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex gap-3">
              <Badge variant={verification.isVerifiedSeller ? 'success' : 'secondary'} className="flex items-center gap-1">
                <Shield className="h-4 w-4" /> Verified Seller
              </Badge>
              <Badge variant={verification.kycStatus === 'Verified' ? 'success' : 'warning'} className="flex items-center gap-1">
                <UserCircle2 className="h-4 w-4" /> KYC: {verification.kycStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Wallet2 className="h-5 w-5 text-indigo-300" /> Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Balance</span>
                  <span className="font-semibold text-white">${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Locked</span>
                  <span className="font-semibold text-yellow-300">${wallet.locked.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Released</span>
                  <span className="font-semibold text-emerald-300">${wallet.released.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Edit Form & Security */}
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-indigo-300" /> Edit Profile
              </CardTitle>
              <CardDescription>Update your personal details and bio.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(event) => updateField('email', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(event) => updateField('bio', event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="secondary" onClick={() => setProfile(defaultProfile)}>
                    Reset
                  </Button>
                </div>
                {saved ? (
                  <MotionDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100 mt-2"
                  >
                    <div className="flex items-center gap-2 font-semibold text-emerald-200">
                      <CircleCheckBig className="h-4 w-4" />
                      Profile updated successfully.
                    </div>
                  </MotionDiv>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-300" /> Security
              </CardTitle>
              <CardDescription>2FA status and recent security events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={security.twoFA ? 'success' : 'danger'} className="flex items-center gap-1">
                  <KeyRound className="h-4 w-4" /> 2FA {security.twoFA ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                <div className="font-semibold text-slate-200 mb-2 text-sm">Security Logs</div>
                <div className="space-y-2">
                  {security.logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-xs text-slate-300">
                      {log.icon}
                      <span className="font-medium">{log.type}</span>
                      <span className="text-slate-400">{log.status}</span>
                      <span className="ml-auto text-slate-500">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}
