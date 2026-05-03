'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, timeAgo, OP_LABELS, fmtWeight } from '@/lib/utils'

interface QueueItem {
  id: string
  ticketNumber: string
  plateNumber: string
  driverName: string
  operationType: string
  module: string
  partyName: string
  status: string
  firstWeight: number | null
  createdAt: string
}

interface JobsQueueProps {
  selectedId: string | null
  onSelect: (job: QueueItem) => void
}

export function JobsQueue({ selectedId, onSelect }: JobsQueueProps) {
  const [items, setItems] = useState<QueueItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // Fetch both PENDING and FIRST_WEIGHT_SAVED
      const [pending, awaiting] = await Promise.all([
        fetch('/api/tickets?status=PENDING&limit=30').then((r) => r.json()),
        fetch('/api/tickets?status=FIRST_WEIGHT_SAVED&limit=30').then((r) => r.json()),
      ])
      setItems([...(pending.items ?? []), ...(awaiting.items ?? [])])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15_000)
    return () => clearInterval(interval)
  }, [load])

  const filtered = items.filter((item) => {
    if (!search) return true
    const q = search.toUpperCase()
    return item.plateNumber.includes(q) || item.ticketNumber.includes(q) || item.partyName.toUpperCase().includes(q)
  })

  const pending = filtered.filter((i) => i.status === 'PENDING')
  const awaiting = filtered.filter((i) => i.status === 'FIRST_WEIGHT_SAVED')

  function QueueCard({ item }: { item: QueueItem }) {
    const isSelected = selectedId === item.id
    const isAwaiting = item.status === 'FIRST_WEIGHT_SAVED'

    return (
      <button
        onClick={() => onSelect(item)}
        className={cn(
          'w-full text-left p-3 rounded-xl border-2 transition-all',
          isSelected
            ? isAwaiting
              ? 'border-purple-500 bg-purple-50'
              : 'border-orange-500 bg-orange-50'
            : isAwaiting
            ? 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50'
            : 'border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50'
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="font-mono font-semibold text-xs text-zinc-700">{item.ticketNumber}</span>
          <Badge
            variant={item.module === 'COTTON' ? 'cotton' : 'beverage'}
            className="text-xs flex-shrink-0"
          >
            {item.module}
          </Badge>
        </div>
        <p className="font-bold text-sm tracking-wider mt-0.5">{item.plateNumber}</p>
        <p className="text-xs text-zinc-600 truncate">{OP_LABELS[item.operationType] ?? item.operationType}</p>
        <p className="text-xs text-zinc-500 truncate">{item.partyName}</p>
        <div className="flex items-center justify-between mt-1.5">
          {isAwaiting && item.firstWeight != null && (
            <span className="text-xs font-mono text-purple-700 font-semibold">
              1st: {fmtWeight(item.firstWeight)}
            </span>
          )}
          <span className="text-xs text-zinc-400 flex items-center gap-1 ml-auto">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(item.createdAt)}
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-zinc-200 flex-shrink-0">
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate, ticket…"
            className="pl-8 h-8 text-sm"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>

      {/* Queue sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Awaiting second weight — show first (priority) */}
        {awaiting.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                2nd Weight Needed ({awaiting.length})
              </h3>
            </div>
            <div className="space-y-2">
              {awaiting.map((item) => <QueueCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* Awaiting first weight */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                1st Weight ({pending.length})
              </h3>
            </div>
            <div className="space-y-2">
              {pending.map((item) => <QueueCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-8 text-zinc-400">
            <p className="text-sm">No active jobs</p>
            <p className="text-xs mt-1">Jobs created at Gate will appear here</p>
          </div>
        )}
      </div>

      {/* Refresh */}
      <div className="p-2 border-t border-zinc-100 flex-shrink-0">
        <button
          onClick={load}
          className={cn('w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all', loading && 'text-blue-500')}
        >
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
          {loading ? 'Refreshing…' : 'Refresh queue'}
        </button>
      </div>
    </div>
  )
}
