import { PackageCheck, RefreshCcw, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StationBridgePanel } from "@/components/station/station-bridge-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pendingOrders, rawCottonFuelRows, sessions, stationDevices } from "@/lib/sample-data";

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatCurrency(value: number, currency = "TZS") {
  return `${value.toLocaleString()} ${currency}`;
}

export default function Home() {
  const activeSecondWeighs = sessions.filter((session) => session.status === "awaiting_second_weight").length;
  const completedToday = sessions.filter((session) => session.status === "completed").length;
  const fuelPayable = rawCottonFuelRows.reduce((total, row) => total + row.payable, 0);

  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Weighbridge control</h1>
          <p className="mt-1 text-sm text-muted-foreground">Station weighing, movement matching, AMCOS fuel support, reports, and remote clerk controls.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Search />Search ticket</Button>
          <Button variant="outline"><RefreshCcw />Refresh</Button>
          <Button><PackageCheck />New weigh</Button>
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Pending movement notes</CardDescription><CardTitle className="text-2xl">{pendingOrders.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Second weighs waiting</CardDescription><CardTitle className="text-2xl">{activeSecondWeighs}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed today</CardDescription><CardTitle className="text-2xl">{completedToday}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>AMCOS fuel payable</CardDescription><CardTitle className="text-2xl">{formatCurrency(fuelPayable)}</CardTitle></CardHeader></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div><CardTitle>Active weigh sessions</CardTitle><CardDescription>ANPR and imported movement notes recall first and second weighs.</CardDescription></div>
            <Badge variant="outline">Live queue</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Plate</TableHead><TableHead>Business unit</TableHead><TableHead>Movement</TableHead><TableHead>Status</TableHead><TableHead>Weights</TableHead></TableRow></TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs">{session.id}</TableCell>
                    <TableCell><span className="inline-flex rounded bg-amber-300 px-2 py-1 font-mono text-xs font-bold text-zinc-950">{session.plate}</span></TableCell>
                    <TableCell>{session.customerName}</TableCell>
                    <TableCell>{session.product}</TableCell>
                    <TableCell><Badge variant={session.status === "completed" ? "secondary" : "outline"}>{statusLabel(session.status)}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{session.firstWeightKg ? `${session.firstWeightKg.toLocaleString()} kg` : "Not captured"}{session.netWeightKg ? ` / net ${session.netWeightKg.toLocaleString()} kg` : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <aside className="grid gap-4 self-start">
          <StationBridgePanel devices={stationDevices} />
          <Card>
            <CardHeader><CardTitle>Camera match</CardTitle><CardDescription>Plate read connected to a second-weigh ticket.</CardDescription></CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between rounded-md border p-3"><div><div className="font-mono text-lg font-semibold">GX22 FBD</div><div className="text-xs text-muted-foreground">94% confidence</div></div><Badge variant="outline">Second weigh</Badge></div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
