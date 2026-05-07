import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, Lock, ShieldCheck, ArrowLeft, Smartphone } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AnimatedPage from '@/components/animated-page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTradeById, updateTradeStatus } from '@/services/trades'

const MotionDiv = motion.div

const UPI_PROVIDERS = [
  { id: 'gpay', name: 'Google Pay', color: 'from-blue-500 to-green-500', letter: 'G' },
  { id: 'paytm', name: 'Paytm', color: 'from-blue-600 to-cyan-500', letter: 'P' },
  { id: 'phonepe', name: 'PhonePe', color: 'from-purple-600 to-indigo-500', letter: 'Pe' },
  { id: 'bhim', name: 'BHIM UPI', color: 'from-orange-500 to-amber-500', letter: 'B' },
]

export default function PaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tradeId = searchParams.get('tradeId')
  const [trade, setTrade] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('choose') // choose | card | upi | processing | success
  const [selectedUpi, setSelectedUpi] = useState(null)
  const [upiId, setUpiId] = useState('')
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' })

  useEffect(() => {
    if (!tradeId) return
    getTradeById(tradeId).then((d) => { setTrade(d); setLoading(false) }).catch(() => setLoading(false))
  }, [tradeId])

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d }

  const amount = trade
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: trade.currency || 'USD' }).format(Number(trade.amount || 0))
    : '$0.00'

  const processPay = async () => {
    setStep('processing')
    await new Promise((r) => setTimeout(r, 3000))
    try {
      await updateTradeStatus(tradeId, 'HOLD', 'Buyer completed escrow payment.')
      setStep('success')
      setTimeout(() => navigate(`/trade-room/${tradeId}`), 2200)
    } catch { setStep('choose') }
  }

  if (loading) return <AnimatedPage><div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-muted-foreground animate-pulse">Loading...</p></div></AnimatedPage>
  if (!trade) return <AnimatedPage><div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-muted-foreground">Trade not found.</p></div></AnimatedPage>

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-xl py-6">
        <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Trade Room
        </button>

        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-950 to-indigo-950/30 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">

          {/* Header */}
          <div className="border-b border-white/10 bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-transparent px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30">
                  <ShieldCheck className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Secure Escrow Payment</h2>
                  <p className="text-xs text-slate-400">Protected by TrustTrade</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Lock className="h-3.5 w-3.5" /><span className="font-semibold">256-bit SSL</span>
              </div>
            </div>
          </div>

          {/* Order Summary (always visible except success) */}
          {step !== 'success' && step !== 'processing' && (
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{trade.title}</p>
                  <p className="text-xs text-slate-400">Trade {trade.publicId} · {trade.shippingMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{amount}</p>
                  <p className="text-[11px] text-emerald-400">Escrow Protected</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP: CHOOSE METHOD ─── */}
          {step === 'choose' && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Choose Payment Method</p>

              {/* UPI Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-300" />
                  <p className="text-sm font-semibold text-white">UPI Payment</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {UPI_PROVIDERS.map((upi) => (
                    <button key={upi.id} onClick={() => { setSelectedUpi(upi); setStep('upi') }}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition-all duration-200 hover:border-indigo-400/40 hover:bg-indigo-500/8 hover:shadow-lg hover:shadow-indigo-500/5">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${upi.color} shadow-md`}>
                        <span className="text-sm font-black text-white">{upi.letter}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white">{upi.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] text-slate-500">OR</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Card Option */}
              <button onClick={() => setStep('card')}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/8">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 ring-1 ring-white/10">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Credit / Debit Card</p>
                  <p className="text-xs text-slate-400">Visa, Mastercard, Rupay</p>
                </div>
              </button>
            </MotionDiv>
          )}

          {/* ─── STEP: UPI ─── */}
          {step === 'upi' && (
            <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-5">
              <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <div className="flex items-center gap-3">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${selectedUpi?.color} shadow-lg`}>
                  <span className="text-lg font-black text-white">{selectedUpi?.letter}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white">Pay with {selectedUpi?.name}</p>
                  <p className="text-xs text-slate-400">Enter your UPI ID to proceed</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">UPI ID</label>
                <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                <span className="text-sm text-slate-300">Amount</span>
                <span className="text-lg font-bold text-indigo-300">{amount}</span>
              </div>
              <Button onClick={processPay} disabled={!upiId.includes('@')}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25">
                <Lock className="h-4 w-4 mr-2" /> Pay {amount}
              </Button>
            </MotionDiv>
          )}

          {/* ─── STEP: CARD ─── */}
          {step === 'card' && (
            <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-5">
              <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>

              {/* Live Card Preview */}
              <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-5 shadow-lg shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
                    <CreditCard className="h-7 w-7 text-white/40" />
                  </div>
                  <div>
                    <p className="font-mono text-base tracking-[0.25em] text-white/90">{form.cardNumber || '•••• •••• •••• ••••'}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider text-white/60">{form.name || 'CARD HOLDER'}</p>
                      <p className="text-[11px] text-white/60">{form.expiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); processPay() }} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Cardholder Name</label>
                  <Input placeholder="JOHN DOE" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Card Number</label>
                  <Input placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: fmtCard(e.target.value) })} maxLength={19} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Expiry</label>
                    <Input placeholder="MM/YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: fmtExp(e.target.value) })} maxLength={5} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">CVV</label>
                    <Input placeholder="•••" type="password" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} maxLength={4} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 mt-2">
                  <Lock className="h-4 w-4 mr-2" /> Pay {amount} Securely
                </Button>
              </form>
              <p className="text-center text-[11px] text-slate-500">Funds held in escrow until delivery confirmed.</p>
            </MotionDiv>
          )}

          {/* ─── STEP: PROCESSING ─── */}
          {step === 'processing' && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 px-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                {selectedUpi ? (
                  <div className={`absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-gradient-to-br ${selectedUpi.color}`}>
                    <span className="text-sm font-black text-white">{selectedUpi.letter}</span>
                  </div>
                ) : (
                  <CreditCard className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-indigo-300" />
                )}
              </div>
              <p className="mt-6 text-lg font-semibold text-white">Processing Payment...</p>
              <p className="mt-2 text-sm text-slate-400">Securing {amount} in TrustTrade escrow</p>
              <div className="mt-4 w-48 h-1 rounded-full bg-slate-800 overflow-hidden">
                <MotionDiv initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.8, ease: 'easeInOut' }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-emerald-400">
                <Lock className="h-3 w-3" /><span>Bank-grade encryption active</span>
              </div>
            </MotionDiv>
          )}

          {/* ─── STEP: SUCCESS ─── */}
          {step === 'success' && (
            <MotionDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center justify-center py-20 px-6">
              <MotionDiv initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/30">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </MotionDiv>
              <p className="mt-6 text-xl font-bold text-white">Payment Successful!</p>
              <p className="mt-2 text-sm text-slate-400">{amount} locked in escrow</p>
              <p className="mt-4 text-xs text-slate-500 animate-pulse">Redirecting to trade room...</p>
            </MotionDiv>
          )}
        </MotionDiv>
      </div>
    </AnimatedPage>
  )
}
