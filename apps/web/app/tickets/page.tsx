import { Printer, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets } from "@/lib/sample-data";

export default function TicketsPage() {
  return <AppShell><div className="mb-5 flex items-start justify-between gap-4 max-sm:flex-col"><div><h1 className="text-2xl font-semibold tracking-normal">Tickets</h1><p className="mt-1 text-sm text-muted-foreground">Search, review, print, reprint, and audit weighbridge tickets.</p></div><div className="flex gap-2"><Button variant="outline"><Search />Search</Button><Button><Printer />Print ticket</Button></div></div><Card><CardHeader><CardTitle>Ticket register</CardTitle><CardDescription>All first weigh, second weigh, completed, and reprint records.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Plate</TableHead><TableHead>Movement</TableHead><TableHead>Net weight</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{tickets.map((ticket) => <TableRow key={ticket.id}><TableCell className="font-mono text-xs">{ticket.id}</TableCell><TableCell>{ticket.plate}</TableCell><TableCell>{ticket.movement}</TableCell><TableCell>{ticket.netWeight}</TableCell><TableCell><Badge variant="outline">{ticket.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></AppShell>;
}
