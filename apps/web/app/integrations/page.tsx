import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Plug } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { integrations, pendingOrders } from "@/lib/sample-data";

function directionIcon(direction: string) {
  if (direction === "Inbound") return <ArrowDownToLine className="h-3.5 w-3.5 text-blue-500" />;
  if (direction === "Outbound") return <ArrowUpFromLine className="h-3.5 w-3.5 text-emerald-500" />;
  return <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function IntegrationsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Orders &amp; Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connected systems, API endpoints, cameras, and imported request notes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Integration endpoints */}
        <div className="grid gap-6 content-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-4 w-4 text-primary" />
                Integration endpoints
              </CardTitle>
              <CardDescription>Systems connected to the weighbridge workflow.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead className="hidden md:table-cell">Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {directionIcon(item.direction)}
                            {item.direction}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                          {item.endpoint}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "active" ? "success" : "outline"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* API reference */}
          <Card>
            <CardHeader>
              <CardTitle>API reference</CardTitle>
              <CardDescription>Endpoints available for external systems to push data.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                {
                  method: "POST",
                  path: "/api/order-notes",
                  desc: "Ingest a movement note from an external order system. Requires Bearer token.",
                },
                {
                  method: "POST",
                  path: "/api/weigh-sessions",
                  desc: "Open a new weighbridge session for a vehicle plate.",
                },
                {
                  method: "POST",
                  path: "/api/weigh-events",
                  desc: "Capture first or second weight for an active session.",
                },
                {
                  method: "POST",
                  path: "/api/camera-reads",
                  desc: "Submit an ANPR plate read from a gate camera.",
                },
              ].map((api) => (
                <div key={api.path}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">{api.method}</Badge>
                    <code className="text-sm font-mono">{api.path}</code>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{api.desc}</p>
                  <Separator className="mt-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent imported notes */}
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Recent imported notes</CardTitle>
            <CardDescription>Movement notes arriving from connected business systems.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes received yet.</p>
            ) : (
              pendingOrders.map((order) => (
                <div className="rounded-md border p-3" key={order.externalNoteId}>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs text-muted-foreground">{order.externalNoteId}</code>
                    <Badge variant="info" className="text-xs">pending</Badge>
                  </div>
                  <p className="mt-1.5 font-medium text-sm">{order.product}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.businessUnit} · {order.vehiclePlate} · {order.driverName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Scheduled: {order.scheduledAt}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
