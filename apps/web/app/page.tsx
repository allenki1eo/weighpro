import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Clock,
  PackageCheck,
  Scale,
  Search,
  Timer,
  Truck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { WeighWorkbench } from "@/components/station/weigh-workbench";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auditItems, sessions, tickets } from "@/lib/sample-data";

function statusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "awaiting_second_weight") return "warning";
  if (status === "awaiting_first_weight") return "info";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

const recentTickets = tickets.slice(0, 5);

export default function Home() {
  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weighbridge Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live station weighing, movement matching, and audit trail.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/tickets">
            <Search className="h-4 w-4" />
            Search tickets
          </Link>
          <Link className={buttonVariants({ size: "sm" })} href="/tickets">
            <PackageCheck className="h-4 w-4" />
            New weigh
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Weighings today
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">12</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">8 receipts · 3 dispatches · 1 manual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Net weight today
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">287 t</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">68% seed cotton</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Active sessions
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">{sessions.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {sessions.filter((s) => s.status === "awaiting_second_weight").length} awaiting second weigh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              AMCOS fuel payable
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">1.2M TZS</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Across 4 collection points</p>
          </CardContent>
        </Card>
      </div>

      {/* Weigh workbench */}
      <div className="mb-6">
        <WeighWorkbench devices={[]} />
      </div>

      {/* Bottom grid: recent tickets + activity */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Recent tickets */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Recent tickets</CardTitle>
              <CardDescription className="mt-0.5">Latest weighbridge transactions</CardDescription>
            </div>
            <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/tickets">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead className="hidden sm:table-cell">Product</TableHead>
                    <TableHead className="hidden md:table-cell">Net weight</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.plate}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {ticket.product}
                      </TableCell>
                      <TableCell className="hidden md:table-cell tabular-nums">
                        {ticket.netWeight}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(ticket.status) as any}>
                          {statusLabel(ticket.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Live activity
            </CardTitle>
            <CardDescription>Real-time audit events</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 pt-0">
            {auditItems.slice(0, 6).map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  {item.action.startsWith("Ticket completed") ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : item.action.startsWith("Session") ? (
                    <Truck className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    <span className="font-mono text-xs text-muted-foreground">{item.entity} </span>
                    {item.action}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
