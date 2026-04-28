"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FlaskConical,
  Gauge,
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
  onWeightCaptured?: (eventId: string) => void;
}

const DEMO_BASE = 24_850;

export function StationBridgePanel({
  devices,
  activeSessionId,
  captureKind = "first_weight",
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

  useEffect(() => {
    if (isDesktopBridge || !demoActive) {
      if (demoRef.current) clearInterval(demoRef.current);
      if (!demoActive) {
        // Reset to null so the fallback message shows when demo off and no bridge
        if (!isDesktopBridge) setReading(null);
      }
      return;
    }

    demoRef.current = setInterval(() => {
      const fluctuation = demoStable ? 0 : Math.floor(Math.random() * 100) - 50;
      const value = DEMO_BASE + fluctuation;
      setReading({
        raw: `+${value}kg N`,
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
  }, [isDesktopBridge, demoActive, demoStable]);

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
  const displayWeight = useMemo(
    () => activeReading.value.toLocaleString(),
    [activeReading.value],
  );
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
      setBridgeError(
        "Open the Electron station app to reconnect the XK3190-DS1 indicator.",
      );
      return;
    }
    try {
      setIsReconnecting(true);
      const nextReading = await station.reconnectScale();
      setReading(nextReading);
      setBridgeError(null);
    } catch (error) {
      setBridgeError(
        error instanceof Error ? error.message : "Scale reconnect failed.",
      );
    } finally {
      setIsReconnecting(false);
    }
  }

  async function confirmStableWeight() {
    if (!stable) return;

    setConfirmedReading(activeReading);
    setConfirmedAt(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );

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
      onWeightCaptured?.(result.event.id);
    } catch (error) {
      setBridgeError(
        error instanceof Error ? error.message : "Weight save failed.",
      );
    } finally {
      setIsSavingWeight(false);
    }
  }

  const showDemoControls = !isDesktopBridge;

  return (
    <Card>
      <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Station control</CardTitle>
          <CardDescription>
            {isDesktopBridge
              ? "Live XK3190-DS1 readings via Electron desktop bridge."
              : "Web mode — connect the Electron station app, or use demo mode below."}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={stable ? "success" : "destructive"}>
            {stable ? "stable" : "unstable"}
          </Badge>
          <Badge variant={isDesktopBridge ? "success" : demoActive ? "warning" : "outline"}>
            {isDesktopBridge ? "desktop bridge" : demoActive ? "demo mode" : "web mode"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 xl:grid-cols-[1fr_340px]">
        {/* ── Scale display ─────────────────────────────────────── */}
        <section
          className={`grid min-h-[320px] place-items-center rounded-lg border p-6 text-center shadow-inner transition-colors ${
            stable
              ? "border-emerald-500/30 bg-zinc-950 text-lime-200"
              : "border-zinc-700 bg-zinc-950 text-lime-200/70"
          }`}
        >
          <div>
            <Gauge
              className={`mx-auto mb-4 h-8 w-8 ${stable ? "text-lime-300" : "text-lime-200/50"}`}
            />
            <div
              className={`font-mono text-7xl font-semibold leading-none tracking-tight transition-all max-sm:text-5xl ${
                stable ? "text-lime-200" : "text-lime-200/60"
              }`}
            >
              {displayWeight}
            </div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-widest">
              {activeReading.unit}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
              <Badge
                variant="outline"
                className={`border-lime-200/30 text-lime-100/70 ${
                  stable ? "bg-lime-200/15" : "bg-zinc-800"
                }`}
              >
                {stable ? "Stable reading" : "Waiting for stability"}
              </Badge>
              <Badge
                variant="outline"
                className="border-lime-200/20 bg-zinc-800 text-lime-100/50"
              >
                {capturedAt}
              </Badge>
            </div>

            {/* Demo mode — stabilize button on display */}
            {demoActive && !isDesktopBridge && (
              <button
                className={`mt-5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                  demoStable
                    ? "bg-lime-200/20 text-lime-100 hover:bg-lime-200/30"
                    : "bg-amber-500/30 text-amber-200 hover:bg-amber-500/40"
                }`}
                onClick={() => setDemoStable((v) => !v)}
              >
                {demoStable ? "Weight is stable — click to fluctuate" : "Click to stabilise demo weight"}
              </button>
            )}
          </div>
        </section>

        {/* ── Sidebar controls ──────────────────────────────────── */}
        <aside className="grid content-start gap-3">
          {/* Bridge status */}
          <div className="flex items-center justify-between rounded-md border p-3 text-sm">
            <div>
              <div className="font-medium">Desktop bridge</div>
              <div className="text-xs text-muted-foreground">
                {isDesktopBridge
                  ? "Electron preload connected"
                  : "Waiting for station app"}
              </div>
            </div>
            <MonitorSmartphone
              className={`h-5 w-5 ${
                isDesktopBridge ? "text-emerald-500" : "text-muted-foreground"
              }`}
            />
          </div>

          {/* Raw frame + lock status */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-muted p-3">
              <div className="text-xs text-muted-foreground">Raw frame</div>
              <div className="truncate font-mono text-xs">{activeReading.raw}</div>
            </div>
            <div className="rounded-md bg-muted p-3">
              <div className="text-xs text-muted-foreground">Lock status</div>
              <div className="text-sm font-medium">
                {confirmedAt ? "Confirmed" : activeSessionId ? "Ready" : "No active ticket"}
              </div>
            </div>
          </div>

          {/* Capture kind */}
          {activeSessionId && (
            <div className="rounded-md border bg-primary/5 px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Next capture: </span>
              <span className="font-medium">
                {captureKind === "first_weight" ? "First weight" : "Second weight"}
              </span>
            </div>
          )}

          {/* Confirmed reading */}
          {confirmedReading && (
            <div className="flex gap-3 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Locked {confirmedReading.value.toLocaleString()} {confirmedReading.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Confirmed at {confirmedAt}
                </div>
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
                  <Badge variant="secondary">{device.status}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
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
              disabled={!stable || isSavingWeight}
            >
              <Scale />
              {isSavingWeight ? "Saving…" : "Confirm stable weight"}
            </Button>
          </div>

          {/* Demo mode controls (web only) */}
          {showDemoControls && (
            <div className="rounded-md border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FlaskConical className="h-4 w-4 text-amber-500" />
                Demo mode
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Simulates XK3190-DS1 readings so you can test the full workflow
                without hardware. Connect the Electron station app to use a real scale.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant={demoActive ? "destructive" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setDemoActive((v) => !v);
                    setDemoStable(false);
                    if (demoActive) setReading(null);
                  }}
                >
                  {demoActive ? "Stop demo" : "Start demo weight"}
                </Button>
              </div>
            </div>
          )}
        </aside>
      </CardContent>
    </Card>
  );
}
