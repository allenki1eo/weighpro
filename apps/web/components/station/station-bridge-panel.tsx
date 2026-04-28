"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FlaskConical,
  MonitorSmartphone,
  RefreshCcw,
  Scale,
  WifiOff,
} from "lucide-react";
import type { WeightReading } from "@/types/weight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StationDevice {
  name: string;
  status: string;
  detail: string;
}

interface StationBridgePanelProps {
  devices: StationDevice[];
  activeSessionId?: string | null;
  captureKind?: "first_weight" | "second_weight" | "manual_adjustment";
  captureStep?: number;
  onWeightCaptured?: (eventId: string, weightKg: number) => void;
}

const DEMO_BASE = 24_850;

/* ── 7-segment style display helpers ─────────────────────────────── */
function SegmentDisplay({ value, unit }: { value: number; unit: string }) {
  const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div
      className="select-none font-mono"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {/* Indicator model label */}
      <div className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-lime-400/50">
        XK3190-DS1 · WeighPro Station 1
      </div>

      {/* Main digit display */}
      <div
        className="text-center leading-none tracking-tight"
        style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
      >
        <span className="text-lime-300" style={{ textShadow: "0 0 20px rgba(163,230,53,0.4)" }}>
          {formatted}
        </span>
      </div>

      {/* Unit */}
      <div className="mt-2 text-center text-base font-bold uppercase tracking-[0.3em] text-lime-400/80">
        {unit}
      </div>
    </div>
  );
}

