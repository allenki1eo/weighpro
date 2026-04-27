import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rawCottonFuelRows } from "@/lib/sample-data";

export default function RawCottonPage() {
  const total = rawCottonFuelRows.reduce((sum, row) => sum + row.payable, 0);

  return (
    <AppShell>
      <div className="mb-5"><h1 className="text-2xl font-semibold tracking-normal">Raw cotton</h1><p className="mt-1 text-sm text-muted-foreground">AMCOS collection, distance, fuel payable, and cotton weighment controls.</p></div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card><CardHeader><CardTitle>AMCOS fuel payable</CardTitle><CardDescription>Fuel amount is distance travelled multiplied by the agreed rate.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>AMCOS</TableHead><TableHead>Collection point</TableHead><TableHead>Vehicle</TableHead><TableHead>Distance</TableHead><TableHead>Rate</TableHead><TableHead>Payable</TableHead></TableRow></TableHeader><TableBody>{rawCottonFuelRows.map((row) => <TableRow key={`${row.amcosName}-${row.plate}`}><TableCell>{row.amcosName}</TableCell><TableCell>{row.collectionPoint}</TableCell><TableCell>{row.plate}</TableCell><TableCell>{row.distanceKm} km</TableCell><TableCell>{row.fuelRatePerKm.toLocaleString()} {row.fuelCurrency}/km</TableCell><TableCell>{row.payable.toLocaleString()} {row.fuelCurrency}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardDescription>Total fuel payable</CardDescription><CardTitle className="text-3xl">{total.toLocaleString()} TZS</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Ready for finance review and later filters by AMCOS, collection point, season, and date range.</CardContent></Card>
      </div>
    </AppShell>
  );
}
