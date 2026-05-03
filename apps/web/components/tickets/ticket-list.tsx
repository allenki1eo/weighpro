'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, fmt, fmtWeight, STATUS_COLORS, STATUS_LABELS, OP_LABELS } from '@/lib/utils'

interface TicketItem {
  id: string
  ticketNumber: string
  module: string
  operationType: string
  status: string
  plateNumber: string
  driverName: string
  partyName: string
  firstWeight: number | null
  secondWeight: number | null
  netWeight: number | null
  clerkName: string
  createdAt: string
  completedAt: string | null
}

interface TicketListProps {
  initialData: {
    tickets: TicketItem[]
    total: number
    page: number
    pages: number
  }
  userRole: string
}

export function TicketList({ initialData, userRole: _ }: TicketListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('plate') ?? '')

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'ALL') params.set(key, value)
    else params.delete(key)
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('plate', search)
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const statusFilter = searchParams.get('status') ?? ''
  const moduleFilter = searchParams.get('module') ?? ''

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-48 max-w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Search plate…"
            className="pl-9 h-9 text-sm"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <Select value={statusFilter || 'ALL'} onValueChange={(v) => updateParam('status', v)}>
            <SelectTrigger className="h-9 text-sm w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FIRST_WEIGHT_SAVED">Awaiting 2nd Weight</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={moduleFilter || 'ALL'} onValueChange={(v) => updateParam('module', v)}>
            <SelectTrigger className="h-9 text-sm w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Modules</SelectItem>
              <SelectItem value="COTTON">Cotton</SelectItem>
              <SelectItem value="BEVERAGE">Beverage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Ticket #</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Net Weight</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Clerk</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold">{ticket.ticketNumber}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold text-sm tracking-wider">{ticket.plateNumber}</span>
                  <p className="text-xs text-zinc-400">{ticket.driverName}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={ticket.module === 'COTTON' ? 'cotton' : 'beverage'}
                      className="text-xs w-fit"
                    >
                      {ticket.module}
                    </Badge>
                    <span className="text-xs text-zinc-500">{OP_LABELS[ticket.operationType] ?? ticket.operationType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{ticket.partyName}</span>
                </TableCell>
                <TableCell>
                  <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', STATUS_COLORS[ticket.status])}>
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn('font-mono font-semibold', ticket.netWeight ? 'text-emerald-700' : 'text-zinc-300')}>
                    {fmtWeight(ticket.netWeight)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-500">{fmt(ticket.createdAt, 'dd MMM, HH:mm')}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-500">{ticket.clerkName}</span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {initialData.tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-zinc-400 text-sm">
                  No tickets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {initialData.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Page {initialData.page} of {initialData.pages} · {initialData.total} tickets
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(initialData.page - 1)}
              disabled={initialData.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(initialData.page + 1)}
              disabled={initialData.page >= initialData.pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
