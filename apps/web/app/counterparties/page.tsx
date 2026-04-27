import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { counterparties } from "@/lib/sample-data";

export default function CounterpartiesPage() {
  return <AppShell><div className="mb-5 flex items-start justify-between gap-4 max-sm:flex-col"><div><h1 className="text-2xl font-semibold tracking-normal">Customers / Suppliers / AMCOS</h1><p className="mt-1 text-sm text-muted-foreground">All parties connected to orders, raw cotton, procurement, and dispatches.</p></div><Button><Plus />Add party</Button></div><Card><CardHeader><CardTitle>Counterparty register</CardTitle><CardDescription>One place for customers, suppliers, AMCOS groups, and transport partners.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{counterparties.map((party) => <TableRow key={party.name}><TableCell>{party.name}</TableCell><TableCell>{party.type}</TableCell><TableCell>{party.location}</TableCell><TableCell><Badge variant="outline">{party.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></AppShell>;
}
