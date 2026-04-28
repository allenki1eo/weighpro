"use client";

import { useState } from "react";
import { Download, Printer, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets } from "@/lib/sample-data";

function statusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "awaiting_second_weight") return "warning";
  if (status === "awaiting_first_weight") return "info";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default function TicketsPage() {
  const [query, setQuery] = useState("");

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    return (
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.plate.toLowerCase().includes(q) ||
      t.product.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.driver.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, review, print, and audit weighbridge tickets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm">
            <Printer className="h-4 w-4" />
            Print ticket
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: tickets.length, variant: "outline" as const },
          { label: "Completed", value: tickets.filter((t) => t.status === "completed").length, variant: "success" as const },
          { label: "In progress", value: tickets.filter((t) => t.status !== "completed" && t.status !== "cancelled").length, variant: "warning" as const },
          { label: "Cancelled", value: tickets.filter((t) => t.status === "cancelled").length, variant: "destructive" as const },
        ].map((s) => (
          <Card key={s.label} className="py-3">
            <CardContent className="flex items-center justify-between px-4 py-0">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <Badge variant={s.variant}>{s.value}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Ticket register</CardTitle>
              <CardDescription className="mt-0.5">
                All first weigh, second weigh, completed, and reprint records.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search ticket, plate, product…"
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
                  <TableHead>Ticket</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="hidden md:table-cell">Movement</TableHead>
                  <TableHead className="hidden lg:table-cell">Product</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">1st weight</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Net weight</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No tickets match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.plate}</TableCell>
                      <TableCell className="text-muted-foreground">{ticket.driver}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {ticket.movement}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {ticket.product}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums text-muted-foreground">
                        {ticket.firstWeightKg ? ticket.firstWeightKg.toLocaleString() + " kg" : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums font-medium">
                        {ticket.netWeight}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(ticket.status) as any}>
                          {statusLabel(ticket.status)}
                        </Badge>
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
