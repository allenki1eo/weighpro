import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { approvals } from "@/lib/sample-data";

function statusVariant(status: string) {
  if (status === "approved") return "success";
  if (status === "rejected") return "destructive";
  return "warning";
}

function statusIcon(status: string) {
  if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-amber-500" />;
}

export default function ApprovalsPage() {
  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Supervisor review for reprints, overrides, cancellations, and manual adjustments.
          </p>
        </div>
        <Badge variant={pending.length > 0 ? "warning" : "success"} className="text-sm px-3 py-1">
          {pending.length} pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Pending */}
        {pending.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending review
              </CardTitle>
              <CardDescription>These items require a supervisor action before records are finalised.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {pending.map((approval) => (
                <div
                  key={approval.item}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-md border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{approval.item}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{approval.reason}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Requested by {approval.requestedBy} · {approval.requestedAt}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Resolved */}
        <Card>
          <CardHeader>
            <CardTitle>Resolved approvals</CardTitle>
            <CardDescription>Approved and rejected items in this session.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {resolved.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resolved approvals yet.</p>
            ) : (
              resolved.map((approval) => (
                <div
                  key={approval.item}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">{statusIcon(approval.status)}</div>
                    <div className="min-w-0">
                      <p className="font-medium">{approval.item}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{approval.reason}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {approval.requestedBy} · {approval.requestedAt}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(approval.status) as any}>{approval.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
