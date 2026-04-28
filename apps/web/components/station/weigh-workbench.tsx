"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, Plus, Search, Truck, X } from "lucide-react";
import { StationBridgePanel } from "@/components/station/station-bridge-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  firstWeightKg: number | null;
  secondWeightKg: number | null;
  deductionKg: number;
  driverName: string | null;
  transportCompany: string | null;
  movementType: string;
  customer: string | null;
  product: string | null;
}

interface VehicleSuggestion {
  plate: string;
  driver_name: string | null;
  transport_company: string | null;
  stored_tare_kg: number | null;
}

interface WeighWorkbenchProps {
  devices: StationDevice[];
}

const STEP_LABELS = ["Open ticket", "First weigh", "Second weigh", "Complete"];

type WorkflowStep = 0 | 1 | 2 | 3;

const inputCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60";
const selectCls = inputCls;

function fmtKg(kg: number | null): string {
  if (kg == null) return "—";
  return kg.toLocaleString() + " kg";
}

function netWeightKg(session: ActiveSession | null): number | null {
  if (!session) return null;
  const { firstWeightKg, secondWeightKg, deductionKg } = session;
  if (firstWeightKg == null || secondWeightKg == null) return null;
  return Math.abs(firstWeightKg - secondWeightKg) - deductionKg;
}

