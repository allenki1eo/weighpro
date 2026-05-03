'use client'

import { useState } from 'react'
import { VehicleLookup } from '@/components/gate/vehicle-lookup'
import { JobForm } from '@/components/gate/job-form'
import { DoorOpen, CheckCircle2, Clock, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { VehicleDTO } from '@weighpro/core'
import { fmt } from '@/lib/utils'

interface CreatedJob {
  id: string
  ticketNumber: string
  createdAt: Date
}

export default function GatePage() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDTO | null>(null)
  const [createdJobs, setCreatedJobs] = useState<CreatedJob[]>([])

  function handleJobCreated(id: string, ticketNumber: string) {
    setCreatedJobs((prev) => [{ id, ticketNumber, createdAt: new Date() }, ...prev.slice(0, 4)])
    setSelectedVehicle(null) // reset for next job
  }

  function handlePrint(ticketNumber: string) {
    window.print()
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <DoorOpen className="w-5 h-5 text-zinc-600" />
          <h1 className="text-base font-semibold text-zinc-900">Gate Terminal</h1>
          <Badge variant="warning" className="text-xs">Job Creation</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Clock className="w-4 h-4" />
          <ClientTime />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[420px] flex-shrink-0 border-r border-zinc-200 bg-white overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Step 1: Vehicle */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900 text-white text-xs font-bold">1</span>
                <h2 className="text-sm font-semibold text-zinc-900">Vehicle</h2>
              </div>
              <VehicleLookup onVehicleSelected={setSelectedVehicle} />
            </section>

            {/* Step 2: Job */}
            {selectedVehicle && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900 text-white text-xs font-bold">2</span>
                  <h2 className="text-sm font-semibold text-zinc-900">Job Setup</h2>
                </div>
                <JobForm
                  vehicle={selectedVehicle}
                  onJobCreated={handleJobCreated}
                  onClear={() => setSelectedVehicle(null)}
                />
              </section>
            )}
          </div>
        </div>

        {/* Right panel — recent jobs */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-xl">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
              Today&apos;s Jobs (this session)
            </h2>

            {createdJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <DoorOpen className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No jobs created yet in this session</p>
                <p className="text-xs mt-1">Use the form on the left to register a vehicle and create a job</p>
              </div>
            ) : (
              <div className="space-y-3">
                {createdJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm font-mono">{job.ticketNumber}</p>
                      <p className="text-xs text-zinc-500">{fmt(job.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(job.ticketNumber)}
                        className="gap-1.5 text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> Gate Pass
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`/tickets/${job.id}`} className="text-xs">View</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientTime() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'))
  if (typeof window !== 'undefined') {
    setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000)
  }
  return <span className="font-mono">{time}</span>
}