export function StationBridgePanel({
  devices,
  activeSessionId,
  captureKind = "first_weight",
  captureStep = 0,
  onWeightCaptured,
}: StationBridgePanelProps) {
  const [reading, setReading] = useState<WeightReading | null>(null);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [isDesktopBridge, setIsDesktopBridge] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [confirmedReading, setConfirmedReading] = useState<WeightReading | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  /* ── Demo mode ─────────────────────────────────────────────── */
  const [demoActive, setDemoActive] = useState(false);
  const [demoStable, setDemoStable] = useState(false);
  const demoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo weight varies by step to simulate real vehicle
  const demoBase = captureKind === "second_weight" ? 5_120 : DEMO_BASE;

  useEffect(() => {
    if (isDesktopBridge || !demoActive) {
      if (demoRef.current) clearInterval(demoRef.current);
      if (!demoActive && !isDesktopBridge) setReading(null);
      return;
    }

    demoRef.current = setInterval(() => {
      const fluctuation = demoStable ? 0 : Math.floor(Math.random() * 80) - 40;
      const value = demoBase + fluctuation;
      setReading({
        raw: `${demoStable ? "ST" : "US"} +${value}kg`,
        value,
        unit: "kg",
        stable: demoStable,
        capturedAt: new Date().toISOString(),
      });
      setConfirmedReading(null);
      setConfirmedAt(null);
    }, 400);

    return () => {
      if (demoRef.current) clearInterval(demoRef.current);
    };
  }, [isDesktopBridge, demoActive, demoStable, demoBase]);

  /* ── Desktop bridge ─────────────────────────────────────────── */
  useEffect(() => {
    const station = window.weighproStation;
    if (!station) return;

    setIsDesktopBridge(true);
    station
      .getLastReading()
      .then(setReading)
      .catch((error: Error) => setBridgeError(error.message));

    const removeReadingListener = station.onScaleReading((nextReading) => {
      setReading(nextReading);
      setConfirmedReading(null);
      setConfirmedAt(null);
      setBridgeError(null);
    });
    const removeErrorListener = station.onScaleError((message) =>
      setBridgeError(message),
    );

    return () => {
      removeReadingListener();
      removeErrorListener();
    };
  }, []);

  /* ── Derived display ────────────────────────────────────────── */
  const fallbackReading: WeightReading = useMemo(
    () => ({
      raw: "WAITING FOR XK3190-DS1",
      value: 0,
      unit: "kg",
      stable: false,
      capturedAt: new Date().toISOString(),
    }),
    [],
  );

  const activeReading = reading ?? fallbackReading;
  const stable = activeReading.stable;
  const capturedAt = new Date(activeReading.capturedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  /* ── Actions ────────────────────────────────────────────────── */
  async function reconnectScale() {
    const station = window.weighproStation;
    if (!station) {
      setBridgeError("Open the Electron station app to reconnect the XK3190-DS1 indicator.");
      return;
    }
    try {
      setIsReconnecting(true);
      const nextReading = await station.reconnectScale();
      setReading(nextReading);
      setBridgeError(null);
    } catch (error) {
      setBridgeError(error instanceof Error ? error.message : "Scale reconnect failed.");
    } finally {
      setIsReconnecting(false);
    }
  }

  async function confirmStableWeight() {
    if (!stable) return;

    const ts = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setConfirmedReading(activeReading);
    setConfirmedAt(ts);

    if (!activeSessionId) return;

    try {
      setIsSavingWeight(true);
      const response = await fetch("/api/weigh-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          kind: captureKind,
          weightKg: activeReading.value,
          rawIndicatorFrame: activeReading.raw,
          stable: activeReading.stable,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Weight save failed.");
      onWeightCaptured?.(result.event.id, activeReading.value);
    } catch (error) {
      setBridgeError(error instanceof Error ? error.message : "Weight save failed.");
    } finally {
      setIsSavingWeight(false);
    }
  }

  const stepLabel =
    captureStep === 1
      ? "Awaiting first weight (entrance / laden)"
      : captureStep === 2
      ? "Awaiting second weight (exit / tare)"
      : captureStep === 3
      ? "Ticket complete"
      : "No active ticket — open a ticket first";

  const noTicket = !activeSessionId;

  return (
    <Card className="flex flex-col">
      <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Scale indicator</CardTitle>
          <CardDescription>
            {isDesktopBridge
              ? "Live XK3190-DS1 readings via Electron desktop bridge."
              : "Web mode — connect Electron station app or use demo mode."}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={stable ? "success" : "destructive"}>
            {stable ? "stable" : "unstable"}
          </Badge>
          <Badge variant={isDesktopBridge ? "success" : demoActive ? "warning" : "outline"}>
            {isDesktopBridge ? "live bridge" : demoActive ? "demo" : "disconnected"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 xl:grid xl:grid-cols-[1fr_300px]">
        {/* ── Scale display ─────────────────────────────────────── */}
        <section
          className={`grid min-h-[300px] place-items-center rounded-lg border p-6 text-center shadow-inner transition-colors ${
            stable
              ? "border-lime-500/40 bg-zinc-950"
              : "border-zinc-700 bg-zinc-950"
          }`}
        >
          <div className="w-full">
            <SegmentDisplay
              value={activeReading.value}
              unit={activeReading.unit}
            />

            {/* Stability + time badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  stable
                    ? "border-lime-500/40 bg-lime-500/15 text-lime-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${stable ? "bg-lime-400 animate-pulse" : "bg-amber-400"}`}
                />
                {stable ? "Reading stable" : "Stabilising…"}
              </span>
              <span className="inline-flex items-center rounded-full border border-lime-200/20 bg-zinc-800 px-3 py-1 text-xs text-lime-100/50">
                {capturedAt}
              </span>
            </div>

            {/* Raw frame */}
            <div className="mt-3 font-mono text-[10px] text-lime-400/30 tracking-widest">
              {activeReading.raw}
            </div>

            {/* Demo stabilise button */}
            {demoActive && !isDesktopBridge && (
              <button
                className={`mt-4 rounded-md px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  demoStable
                    ? "bg-lime-500/20 text-lime-200 hover:bg-lime-500/30"
                    : "bg-amber-500/25 text-amber-200 hover:bg-amber-500/35"
                }`}
                onClick={() => setDemoStable((v) => !v)}
              >
                {demoStable ? "Weight stable — click to fluctuate" : "Click to stabilise demo weight"}
              </button>
            )}
          </div>
        </section>

        {/* ── Sidebar controls ──────────────────────────────────── */}
        <aside className="grid content-start gap-3">
          {/* Step context */}
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              noTicket ? "border-dashed text-muted-foreground" : "border-primary/30 bg-primary/5"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
              {noTicket ? "No active ticket" : captureKind === "first_weight" ? "Step 2 — First weight" : "Step 3 — Second weight"}
            </p>
            <p className="text-xs">{stepLabel}</p>
          </div>

          {/* Bridge status */}
          <div className="flex items-center justify-between rounded-md border p-3 text-sm">
            <div>
              <div className="font-medium">Desktop bridge</div>
              <div className="text-xs text-muted-foreground">
                {isDesktopBridge ? "Electron preload connected" : "Waiting for station app"}
              </div>
            </div>
            <MonitorSmartphone
              className={`h-5 w-5 ${isDesktopBridge ? "text-emerald-500" : "text-muted-foreground"}`}
            />
          </div>

          {/* Confirmed reading */}
          {confirmedReading && (
            <div className="flex gap-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <div className="font-semibold">
                  Locked: {confirmedReading.value.toLocaleString()} {confirmedReading.unit}
                </div>
                <div className="text-xs text-muted-foreground">Confirmed at {confirmedAt}</div>
              </div>
            </div>
          )}

          {/* Bridge error */}
          {bridgeError && (
            <div className="flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{bridgeError}</span>
            </div>
          )}

          {/* Devices list */}
          {devices.length > 0 && (
            <div className="grid gap-2">
              {devices.map((device) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={device.name}
                >
                  <div>
                    <div className="text-sm font-medium">{device.name}</div>
                    <div className="text-xs text-muted-foreground">{device.detail}</div>
                  </div>
                  <Badge variant={device.status === "online" ? "success" : "outline"}>
                    {device.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={reconnectScale}
              disabled={isReconnecting || !isDesktopBridge}
            >
              <RefreshCcw className={isReconnecting ? "animate-spin" : ""} />
              {isReconnecting ? "Reconnecting…" : "Reconnect scale"}
            </Button>

            <Button
              onClick={confirmStableWeight}
              disabled={!stable || isSavingWeight || noTicket}
              className="h-12 text-base font-bold"
            >
              <Scale className="h-5 w-5" />
              {isSavingWeight
                ? "Saving…"
                : noTicket
                ? "Open a ticket first"
                : `Capture ${captureKind === "first_weight" ? "entrance" : "exit"} weight`}
            </Button>
          </div>

          {/* Demo mode controls */}
          {!isDesktopBridge && (
            <div className="rounded-md border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FlaskConical className="h-4 w-4 text-amber-500" />
                Demo mode
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Simulates XK3190-DS1 readings for testing the full workflow without
                physical hardware.
              </p>
              <Button
                variant={demoActive ? "destructive" : "outline"}
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  setDemoActive((v) => !v);
                  setDemoStable(false);
                  if (demoActive) setReading(null);
                }}
              >
                {demoActive ? "Stop demo" : "Start demo weight"}
              </Button>
            </div>
          )}
        </aside>
      </CardContent>
    </Card>
  );
}
