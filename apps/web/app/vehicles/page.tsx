"use client";

import { useState } from "react";
import { Clock, Plus, Search, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vehicles } from "@/lib/sample-data";

export default function VehiclesPage() {
  const [query, setQuery] = useState("");

  const filtered = vehicles.filter((v) => {
    const q = query.toLowerCase();
    return (
      !q ||
      v.plate.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q) ||
      v.transporter.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehicles &amp; Drivers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Known plates, drivers, transporters, and last weighbridge activity.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add vehicle
        </Button>
      </div>

      {/* Stats strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="py-3">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <p className="text-sm text-muted-foreground">Registered vehicles</p>
            <Badge variant="secondary">{vehicles.length}</Badge>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <p className="text-sm text-muted-foreground">Active today</p>
            <Badge variant="success">6</Badge>
          </CardContent>
        </Card>
        <Card className="hidden py-3 sm:block">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <p className="text-sm text-muted-foreground">Transport companies</p>
            <Badge variant="outline">7</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Vehicle register</CardTitle>
              <CardDescription className="mt-0.5">
                Used by ANPR matching and first / second weigh recall.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search plate, driver…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="hidden md:table-cell">Transport company</TableHead>
                  <TableHead>Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No vehicles match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((vehicle) => (
                    <TableRow key={vehicle.plate}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-mono font-medium">{vehicle.plate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.driver}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {vehicle.transporter}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {vehicle.lastSeen}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
