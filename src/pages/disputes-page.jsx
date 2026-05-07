import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, ChevronRight, Clock, FileText, Gavel, MessageSquare,
  Send, ShieldAlert, ShieldCheck, XCircle, CheckCircle2, Search, Scale, Download
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { listDisputes, getDisputeById, addDisputeNote } from '@/services/disputes'
import { resolveDispute } from '@/services/trades'
import { getAuthUser } from '@/lib/auth-storage'

const MotionDiv = motion.div

const statusCfg = {
  OPEN: { label: 'Open', cls: 'border-amber-500/40 bg-amber-500/15 text-amber-300', icon: AlertTriangle },
  UNDER_REVIEW: { label: 'Under Review', cls: 'border-blue-500/40 bg-blue-500/15 text-blue-300', icon: Clock },
  RESOLVED_REFUND: { label: 'Refunded', cls: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300', icon: CheckCircle2 },
  RESOLVED_RELEASE: { label: 'Released', cls: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300', icon: CheckCircle2 },
  RESOLVED_PARTIAL: { label: 'Partial', cls: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300', icon: ShieldCheck },
  REJECTED: { label: 'Rejected', cls: 'border-red-500/40 bg-red-500/15 text-red-300', icon: XCircle },
  CLOSED: { label: 'Closed', cls: 'border-slate-500/40 bg-slate-500/15 text-slate-300', icon: ShieldCheck },
}

function StatusPill({ status }) {
  const c = statusCfg[status] || statusCfg.OPEN
  const Icon = c.icon
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${c.cls}`}><Icon className="h-3 w-3" />{c.label}</span>
}

function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const isResolved = (s) => ['RESOLVED_REFUND','RESOLVED_RELEASE','RESOLVED_PARTIAL','REJECTED','CLOSED'].includes(s)

export default function DisputesPage() {
  const authUser = getAuthUser()
  const navigate = useNavigate()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detLoading, setDetLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSending, setNoteSending] = useState(false)
  const [noteErr, setNoteErr] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [resolving, setResolving] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState(null)

  const load = useCallback(async () => { setLoading(true); setDisputes(await listDisputes()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const openDet = useCallback(async (id) => {
    setSelId(id); setDetLoading(true); setNoteText(''); setNoteErr('')
    try { setDetail(await getDisputeById(id)) } catch { setDetail(null) }
    setDetLoading(false)
  }, [])

  const sendNote = useCallback(async () => {
    if (!noteText.trim() || !selId) return
    setNoteSending(true); setNoteErr('')
    try { await addDisputeNote(selId, noteText.trim()); setNoteText(''); setDetail(await getDisputeById(selId)) }
    catch (e) { setNoteErr(e instanceof Error ? e.message : 'Failed') }
    setNoteSending(false)
  }, [noteText, selId])

  const handleResolve = useCallback(async (resolution) => {
    if (!detail?.trade?.id) return
    setResolving(true)
    try {
      await resolveDispute(detail.trade.id, resolution)
      setDetail(await getDisputeById(selId))
      load()
    } catch { /* ignore */ }
    setResolving(false)
  }, [detail, selId, load])

  const filtered = useMemo(() => disputes.filter((d) => {
    if (filter !== 'ALL' && d.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return [d.trade?.publicId, d.trade?.title, d.reason, d.openedBy?.fullName].filter(Boolean).join(' ').toLowerCase().includes(q)
    }
    return true
  }), [disputes, filter, search])

  return (
    <AnimatedPage className="space-y-6">
      <PageHeader title="Dispute Center" subtitle="Manage and resolve trade disputes with evidence-based decisions." />

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        {/* ─── LEFT: LIST ─── */}
        <div className="space-y-4">
          <Card interactive={false}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 ring-1 ring-amber-400/30">
                  <Scale className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <CardTitle>Disputes</CardTitle>
                  <CardDescription>{disputes.length} total · {disputes.filter(d => !isResolved(d.status)).length} active</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input className="pl-9" placeholder="Search disputes..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['ALL','OPEN','UNDER_REVIEW','RESOLVED_REFUND','RESOLVED_RELEASE','CLOSED'].map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${filter === s ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                    {s === 'ALL' ? 'All' : (statusCfg[s]?.label || s)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="max-h-[62vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">Loading...</p>
            ) : filtered.length === 0 ? (
              <Card interactive={false} className="py-12 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">No disputes found</p>
              </Card>
            ) : filtered.map((d) => (
              <MotionDiv key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${selId === d.id ? 'border-indigo-400/40 bg-indigo-500/8 shadow-lg shadow-indigo-500/5' : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'}`}
                onClick={() => openDet(d.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">{d.trade?.title || 'Unknown'}</p>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">{d.trade?.publicId}</Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">{d.reason}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 mt-1" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusPill status={d.status} />
                  <span className="text-[11px] text-slate-500">{timeAgo(d.createdAt)}</span>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: DETAIL ─── */}
        <AnimatePresence mode="wait">
          {!selId ? (
            <MotionDiv key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[55vh] items-center justify-center rounded-2xl border border-dashed border-white/10">
              <div className="text-center px-6">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-800/60 ring-1 ring-white/10">
                  <Gavel className="h-8 w-8 text-slate-600" />
                </div>
                <p className="mt-5 text-base font-semibold text-slate-400">Select a dispute to view details</p>
                <p className="mt-1 text-sm text-slate-500">Review evidence, communicate with participants, and resolve disputes.</p>
              </div>
            </MotionDiv>
          ) : detLoading ? (
            <MotionDiv key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[55vh] items-center justify-center">
              <p className="text-sm text-muted-foreground animate-pulse">Loading details...</p>
            </MotionDiv>
          ) : detail ? (
            <MotionDiv key={detail.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="space-y-4">
              {/* Header */}
              <Card interactive={false} className="overflow-hidden">
                <div className="border-b border-white/10 bg-gradient-to-r from-amber-600/10 via-red-600/5 to-transparent px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 ring-1 ring-amber-400/30">
                        <ShieldAlert className="h-5 w-5 text-amber-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{detail.trade?.publicId}</h3>
                        <p className="text-xs text-slate-400">{detail.trade?.title}</p>
                      </div>
                    </div>
                    <StatusPill status={detail.status} />
                  </div>
                </div>
                <CardContent className="space-y-4 pt-5">
                  {/* Reason */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Dispute Reason</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{detail.reason}</p>
                  </div>
                  {/* Info Grid */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Opened By</p>
                      <p className="mt-1 text-sm font-semibold text-white">{detail.openedBy?.fullName || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-500">{timeAgo(detail.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Trade Amount</p>
                      <p className="mt-1 text-sm font-bold text-indigo-300">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(detail.trade?.amount||0))}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Trade Status</p>
                      <p className="mt-1 text-sm font-semibold text-white">{detail.trade?.status}</p>
                    </div>
                  </div>
                  {/* Resolution */}
                  {detail.resolutionSummary && (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">Resolution</p>
                      <p className="text-sm text-emerald-100">{detail.resolutionSummary}</p>
                      {detail.resolvedBy && <p className="mt-2 text-xs text-emerald-300/60">Resolved by {detail.resolvedBy.fullName} · {timeAgo(detail.resolvedAt)}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Evidence */}
              <Card interactive={false}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-indigo-300" />Evidence ({detail.evidence?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {detail.evidence?.length > 0 ? (
                    <div className="space-y-2">
                      {detail.evidence.map((ev) => (
                        <div key={ev.id} 
                             className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all hover:bg-white/[0.06] hover:border-white/20"
                             onClick={() => setSelectedEvidence(ev)}>
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/15"><FileText className="h-4 w-4 text-indigo-300" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">{ev.evidenceType}</p>
                            <p className="truncate text-xs text-slate-400">{ev.description || 'No description'}</p>
                          </div>
                          <span className="text-[11px] text-slate-500">{timeAgo(ev.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center rounded-xl border border-dashed border-white/10">
                      <FileText className="mx-auto h-7 w-7 text-slate-600" />
                      <p className="mt-2 text-xs text-slate-400">No evidence uploaded. Upload files in the Trade Room's Verification Vault.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Resolution Panel */}
              {!isResolved(detail.status) && (
                <Card interactive={false} className="border-amber-400/20 bg-gradient-to-br from-amber-950/20 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Gavel className="h-4 w-4 text-amber-300" />Admin Resolution</CardTitle>
                    <CardDescription>Review evidence and decide the outcome of this dispute.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button disabled={resolving} onClick={() => handleResolve('SELLER')}
                        className="group rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 disabled:opacity-50">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 mb-2" />
                        <p className="text-sm font-bold text-emerald-200">Favor Seller</p>
                        <p className="mt-1 text-xs text-emerald-300/60">Release escrow funds to the seller.</p>
                      </button>
                      <button disabled={resolving} onClick={() => handleResolve('BUYER')}
                        className="group rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-left transition-all hover:bg-red-500/20 hover:border-red-400/50 disabled:opacity-50">
                        <XCircle className="h-6 w-6 text-red-400 mb-2" />
                        <p className="text-sm font-bold text-red-200">Favor Buyer</p>
                        <p className="mt-1 text-xs text-red-300/60">Refund escrow funds to the buyer.</p>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Communication */}
              <Card interactive={false}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4 text-indigo-300" />Communication ({detail.notes?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {detail.notes?.length > 0 ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {detail.notes.map((n) => {
                        const me = n.authorId === authUser?.id
                        return (
                          <div key={n.id} className={`rounded-xl border p-3 ${me ? 'ml-8 border-indigo-400/20 bg-indigo-500/8' : 'mr-8 border-white/10 bg-white/[0.03]'}`}>
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-300">{me ? 'You' : (n.author?.fullName || 'Participant')}</p>
                              <span className="text-[10px] text-slate-500">{timeAgo(n.createdAt)}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-200">{n.note}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : <p className="py-4 text-center text-xs text-slate-400">No messages yet.</p>}

                  {!isResolved(detail.status) ? (
                    <div className="flex gap-2 pt-2">
                      <Textarea placeholder="Send a message..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="min-h-[60px]" />
                      <Button size="icon" className="shrink-0 self-end h-10 w-10" disabled={!noteText.trim() || noteSending} onClick={sendNote}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : <p className="pt-2 text-center text-xs text-slate-500">Dispute resolved — communication closed.</p>}
                  {noteErr && <p className="text-xs text-red-400">{noteErr}</p>}
                </CardContent>
              </Card>
            </MotionDiv>
          ) : (
            <MotionDiv key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[55vh] items-center justify-center">
              <p className="text-sm text-muted-foreground">Unable to load dispute.</p>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Evidence Viewer</DialogTitle>
            <DialogDescription className="truncate">
              {selectedEvidence?.description || 'View uploaded evidence file'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 min-h-[300px] rounded-xl border border-white/10 bg-slate-900/50">
            {selectedEvidence?.evidenceType === 'IMAGE' ? (
              <div className="relative h-full w-full flex items-center justify-center">
                <img 
                  src={`https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80&fit=crop`} 
                  alt="Evidence placeholder" 
                  className="max-h-[400px] max-w-full rounded-lg object-contain shadow-md"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none" />
                <Badge variant="secondary" className="absolute bottom-2 right-2 opacity-80">Simulation Preview</Badge>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-indigo-500/10 mb-4">
                  <FileText className="h-10 w-10 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-white">{selectedEvidence?.evidenceType} Document</p>
                <p className="text-xs text-slate-400 mt-1">Preview not available for this file type.</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  <Download className="h-4 w-4" /> Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
