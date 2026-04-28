import { Activity, CheckCircle2, Clock, Truck, Webhook } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auditItems } from "@/lib/sample-data";

function actionIcon(action: string) {
  if (action.startsWith("Ticket completed")) return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (action.startsWith("Session opened")) return <Truck className="h-4 w-4 text-blue-500" />;
  if (action.startsWith("Movement note")) return <Webhook className="h-4 w-4 text-violet-500" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

function actionVariant(action: string) {
  if (action.startsWith("Ticket completed")) return "success";
  if (action.startsWith("Session opened")) return "info";
  if (action.startsWith("Movement note")) return "secondary";
  if (action.startsWith("Reprint")) return "warning";
  return "outline";
}

export default function AuditLogsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trace weight captures, edits, approvals, reprints, and session events by user and time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent audit events
          </CardTitle>
          <CardDescription>
            Every sensitive action is traceable by user, time, and record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

            <ol className="grid gap-0">
              {auditItems.map((item, idx) => (
                <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Icon dot */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-card">
                    {actionIcon(item.action)}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pt-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={actionVariant(item.action) as any} className="text-xs">
                        {item.action}
                      </Badge>
                      <code className="text-xs text-muted-foreground">{item.entity}</code>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user} · {item.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
