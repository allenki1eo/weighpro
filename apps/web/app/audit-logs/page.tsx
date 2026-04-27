import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auditItems } from "@/lib/sample-data";

export default function AuditLogsPage() {
  return <AppShell><div className="mb-5"><h1 className="text-2xl font-semibold tracking-normal">Audit Logs</h1><p className="mt-1 text-sm text-muted-foreground">Trace camera matches, weight captures, edits, approvals, reprints, and overrides.</p></div><Card><CardHeader><CardTitle>Recent audit events</CardTitle><CardDescription>Every sensitive action should be traceable by user, time, and record.</CardDescription></CardHeader><CardContent className="grid gap-3">{auditItems.map((item) => <div className="rounded-md border p-3 text-sm text-muted-foreground" key={item}>{item}</div>)}</CardContent></Card></AppShell>;
}
