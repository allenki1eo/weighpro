import {
  Activity,
  Camera,
  ClipboardCheck,
  Fuel,
  Gauge,
  MonitorSmartphone,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const nav = [
  { label: "Station", icon: Scale, active: true },
  { label: "Movements", icon: ClipboardCheck },
  { label: "Raw cotton", icon: Fuel },
  { label: "Reports", icon: ReceiptText },
  { label: "Admin", icon: Settings },
];

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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_1fr] max-lg:grid-cols-1">
        <aside className="border-r bg-card/70 px-4 py-5 max-lg:border-b max-lg:border-r-0">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">WeighPro</div>
              <div className="text-xs text-muted-foreground">Full weighbridge system</div>
            </div>
          </div>
          <nav className="grid gap-1 max-lg:grid-cols-5 max-sm:grid-cols-2" aria-label="Main navigation">
            {nav.map((item) => (
              <div
                className={
                  item.active
                    ? "flex min-h-10 items-center gap-2 rounded-md bg-secondary px-3 text-sm font-medium"
                    : "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground"
                }
                key={item.label}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 p-5 lg:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 max-md:flex-col">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">Weighbridge control</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Station weighing, movement matching, AMCOS fuel support, reports, and remote clerk controls.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Search />
                Search ticket
              </Button>
              <Button variant="outline">
                <RefreshCcw />
                Refresh
              </Button>
              <Button>
                <PackageCheck />
                New weigh
              </Button>
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

          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle>Active weigh sessions</CardTitle>
                    <CardDescription>ANPR and imported movement notes recall first and second weighs.</CardDescription>
                  </div>
                  <Badge variant="outline">Live queue</Badge>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Raw cotton AMCOS fuel</CardTitle>
                    <CardDescription>Calculated from distance travelled multiplied by the agreed rate.</CardDescription>
                  </CardHeader>
                  <CardContent>
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
            </div>

            <aside className="grid gap-4 self-start">
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
                      <div className="font-mono text-5xl font-semibold leading-none">14,620</div>
                      <div className="mt-2 text-xs uppercase tracking-normal">kg stable</div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {stationDevices.map((device) => (
                      <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={device.name}>
                        <div>
                          <div className="text-sm font-medium">{device.name}</div>
                          <div className="text-xs text-muted-foreground">{device.detail}</div>
                        </div>
                        <Badge variant="secondary">{device.status}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">
                    <Scale />
                    Confirm stable weight
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Camera match</CardTitle>
                  <CardDescription>Plate read connected to a second-weigh ticket.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-mono text-lg font-semibold">GX22 FBD</div>
                      <div className="text-xs text-muted-foreground">94% confidence</div>
                    </div>
                    <Badge variant="outline">Second weigh</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-muted p-3">
                      <div className="text-xs text-muted-foreground">Ticket</div>
                      <div className="font-mono">WB-1048</div>
                    </div>
                    <div className="rounded-md bg-muted p-3">
                      <div className="text-xs text-muted-foreground">Mode</div>
                      <div>Second weigh</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
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
        </section>
      </div>
    </main>
  );
}