export function WeighWorkbench({ devices }: WeighWorkbenchProps) {
  const [step, setStep] = useState<WorkflowStep>(0);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [message, setMessage] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Vehicle lookup state
  const [plateDraft, setPlateDraft] = useState("");
  const [suggestions, setSuggestions] = useState<VehicleSuggestion[]>([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const lookupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Form refs
  const driverRef = useRef<HTMLInputElement>(null);
  const transportRef = useRef<HTMLInputElement>(null);
  const customerRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const referenceRef = useRef<HTMLInputElement>(null);
  const lotRef = useRef<HTMLInputElement>(null);
  const movementRef = useRef<HTMLSelectElement>(null);
  const directionRef = useRef<HTMLSelectElement>(null);
  const deductionRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const lookupPlate = useCallback(async (plate: string) => {
    if (plate.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLookingUp(true);
    try {
      const res = await fetch(`/api/vehicles?plate=${encodeURIComponent(plate)}`);
      const json = await res.json();
      setSuggestions(json.vehicles ?? []);
      setShowSuggestions((json.vehicles ?? []).length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLookingUp(false);
    }
  }, []);

  function onPlateChange(value: string) {
    setPlateDraft(value);
    if (lookupTimeout.current) clearTimeout(lookupTimeout.current);
    lookupTimeout.current = setTimeout(() => lookupPlate(value), 350);
  }

  function selectSuggestion(v: VehicleSuggestion) {
    setPlateDraft(v.plate);
    if (driverRef.current) driverRef.current.value = v.driver_name ?? "";
    if (transportRef.current) transportRef.current.value = v.transport_company ?? "";
    setShowSuggestions(false);
    setSuggestions([]);
  }

  async function createSession() {
    const plate = plateDraft.trim();
    if (!plate) {
      setMessage({ kind: "error", text: "Vehicle plate is required." });
      return;
    }
    setIsCreating(true);
    setMessage(null);

    const deduction = parseFloat(deductionRef.current?.value ?? "0") || 0;

    try {
      const response = await fetch("/api/weigh-sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plate,
          driverName: driverRef.current?.value || undefined,
          transportCompany: transportRef.current?.value || undefined,
          movementType: movementRef.current?.value || "manual_weigh",
          direction: directionRef.current?.value || "inbound",
          customerName: customerRef.current?.value || undefined,
          product: productRef.current?.value || undefined,
          notes: [
            referenceRef.current?.value ? `Ref: ${referenceRef.current.value}` : "",
            lotRef.current?.value ? `Lot: ${lotRef.current.value}` : "",
            destinationRef.current?.value ? `Dest: ${destinationRef.current.value}` : "",
            notesRef.current?.value || "",
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
        }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "Could not create weigh session.");

      setActiveSession({
        id: result.session.id,
        ticketNo: result.session.ticket_no ?? null,
        plate: result.session.plate,
        status: result.session.status,
        firstWeightKg: null,
        secondWeightKg: null,
        deductionKg: deduction,
        driverName: driverRef.current?.value || null,
        transportCompany: transportRef.current?.value || null,
        movementType: movementRef.current?.value || "manual_weigh",
        customer: customerRef.current?.value || null,
        product: productRef.current?.value || null,
      });
      setStep(1);
      setMessage({ kind: "success", text: "Ticket opened. Drive vehicle onto platform and capture first stable weight." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not create weigh session." });
    } finally {
      setIsCreating(false);
    }
  }

  function handleWeightCaptured(eventId: string, weightKg: number) {
    if (step === 1) {
      setActiveSession((s) => s ? { ...s, firstWeightKg: weightKg, status: "awaiting_second_weight" } : s);
      setStep(2);
      setMessage({ kind: "info", text: "First weight saved. Vehicle may exit. Recall this ticket when the vehicle returns for second weigh." });
    } else if (step === 2) {
      setActiveSession((s) => s ? { ...s, secondWeightKg: weightKg, status: "completed" } : s);
      setStep(3);
      setMessage({ kind: "success", text: "Second weight saved. Ticket complete — print the weighbridge certificate." });
    }
  }

  function resetWorkbench() {
    setStep(0);
    setActiveSession(null);
    setMessage(null);
    setPlateDraft("");
    setSuggestions([]);
    // Clear all form fields
    [driverRef, transportRef, customerRef, productRef, destinationRef, referenceRef, lotRef, notesRef].forEach((r) => {
      if (r.current) r.current.value = "";
    });
    if (deductionRef.current) deductionRef.current.value = "0";
  }

  const captureKind: "first_weight" | "second_weight" =
    step === 2 ? "second_weight" : "first_weight";
  const net = netWeightKg(activeSession);

  return (
    <div className="grid gap-4 xl:grid-cols-[400px_1fr]">
      {/* ── Left panel: form + ticket state ───────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Step indicator */}
        <div className="flex items-center gap-1 text-xs">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0 transition-colors ${
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`hidden sm:inline font-medium ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Open ticket form */}
        {step === 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Register vehicle &amp; open ticket</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {/* Plate lookup */}
              <div className="relative" ref={suggestionsRef}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Vehicle plate <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    className={inputCls}
                    placeholder="e.g. T 234 ABC"
                    value={plateDraft}
                    onChange={(e) => onPlateChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    autoComplete="off"
                  />
                  {lookingUp && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!lookingUp && plateDraft && (
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    {suggestions.map((v) => (
                      <button
                        key={v.plate}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(v);
                        }}
                      >
                        <Truck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div>
                          <span className="font-mono font-semibold">{v.plate}</span>
                          {v.driver_name && (
                            <span className="ml-2 text-xs text-muted-foreground">{v.driver_name}</span>
                          )}
                          {v.stored_tare_kg && (
                            <span className="ml-2 rounded bg-amber-500/20 px-1 text-xs text-amber-600 dark:text-amber-400">
                              Stored tare {v.stored_tare_kg.toLocaleString()} kg
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Driver name</label>
                  <input ref={driverRef} className={inputCls} placeholder="Driver name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Transport company</label>
                  <input ref={transportRef} className={inputCls} placeholder="Transporter" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Movement type</label>
                  <select ref={movementRef} className={selectCls} defaultValue="raw_material_receipt">
                    <option value="raw_material_receipt">Raw material receipt</option>
                    <option value="raw_cotton_receipt">Raw cotton receipt</option>
                    <option value="finished_goods_dispatch">Finished goods dispatch</option>
                    <option value="production_transfer">Production transfer</option>
                    <option value="lint_bale_transfer">Lint bale transfer</option>
                    <option value="packaging_receipt">Packaging receipt</option>
                    <option value="return_or_empty_movement">Return / empty</option>
                    <option value="manual_weigh">Manual weigh</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Direction</label>
                  <select ref={directionRef} className={selectCls} defaultValue="inbound">
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                    <option value="internal">Internal transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Customer / Supplier / AMCOS</label>
                <input ref={customerRef} className={inputCls} placeholder="Counterparty name" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Product / Material</label>
                  <input ref={productRef} className={inputCls} placeholder="e.g. Seed cotton" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Destination</label>
                  <input ref={destinationRef} className={inputCls} placeholder="e.g. Warehouse A" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Reference / Lot no.</label>
                  <input ref={referenceRef} className={inputCls} placeholder="Ref / Lot" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Deduction (kg)</label>
                  <input ref={deductionRef} className={inputCls} type="number" min="0" placeholder="0" defaultValue="0" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes / remarks</label>
                <textarea
                  ref={notesRef}
                  className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Additional remarks…"
                />
              </div>

              <Button onClick={createSession} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isCreating ? "Opening ticket…" : "Open ticket"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Steps 1–3: Active session info */}
        {step > 0 && activeSession && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-mono">
                  {activeSession.ticketNo ?? activeSession.id.slice(0, 10)}
                </CardTitle>
                <Badge
                  variant={
                    step === 3
                      ? "success"
                      : step === 2
                      ? "warning"
                      : "info"
                  }
                >
                  {step === 3
                    ? "completed"
                    : step === 2
                    ? "2nd weigh"
                    : "1st weigh"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Vehicle</p>
                  <p className="font-mono font-semibold">{activeSession.plate}</p>
                </div>
                {activeSession.driverName && (
                  <div>
                    <p className="text-muted-foreground">Driver</p>
                    <p className="font-medium">{activeSession.driverName}</p>
                  </div>
                )}
                {activeSession.customer && (
                  <div>
                    <p className="text-muted-foreground">Customer / AMCOS</p>
                    <p className="font-medium">{activeSession.customer}</p>
                  </div>
                )}
                {activeSession.product && (
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="font-medium">{activeSession.product}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Weight summary */}
              <div className="rounded-md border overflow-hidden">
                <WeightRow
                  label="Entrance weight"
                  sub="First weighment"
                  value={fmtKg(activeSession.firstWeightKg)}
                  pending={activeSession.firstWeightKg == null}
                />
                <WeightRow
                  label="Exit weight"
                  sub="Second weighment"
                  value={fmtKg(activeSession.secondWeightKg)}
                  pending={activeSession.secondWeightKg == null}
                />
                {activeSession.deductionKg > 0 && (
                  <WeightRow
                    label="Deduction"
                    sub="Bag weight / adjustment"
                    value={`− ${fmtKg(activeSession.deductionKg)}`}
                    pending={false}
                  />
                )}
                <div className="flex items-center justify-between bg-primary/10 px-4 py-3 border-t">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">Net weight</p>
                    <p className="text-xs text-muted-foreground">
                      {activeSession.deductionKg > 0 ? "Entrance − Exit − Deduction" : "Entrance − Exit"}
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-extrabold tabular-nums ${
                      net != null ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {net != null ? net.toLocaleString() + " kg" : "—"}
                  </p>
                </div>
              </div>

              {step === 3 && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      const id = activeSession.ticketNo ?? activeSession.id;
                      window.open(`/tickets/${encodeURIComponent(id)}/certificate?print=1`, "_blank");
                    }}
                  >
                    Print certificate
                  </Button>
                  <Button variant="outline" onClick={resetWorkbench}>
                    <X className="h-4 w-4" />
                    New ticket
                  </Button>
                </div>
              )}

              {step < 3 && (
                <Button variant="outline" size="sm" onClick={resetWorkbench}>
                  <X className="h-4 w-4" />
                  Cancel &amp; clear
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Message banner */}
        {message && (
          <div
            className={`flex gap-2 rounded-md border px-3 py-2.5 text-sm ${
              message.kind === "error"
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : message.kind === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-primary/30 bg-primary/5 text-muted-foreground"
            }`}
          >
            {message.kind === "error" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : message.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : null}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* ── Right panel: scale display ─────────────────────────── */}
      <StationBridgePanel
        activeSessionId={step > 0 && step < 3 ? activeSession?.id : null}
        captureKind={captureKind}
        captureStep={step}
        devices={devices}
        onWeightCaptured={handleWeightCaptured}
      />
    </div>
  );
}

function WeightRow({
  label,
  sub,
  value,
  pending,
}: {
  label: string;
  sub: string;
  value: string;
  pending: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0">
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <p className={`tabular-nums font-semibold text-sm ${pending ? "text-muted-foreground" : ""}`}>
        {value}
      </p>
    </div>
  );
}
