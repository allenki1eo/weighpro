import Link from "next/link";
import { Activity, Camera, PackageCheck, RefreshCcw, Search, ShieldCheck, Wifi } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StationBridgePanel } from "@/components/station/station-bridge-panel";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  auditItems,
  movementTypes,
  pendingOrders,
  rawCottonFuelRows,
  reportCards,
  sessions,
  stationDevices,
} from "../lib/sample-data";

function statusLabel(status: string) {
  switch (status) {
    case "awaiting_first_weight":
      return "First weigh";
    case "awaiting_second_weight":
      return "Second weigh";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function formatCurrency(value: number, currency = "TZS") {
  return `${value.toLocaleString()} ${currency}`;
}

export default function Home() {
  const activeSecondWeighs = sessions.filter((session) => session.status === "awaiting_second_weight").length;
  const completedToday = sessions.filter((session) => session.status === "completed").length;
  const fuelPayable = rawCottonFuelRows.reduce((total, row) => total + row.payable, 0);
  const cameraMatch = sessions.find((session) => session.lastPlateConfidence);

  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Weighbridge control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Station weighing, movement matching, AMCOS fuel support, reports, and remote clerk controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={buttonVariants({ variant: "outline" })} href="/tickets">
            <Search />
            Search ticket
          </Link>
          <Button variant="outline">
            <RefreshCcw />
            Refresh
          </Button>
          <Link className={buttonVariants()} href="/tickets">
            <PackageCheck />
            New weigh
          </Link>
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending movement notes</CardDescription>
            <CardTitle className="text-2xl">{pendingOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Second weighs waiting</CardDescription>
            <CardTitle className="text-2xl">{activeSecondWeighs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed today</CardDescription>
            <CardTitle className="text-2xl">{completedToday}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AMCOS fuel payable</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(fuelPayable)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4">
        <StationBridgePanel devices={stationDevices} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Active weigh sessions</CardTitle>
              <CardDescription>ANPR and imported movement notes recall first and second weighs.</CardDescription>
            </div>
            <Badge variant="outline">Live queue</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>Business unit</TableHead>
                    <TableHead>Movement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Weights</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs">{session.id}</TableCell>
                      <TableCell>
                        <span className="inline-flex rounded bg-amber-300 px-2 py-1 font-mono text-xs font-bold text-zinc-950">
                          {session.plate}
                        </span>
                      </TableCell>
                      <TableCell>{session.customerName}</TableCell>
                      <TableCell>{session.product}</TableCell>
                      <TableCell>
                        <Badge variant={session.status === "completed" ? "secondary" : "outline"}>
                          {statusLabel(session.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.firstWeightKg ? `${session.firstWeightKg.toLocaleString()} kg` : "Not captured"}
                        {session.netWeightKg ? ` / net ${session.netWeightKg.toLocaleString()} kg` : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <aside className="grid gap-4 self-start">
          <Card>
            <CardHeader>
              <CardTitle>Camera match</CardTitle>
              <CardDescription>Plate read connected to the next weighing decision.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-mono text-lg font-semibold">{cameraMatch?.plate ?? "No plate"}</div>
                  <div className="text-xs text-muted-foreground">
                    {cameraMatch?.lastPlateConfidence
                      ? `${Math.round(cameraMatch.lastPlateConfidence * 100)}% confidence`
                      : "Waiting for ANPR"}
                  </div>
                </div>
                <Badge variant="outline">{cameraMatch ? statusLabel(cameraMatch.status) : "Queue"}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <div className="text-xs text-muted-foreground">Ticket</div>
                  <div className="font-mono">{cameraMatch?.id ?? "Pending"}</div>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <div className="text-xs text-muted-foreground">Source</div>
                  <div>ANPR camera</div>
                </div>
              </div>
              <Link className={buttonVariants({ variant: "outline" })} href="/vehicles">
                <Camera />
                Review vehicles
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imported movement notes</CardTitle>
              <CardDescription>Orders and raw material requests ready for weighing.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {pendingOrders.map((order) => (
                <div className="rounded-md border p-3" key={order.externalNoteId}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-xs">{order.externalNoteId}</div>
                    <Badge variant="secondary">{order.scheduledAt}</Badge>
                  </div>
                  <div className="mt-2 text-sm font-medium">{order.product}</div>
                  <div className="text-xs text-muted-foreground">{order.businessUnit}</div>
                </div>
              ))}
              <Link className={buttonVariants({ variant: "outline" })} href="/integrations">
                Open integrations
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Raw cotton AMCOS fuel</CardTitle>
            <CardDescription>Calculated from distance travelled multiplied by the agreed rate.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AMCOS</TableHead>
                    <TableHead>Point</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawCottonFuelRows.map((row) => (
                    <TableRow key={`${row.amcosName}-${row.plate}`}>
                      <TableCell>{row.amcosName}</TableCell>
                      <TableCell>{row.collectionPoint}</TableCell>
                      <TableCell>{row.distanceKm} km</TableCell>
                      <TableCell>{formatCurrency(row.payable, row.fuelCurrency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement rules</CardTitle>
            <CardDescription>Each movement type captures the right operational details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {movementTypes.map((movement) => (
              <div className="rounded-md border p-3" key={movement.name}>
                <div className="text-sm font-medium">{movement.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{movement.rule}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Reports and controls</CardTitle>
            <CardDescription>Supervisor view for finance, procurement, dispatch, and audit.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {reportCards.map((report) => (
              <div className="rounded-md border p-3" key={report.title}>
                <div className="text-xs text-muted-foreground">{report.title}</div>
                <div className="mt-2 text-lg font-semibold">{report.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{report.detail}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>Every match, approval, weight, and override stays traceable.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {auditItems.map((item) => (
              <div className="flex gap-3 text-sm" key={item}>
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
            <div className="flex gap-3 text-sm">
              <Wifi className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Remote web access ready for approved clerks.</span>
            </div>
            <div className="flex gap-3 text-sm">
              <Activity className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Manual overrides require supervisor review.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
