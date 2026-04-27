"use client";

import { useState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { StationBridgePanel } from "@/components/station/station-bridge-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StationDevice {
  name: string;
  status: string;
  detail: string;
}

interface ActiveSession {
  id: string;
  ticketNo: string | null;
  plate: string;
  status: string;
}

interface WeighWorkbenchProps {
  devices: StationDevice[];
}

const inputClass =
  "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring";

export function WeighWorkbench({ devices }: WeighWorkbenchProps) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [captureKind, setCaptureKind] = useState<"first_weight" | "second_weight">("first_weight");
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function createSession(formData: FormData) {
    setIsCreating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/weigh-sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plate: formData.get("plate"),
          driverName: formData.get("driverName") || undefined,
          transportCompany: formData.get("transportCompany") || undefined,
          movementType: formData.get("movementType") || undefined,
          direction: formData.get("direction") || "inbound",
          customerName: formData.get("customerName") || undefined,
          product: formData.get("product") || undefined,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create weigh session.");
      }

      setActiveSession({
        id: result.session.id,
        ticketNo: result.session.ticket_no ?? null,
        plate: result.session.plate,
        status: result.session.status,
      });
      setCaptureKind("first_weight");
      setMessage("Ticket opened. Capture the first stable weight.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create weigh session.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleWeightCaptured() {
    if (captureKind === "first_weight") {
      setCaptureKind("second_weight");
      setMessage("First weight saved. Recall this plate for second weigh when the vehicle returns.");
      return;
    }

    setMessage("Second weight saved and ticket completed.");
    setActiveSession((current) => (current ? { ...current, status: "completed" } : current));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Open ticket</CardTitle>
          <CardDescription>Create a real station transaction before saving weight.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSession} className="grid gap-3">
            <input className={inputClass} name="plate" placeholder="Vehicle plate" required />
            <input className={inputClass} name="driverName" placeholder="Driver name" />
            <input className={inputClass} name="transportCompany" placeholder="Transport company" />
            <select className={inputClass} name="movementType" defaultValue="raw_material_receipt">
              <option value="raw_material_receipt">Raw material receipt</option>
              <option value="raw_cotton_receipt">Raw cotton receipt</option>
              <option value="finished_goods_dispatch">Finished goods dispatch</option>
              <option value="production_transfer">Production transfer</option>
              <option value="manual_weigh">Manual weigh</option>
            </select>
            <select className={inputClass} name="direction" defaultValue="inbound">
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="internal">Internal transfer</option>
            </select>
            <input className={inputClass} name="customerName" placeholder="Customer, supplier, or AMCOS" />
            <input className={inputClass} name="product" placeholder="Material or product" />
            <Button disabled={isCreating}><Plus />{isCreating ? "Opening ticket" : "Open ticket"}</Button>
          </form>

          <div className="mt-4 rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between gap-3"><div className="font-medium">Active ticket</div><Badge variant={activeSession ? "secondary" : "outline"}>{activeSession ? activeSession.status : "none"}</Badge></div>
            {activeSession ? <div className="mt-2 space-y-1 text-muted-foreground"><div className="font-mono">{activeSession.ticketNo ?? activeSession.id.slice(0, 8)}</div><div>{activeSession.plate}</div><div>{captureKind === "first_weight" ? "Next action: first weigh" : "Next action: second weigh"}</div></div> : <p className="mt-2 text-muted-foreground">No ticket is open yet.</p>}
          </div>

          {message ? <div className="mt-3 flex gap-2 rounded-md border p-3 text-sm text-muted-foreground"><ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" /><span>{message}</span></div> : null}
        </CardContent>
      </Card>

      <StationBridgePanel activeSessionId={activeSession?.id} captureKind={captureKind} devices={devices} onWeightCaptured={handleWeightCaptured} />
    </div>
  );
}
