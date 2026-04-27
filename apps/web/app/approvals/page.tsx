import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approvals } from "@/lib/sample-data";

export default function ApprovalsPage() {
  return <AppShell><div className="mb-5 flex items-start justify-between gap-4 max-sm:flex-col"><div><h1 className="text-2xl font-semibold tracking-normal">Approvals</h1><p className="mt-1 text-sm text-muted-foreground">Supervisor review for remote weighing, overrides, cancellations, and reprints.</p></div><Button><CheckCircle2 />Review queue</Button></div><Card><CardHeader><CardTitle>Approval queue</CardTitle><CardDescription>Items that need review before records are finalized.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Requested by</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{approvals.map((approval) => <TableRow key={approval.item}><TableCell>{approval.item}</TableCell><TableCell>{approval.requestedBy}</TableCell><TableCell><Badge variant="outline">{approval.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></AppShell>;
}
