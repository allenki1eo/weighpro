import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { movementTypes, stationDevices } from "@/lib/sample-data";

export default function AdminPage() {
  return (
    <AppShell>
      <div className="mb-5"><h1 className="text-2xl font-semibold tracking-normal">Admin</h1><p className="mt-1 text-sm text-muted-foreground">Configure users, stations, devices, movement rules, materials, and AMCOS rates.</p></div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Movement setup</CardTitle><CardDescription>Rules determine required fields for each movement type.</CardDescription></CardHeader><CardContent className="grid gap-3">{movementTypes.map((movement) => <div className="rounded-md border p-3" key={movement.name}><div className="font-medium">{movement.name}</div><div className="mt-1 text-sm text-muted-foreground">{movement.rule}</div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Station devices</CardTitle><CardDescription>Hardware registered for the weighbridge station.</CardDescription></CardHeader><CardContent className="grid gap-3">{stationDevices.map((device) => <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={device.name}><div><div className="font-medium">{device.name}</div><div className="text-sm text-muted-foreground">{device.detail}</div></div><Badge variant="secondary">{device.status}</Badge></div>)}</CardContent></Card>
      </div>
    </AppShell>
  );
}
