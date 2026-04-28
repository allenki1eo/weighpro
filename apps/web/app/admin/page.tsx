import { MonitorSmartphone, Settings2, Workflow } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { movementTypes, stationDevices } from "@/lib/sample-data";

function deviceStatusVariant(status: string) {
  if (status === "online") return "success";
  if (status === "offline") return "destructive";
  return "outline";
}

export default function AdminPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure stations, devices, movement rules, materials, and AMCOS rates.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Movement rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              Movement type rules
            </CardTitle>
            <CardDescription>Required fields enforced per movement type at ticket creation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-0">
            {movementTypes.map((movement, idx) => (
              <div key={movement.name}>
                <div className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{movement.name}</p>
                    <Badge variant="outline" className="text-xs">active</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{movement.rule}</p>
                </div>
                {idx < movementTypes.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Station devices */}
        <div className="grid gap-6 content-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-primary" />
                Station devices
              </CardTitle>
              <CardDescription>Hardware registered for this weighbridge station.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {stationDevices.map((device) => (
                <div
                  key={device.name}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{device.name}</p>
                    <p className="mt-0.5 text-xs font-mono text-muted-foreground">{device.detail}</p>
                  </div>
                  <Badge variant={deviceStatusVariant(device.status) as any}>
                    {device.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick config links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Quick configuration
              </CardTitle>
              <CardDescription>Common admin tasks for this deployment.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                "Manage user roles & permissions",
                "Set AMCOS fuel rates",
                "Configure ANPR camera IP",
                "Update serial port settings",
                "Edit movement type rules",
                "Manage material master",
              ].map((task) => (
                <button
                  key={task}
                  className="flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                >
                  <span>{task}</span>
                  <span className="text-muted-foreground">→</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
