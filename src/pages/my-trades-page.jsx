import { Fragment, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ban, ChevronDown, ChevronRight, Download, Search, SlidersHorizontal } from 'lucide-react'
import AnimatedPage from '@/components/animated-page'
import TradeRowDetails from '@/components/my-trades/trade-row-details'
import TradeStatusVisual from '@/components/my-trades/trade-status-visual'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trades } from '@/data/mock'

const filters = ['ALL', 'HOLD', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const MotionDiv = motion.div

const toCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const normalizeDate = (value) => {
  const parsed = Date.parse(value.replace(' ', 'T'))
  return Number.isNaN(parsed) ? 0 : parsed
}

const formatDate = (value) => {
  const parsed = normalizeDate(value)
  if (!parsed) {
    return value
  }

  return new Date(parsed).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const nowTimestamp = () => {
  const date = new Date()
  const pad = (num) => String(num).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`

export default function MyTradesPage() {
  const [tableTrades, setTableTrades] = useState(trades)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [expandedTradeId, setExpandedTradeId] = useState(null)
  const [selectedTradeIds, setSelectedTradeIds] = useState([])

  const filteredTrades = useMemo(() => {
    const base = tableTrades.filter((trade) => {
      const matchesFilter = activeFilter === 'ALL' || trade.status === activeFilter
      const matchesQuery =
        !query ||
        [trade.id, trade.product, trade.partner].some((field) =>
          field.toLowerCase().includes(query.toLowerCase()),
        )

      return matchesFilter && matchesQuery
    })

    return [...base].sort((a, b) => {
      if (sortBy === 'price') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }

      const dateDiff = normalizeDate(a.updatedAt) - normalizeDate(b.updatedAt)
      return sortDirection === 'asc' ? dateDiff : -dateDiff
    })
  }, [tableTrades, activeFilter, query, sortBy, sortDirection])

  const visibleTradeIds = filteredTrades.map((trade) => trade.id)
  const allVisibleSelected =
    visibleTradeIds.length > 0 && visibleTradeIds.every((id) => selectedTradeIds.includes(id))

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(key)
    setSortDirection('desc')
  }

  const toggleSelectVisible = () => {
    if (!visibleTradeIds.length) {
      return
    }

    setSelectedTradeIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleTradeIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleTradeIds]))
    })
  }

  const toggleSelectOne = (tradeId) => {
    setSelectedTradeIds((current) => {
      if (current.includes(tradeId)) {
        return current.filter((id) => id !== tradeId)
      }
      return [...current, tradeId]
    })
  }

  const onBulkCancel = () => {
    if (!selectedTradeIds.length) {
      return
    }

    setTableTrades((current) =>
      current.map((trade) =>
        selectedTradeIds.includes(trade.id)
          ? {
              ...trade,
              status: 'CANCELLED',
              updatedAt: nowTimestamp(),
            }
          : trade,
      ),
    )

    setSelectedTradeIds([])
  }

  const onExport = () => {
    const rows = selectedTradeIds.length
      ? tableTrades.filter((trade) => selectedTradeIds.includes(trade.id))
      : filteredTrades

    if (!rows.length) {
      return
    }

    const headers = ['Trade ID', 'Product', 'Partner', 'Status', 'Amount', 'Date']
    const csvRows = rows.map((trade) =>
      [trade.id, trade.product, trade.partner, trade.status, trade.amount, trade.updatedAt]
        .map(csvEscape)
        .join(','),
    )

    const csv = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `trusttrade-my-trades-${Date.now()}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatedPage className="space-y-6">
      <PageHeader
        title="My Trades"
        subtitle="Powerful trade operations with filters, sorting, bulk actions, and expandable details."
      />

      <Card interactive={false}>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="h-auto flex-wrap justify-start gap-1 p-1">
              {filters.map((filter) => (
                <TabsTrigger key={filter} value={filter} className="data-[state=active]:shadow-glow">
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="pl-9"
                placeholder="Search by trade ID, product, or partner"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={sortBy === 'price' ? 'default' : 'secondary'}
                onClick={() => toggleSort('price')}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Price {sortBy === 'price' ? `(${sortDirection === 'asc' ? 'Low-High' : 'High-Low'})` : ''}
              </Button>

              <Button
                type="button"
                size="sm"
                variant={sortBy === 'date' ? 'default' : 'secondary'}
                onClick={() => toggleSort('date')}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Date {sortBy === 'date' ? `(${sortDirection === 'asc' ? 'Old-New' : 'New-Old'})` : ''}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm text-muted-foreground">
              {selectedTradeIds.length} selected · {filteredTrades.length} visible
            </p>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={onExport}>
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={!selectedTradeIds.length}
                onClick={onBulkCancel}
              >
                <Ban className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-transparent"
                      checked={allVisibleSelected}
                      onChange={toggleSelectVisible}
                    />
                  </TableHead>
                  <TableHead>Trade ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTrades.map((trade) => {
                  const isExpanded = expandedTradeId === trade.id
                  const isSelected = selectedTradeIds.includes(trade.id)
                  const formattedAmount = toCurrency(trade.amount)
                  const formattedDate = formatDate(trade.updatedAt)

                  return (
                    <Fragment key={trade.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpandedTradeId((current) => (current === trade.id ? null : trade.id))}
                      >
                        <TableCell
                          onClick={(event) => {
                            event.stopPropagation()
                          }}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-transparent"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(trade.id)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{trade.id}</TableCell>
                        <TableCell>{trade.product}</TableCell>
                        <TableCell>{trade.partner}</TableCell>
                        <TableCell>
                          <TradeStatusVisual status={trade.status} />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">{formattedAmount}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formattedDate}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
                        </TableCell>
                      </TableRow>

                      <tr>
                        <td colSpan={8} className="p-0">
                          <AnimatePresence initial={false}>
                            {isExpanded ? (
                              <MotionDiv
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden border-t border-white/10"
                              >
                                <TradeRowDetails
                                  trade={trade}
                                  formattedAmount={formattedAmount}
                                  formattedDate={formattedDate}
                                />
                              </MotionDiv>
                            ) : null}
                          </AnimatePresence>
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
              No trades match your current filters.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
