import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vehicles } from "@/lib/sample-data";

export default function VehiclesPage() {
  return <AppShell><div className="mb-5 flex items-start justify-between gap-4 max-sm:flex-col"><div><h1 className="text-2xl font-semibold tracking-normal">Vehicles & Drivers</h1><p className="mt-1 text-sm text-muted-foreground">Known plates, drivers, transporters, and last weighbridge activity.</p></div><Button><Plus />Add vehicle</Button></div><Card><CardHeader><CardTitle>Vehicle register</CardTitle><CardDescription>Used by ANPR matching and first/second weigh recall.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Plate</TableHead><TableHead>Driver</TableHead><TableHead>Transporter</TableHead><TableHead>Last seen</TableHead></TableRow></TableHeader><TableBody>{vehicles.map((vehicle) => <TableRow key={vehicle.plate}><TableCell className="font-mono">{vehicle.plate}</TableCell><TableCell>{vehicle.driver}</TableCell><TableCell>{vehicle.transporter}</TableCell><TableCell>{vehicle.lastSeen}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></AppShell>;
}
