import { BarChart3, Download } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { reportCards, tickets } from "@/lib/sample-data";

const completedTickets = tickets.filter((t) => t.status === "completed");
const totalNetKg = completedTickets.reduce((s, t) => s + (t.netWeightKg ?? 0), 0);

const byMovement = completedTickets.reduce<Record<string, number>>((acc, t) => {
  acc[t.movement] = (acc[t.movement] ?? 0) + (t.netWeightKg ?? 0);
  return acc;
}, {});

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Finance, procurement, dispatch, stores, and supervisor reporting.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Export report
        </Button>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {reportCards.map((report) => (
          <Card key={report.title}>
            <CardHeader className="pb-2">
              <CardDescription>{report.title}</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums">{report.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{report.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Net weight breakdown */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Net weight by movement type
            </CardTitle>
            <CardDescription>Based on completed tickets in the current dataset</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {Object.entries(byMovement).map(([movement, kg]) => {
              const pct = totalNetKg > 0 ? Math.round((kg / totalNetKg) * 100) : 0;
              return (
                <div key={movement}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{movement}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {(kg / 1000).toFixed(1)} t ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Separator />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total net weight</span>
              <span className="tabular-nums">{(totalNetKg / 1000).toFixed(1)} t</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available report exports</CardTitle>
            <CardDescription>Finance, procurement, and operational outputs</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { name: "Daily weighbridge summary", detail: "All tickets, net weights, movement breakdown" },
              { name: "AMCOS fuel payable", detail: "Per AMCOS group, collection point, and season" },
              { name: "Finished goods dispatch", detail: "Lint bales by customer and destination" },
              { name: "Raw cotton receipts", detail: "Seed cotton by AMCOS, grade, and date range" },
              { name: "Pending approvals log", detail: "Reprints, overrides, cancellations" },
              { name: "Full audit trail", detail: "All events by user, time, and entity" },
            ].map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between gap-4 rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
