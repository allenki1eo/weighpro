import { Fuel, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rawCottonFuelRows } from "@/lib/sample-data";

export default function RawCottonPage() {
  const total = rawCottonFuelRows.reduce((sum, row) => sum + row.payable, 0);
  const amcosGroups = Array.from(new Set(rawCottonFuelRows.map((r) => r.amcosName)));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Raw Cotton</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AMCOS collection, distance, fuel payable, and cotton weighment controls.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main fuel table */}
        <Card>
          <CardHeader>
            <CardTitle>AMCOS fuel payable</CardTitle>
            <CardDescription>
              Fuel amount is distance travelled × agreed rate per km.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AMCOS</TableHead>
                    <TableHead>Collection point</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawCottonFuelRows.map((row) => (
                    <TableRow key={`${row.amcosName}-${row.plate}`}>
                      <TableCell className="font-medium">{row.amcosName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {row.collectionPoint}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{row.plate}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.distanceKm} km
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {row.fuelRatePerKm.toLocaleString()} {row.fuelCurrency}/km
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {row.payable.toLocaleString()} {row.fuelCurrency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary sidebar */}
        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5" />
                Total fuel payable
              </CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums">
                {total.toLocaleString()} TZS
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Across {rawCottonFuelRows.length} trips from {amcosGroups.length} AMCOS groups.
              Ready for finance review.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">By AMCOS group</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {amcosGroups.map((amcos) => {
                const rows = rawCottonFuelRows.filter((r) => r.amcosName === amcos);
                const subtotal = rows.reduce((s, r) => s + r.payable, 0);
                return (
                  <div key={amcos}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{amcos}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {subtotal.toLocaleString()} TZS
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {rows.length} trip{rows.length > 1 ? "s" : ""}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
