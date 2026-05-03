'use client'

import { useState, useCallback } from 'react'
import { Scale, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { JobsQueue } from '@/components/bridge/jobs-queue'
import { ScaleDisplay } from '@/components/bridge/scale-display'
import { TicketPanel } from '@/components/bridge/ticket-panel'

interface SelectedJob {
  id: string
  ticketNumber: string
  plateNumber: string
}

export default function BridgePage() {
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null)
  const [currentWeight, setCurrentWeight] = useState(0)
  const [isStable, setIsStable] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleWeightChange = useCallback((kg: number, stable: boolean) => {
    setCurrentWeight(kg)
    setIsStable(stable)
  }, [])

  function handleWeightSaved() {
    setSelectedJob(null)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-zinc-300" />
          <h1 className="text-base font-semibold text-white">Weighbridge Terminal</h1>
        </div>
        <div className="flex items-center gap-3">
          {selectedJob ? (
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-semibold">{selectedJob.plateNumber}</span>
              <span className="text-zinc-500">·</span>
              <span className="font-mono text-sm text-zinc-400">{selectedJob.ticketNumber}</span>
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs">Select a job from queue</Badge>
          )}
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Active Jobs Queue */}
        <div className="w-64 flex-shrink-0 border-r border-zinc-200 bg-white overflow-hidden flex flex-col">
          <div className="px-3 py-2.5 border-b border-zinc-100 flex-shrink-0">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Active Jobs</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <JobsQueue
              key={refreshKey}
              selectedId={selectedJob?.id ?? null}
              onSelect={(job) => setSelectedJob({ id: job.id, ticketNumber: job.ticketNumber, plateNumber: job.plateNumber })}
            />
          </div>
        </div>

        {/* CENTER: Scale Display */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-8 gap-6">
          <ScaleDisplay onWeightChange={handleWeightChange} />

          {!selectedJob && (
            <div className="mt-4 text-center text-zinc-600">
              <p className="text-sm">← Select a job from the queue</p>
              <p className="text-xs mt-1 text-zinc-700">to enable weight capture</p>
            </div>
          )}
        </div>

        {/* RIGHT: Ticket Details + Actions */}
        <div className="w-72 flex-shrink-0 border-l border-zinc-200 bg-white overflow-hidden">
          {selectedJob ? (
            <TicketPanel
              ticketId={selectedJob.id}
              currentWeight={currentWeight}
              isStable={isStable}
              onWeightSaved={handleWeightSaved}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center">
              <Scale className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No job selected</p>
              <p className="text-xs mt-1">Select a job from the Active Jobs queue on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
