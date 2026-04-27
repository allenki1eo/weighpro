"use client";

import { useEffect, useMemo, useState } from "react";
import { Gauge, MonitorSmartphone, Scale, WifiOff } from "lucide-react";
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
}

export function StationBridgePanel({ devices }: StationBridgePanelProps) {
  const [reading, setReading] = useState<WeightReading | null>(null);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [isDesktopBridge, setIsDesktopBridge] = useState(false);

  useEffect(() => {
    const station = window.weighproStation;

    if (!station) {
      return;
    }

    setIsDesktopBridge(true);
    station.getLastReading().then(setReading).catch((error: Error) => setBridgeError(error.message));

    const removeReadingListener = station.onScaleReading((nextReading) => {
      setReading(nextReading);
      setBridgeError(null);
    });
    const removeErrorListener = station.onScaleError((message) => setBridgeError(message));

    return () => {
      removeReadingListener();
      removeErrorListener();
    };
  }, []);

  const displayWeight = useMemo(() => {
    if (!reading) {
      return "14,620";
    }

    return reading.value.toLocaleString();
  }, [reading]);

  const unit = reading?.unit ?? "kg";
  const stable = reading?.stable ?? true;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Station control</CardTitle>
            <CardDescription>XK3190-DS1, cameras, and remote clerk status.</CardDescription>
          </div>
          <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid min-h-36 place-items-center rounded-lg border bg-zinc-950 text-center text-lime-200">
          <div>
            <Gauge className="mx-auto mb-2 h-6 w-6" />
            <div className="font-mono text-5xl font-semibold leading-none">{displayWeight}</div>
            <div className="mt-2 text-xs uppercase tracking-normal">
              {unit} {stable ? "stable" : "unstable"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <div>
            <div className="font-medium">Desktop bridge</div>
            <div className="text-xs text-muted-foreground">
              {isDesktopBridge ? "Electron preload connected" : "Web mode, waiting for station app"}
            </div>
          </div>
          <Badge variant={isDesktopBridge ? "secondary" : "outline"}>{isDesktopBridge ? "desktop" : "web"}</Badge>
        </div>

        {bridgeError ? (
          <div className="flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <WifiOff className="mt-0.5 h-4 w-4" />
            <span>{bridgeError}</span>
          </div>
        ) : null}

        <div className="grid gap-2">
          {devices.map((device) => (
            <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={device.name}>
              <div>
                <div className="text-sm font-medium">{device.name}</div>
                <div className="text-xs text-muted-foreground">{device.detail}</div>
              </div>
              <Badge variant="secondary">{device.status}</Badge>
            </div>
          ))}
        </div>
        <Button className="w-full" disabled={!stable}>
          <Scale />
          Confirm stable weight
        </Button>
      </CardContent>
    </Card>
  );
}
