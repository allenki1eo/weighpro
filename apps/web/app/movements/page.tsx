import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pendingOrders, sessions } from "@/lib/sample-data";

export default function MovementsPage() {
  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-normal">Movements</h1><p className="mt-1 text-sm text-muted-foreground">Imported notes, manual bookings, and active vehicle sessions.</p></div>
        <Button><Plus />Add movement</Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Pending movement notes</CardTitle><CardDescription>From order, procurement, production, stores, and cotton workflows.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>External ID</TableHead><TableHead>Business unit</TableHead><TableHead>Plate</TableHead><TableHead>Product</TableHead></TableRow></TableHeader><TableBody>{pendingOrders.map((order) => <TableRow key={order.externalNoteId}><TableCell className="font-mono text-xs">{order.externalNoteId}</TableCell><TableCell>{order.businessUnit}</TableCell><TableCell>{order.vehiclePlate}</TableCell><TableCell>{order.product}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Session queue</CardTitle><CardDescription>Vehicles currently known to the weighbridge.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Plate</TableHead><TableHead>Movement</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{sessions.map((session) => <TableRow key={session.id}><TableCell className="font-mono text-xs">{session.id}</TableCell><TableCell>{session.plate}</TableCell><TableCell>{session.product}</TableCell><TableCell><Badge variant="outline">{session.status.replaceAll("_", " ")}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      </div>
    </AppShell>
  );
}
