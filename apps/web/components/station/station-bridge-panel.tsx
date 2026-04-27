"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Gauge, MonitorSmartphone, RefreshCcw, Scale, WifiOff } from "lucide-react";
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

export function StationBridgePanel({ devices, activeSessionId, captureKind = "first_weight", onWeightCaptured }: StationBridgePanelProps) {
  const [reading, setReading] = useState<WeightReading | null>(null);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [isDesktopBridge, setIsDesktopBridge] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [confirmedReading, setConfirmedReading] = useState<WeightReading | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
    const station = window.weighproStation;
    if (!station) return;

    setIsDesktopBridge(true);
    station.getLastReading().then(setReading).catch((error: Error) => setBridgeError(error.message));

    const removeReadingListener = station.onScaleReading((nextReading) => {
      setReading(nextReading);
      setConfirmedReading(null);
      setConfirmedAt(null);
      setBridgeError(null);
    });
    const removeErrorListener = station.onScaleError((message) => setBridgeError(message));

    return () => {
      removeReadingListener();
      removeErrorListener();
    };
  }, []);

  const fallbackReading: WeightReading = useMemo(
    () => ({ raw: "WAITING FOR XK3190-DS1", value: 0, unit: "kg", stable: false, capturedAt: new Date().toISOString() }),
    [],
  );
  const activeReading = reading ?? fallbackReading;
  const displayWeight = useMemo(() => activeReading.value.toLocaleString(), [activeReading.value]);
  const stable = activeReading.stable;
  const capturedAt = new Date(activeReading.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

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

    setConfirmedReading(activeReading);
    setConfirmedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

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
      setBridgeError(error instanceof Error ? error.message : "Weight save failed.");
    } finally {
      setIsSavingWeight(false);
    }
  }

  return (
    <Card>
      <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Station control</CardTitle>
          <CardDescription>XK3190-DS1 live weight first, then cameras, sync, and clerk actions.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={stable ? "secondary" : "destructive"}>{stable ? "stable" : "unstable"}</Badge>
          <Badge variant={isDesktopBridge ? "secondary" : "outline"}>{isDesktopBridge ? "desktop bridge" : "web mode"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <section className="grid min-h-[320px] place-items-center rounded-lg border bg-zinc-950 p-6 text-center text-lime-200 shadow-inner">
          <div>
            <Gauge className="mx-auto mb-4 h-8 w-8" />
            <div className="font-mono text-7xl font-semibold leading-none tracking-normal max-sm:text-5xl">{displayWeight}</div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-normal">{activeReading.unit}</div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
              <Badge variant="outline" className="border-lime-200/40 bg-lime-200/10 text-lime-100">{stable ? "Stable reading" : "Waiting for stability"}</Badge>
              <Badge variant="outline" className="border-lime-200/40 bg-lime-200/10 text-lime-100">Captured {capturedAt}</Badge>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-3">
          <div className="flex items-center justify-between rounded-md border p-3 text-sm">
            <div>
              <div className="font-medium">Desktop bridge</div>
              <div className="text-xs text-muted-foreground">{isDesktopBridge ? "Electron preload connected" : "Web mode, waiting for station app"}</div>
            </div>
            <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">Raw frame</div><div className="truncate font-mono text-xs">{activeReading.raw}</div></div>
            <div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">Lock status</div><div>{confirmedAt ? "Confirmed" : activeSessionId ? "Ready" : "No active ticket"}</div></div>
          </div>
          {confirmedReading ? <div className="flex gap-3 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /><div><div className="font-medium">Locked {confirmedReading.value.toLocaleString()} {confirmedReading.unit}</div><div className="text-xs text-muted-foreground">Confirmed at {confirmedAt}</div></div></div> : null}
          {bridgeError ? <div className="flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"><WifiOff className="mt-0.5 h-4 w-4" /><span>{bridgeError}</span></div> : null}
          <div className="grid gap-2">{devices.map((device) => <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={device.name}><div><div className="text-sm font-medium">{device.name}</div><div className="text-xs text-muted-foreground">{device.detail}</div></div><Badge variant="secondary">{device.status}</Badge></div>)}</div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Button variant="outline" onClick={reconnectScale} disabled={isReconnecting}><RefreshCcw className={isReconnecting ? "animate-spin" : ""} />{isReconnecting ? "Reconnecting" : "Reconnect scale"}</Button>
            <Button onClick={confirmStableWeight} disabled={!stable || isSavingWeight}><Scale />{isSavingWeight ? "Saving weight" : "Confirm stable weight"}</Button>
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}
