"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Printer, Search } from "lucide-react";
import type { RecentTicketRow } from "@/lib/server-data";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

function exportCsv(tickets: RecentTicketRow[]) {
  const headers = [
    "Ticket",
    "Plate",
    "Driver",
    "Movement",
    "Product",
    "Customer",
    "First Weight (kg)",
    "Second Weight (kg)",
    "Net Weight (kg)",
    "Status",
    "Completed At",
  ];
  const rows = tickets.map((t) => [
    t.id,
    t.plate,
    t.driver ?? "",
    t.movement ?? "",
    t.product ?? "",
    t.customer ?? "",
    t.firstWeightKg ?? "",
    t.secondWeightKg ?? "",
    t.netWeightKg ?? "",
    t.status,
    t.completedAt ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weighpro-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface TicketsClientProps {
  initialTickets: RecentTicketRow[];
}

export function TicketsClient({ initialTickets }: TicketsClientProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = initialTickets.filter((t) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.plate.toLowerCase().includes(q) ||
      (t.product ?? "").toLowerCase().includes(q) ||
      (t.customer ?? "").toLowerCase().includes(q) ||
      (t.driver ?? "").toLowerCase().includes(q) ||
      (t.movement ?? "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"
        ? t.status !== "completed" && t.status !== "cancelled"
        : t.status === statusFilter);

    return matchesQuery && matchesStatus;
  });

  const counts = {
    total: initialTickets.length,
    completed: initialTickets.filter((t) => t.status === "completed").length,
    active: initialTickets.filter(
      (t) => t.status !== "completed" && t.status !== "cancelled",
    ).length,
    cancelled: initialTickets.filter((t) => t.status === "cancelled").length,
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, review, print, and audit weighbridge tickets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { label: "Total", value: counts.total, filter: "all", variant: "outline" },
            { label: "Completed", value: counts.completed, filter: "completed", variant: "success" },
            { label: "In progress", value: counts.active, filter: "active", variant: "warning" },
            { label: "Cancelled", value: counts.cancelled, filter: "cancelled", variant: "destructive" },
          ] as const
        ).map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.filter)}
            className={`rounded-lg border bg-card text-left px-4 py-3 transition-colors hover:bg-accent ${
              statusFilter === s.filter ? "ring-2 ring-primary" : ""
            }`}
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <Badge variant={s.variant as any} className="mt-1 text-base px-2 py-0.5">
              {s.value}
            </Badge>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Ticket register</CardTitle>
              <CardDescription className="mt-0.5">
                {filtered.length === initialTickets.length
                  ? `All ${initialTickets.length} tickets`
                  : `${filtered.length} of ${initialTickets.length} tickets`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search ticket, plate, driver, product…"
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
                  <TableHead className="hidden sm:table-cell text-right">Entrance</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Exit</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Net weight</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No tickets match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/tickets/${encodeURIComponent(ticket.id)}`)
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">{ticket.id}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{ticket.plate}</TableCell>
                      <TableCell className="text-muted-foreground">{ticket.driver ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {ticket.movement ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {ticket.product ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums text-muted-foreground">
                        {ticket.firstWeightKg != null
                          ? ticket.firstWeightKg.toLocaleString() + " kg"
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums text-muted-foreground">
                        {ticket.secondWeightKg != null
                          ? ticket.secondWeightKg.toLocaleString() + " kg"
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums font-semibold">
                        {ticket.netWeightKg != null
                          ? ticket.netWeightKg.toLocaleString() + " kg"
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={statusVariant(ticket.status) as any}>
                            {statusLabel(ticket.status)}
                          </Badge>
                          {ticket.status === "completed" && (
                            <Link
                              href={`/tickets/${encodeURIComponent(ticket.id)}/certificate`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className={
                                buttonVariants({ variant: "ghost", size: "sm" }) +
                                " h-7 px-2 text-xs"
                              }
                            >
                              <Printer className="h-3 w-3" />
                              <span className="hidden xl:inline">Certificate</span>
                            </Link>
                          )}
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
    </>
  );
}
