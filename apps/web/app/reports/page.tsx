import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportCards } from "@/lib/sample-data";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="mb-5"><h1 className="text-2xl font-semibold tracking-normal">Reports</h1><p className="mt-1 text-sm text-muted-foreground">Finance, procurement, dispatch, stores, and supervisor reporting.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => <Card key={report.title}><CardHeader><CardDescription>{report.title}</CardDescription><CardTitle className="text-2xl">{report.value}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{report.detail}</CardContent></Card>)}
      </div>
    </AppShell>
  );
}
