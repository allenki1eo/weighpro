"use client";

import { useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { counterparties } from "@/lib/sample-data";

const TYPES = ["All", "AMCOS", "Customer", "Supplier", "Transporter"];

function typeVariant(type: string) {
  if (type === "AMCOS") return "info";
  if (type === "Customer") return "success";
  if (type === "Supplier") return "warning";
  if (type === "Transporter") return "secondary";
  return "outline";
}

export default function CounterpartiesPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = counterparties.filter((c) => {
    const q = query.toLowerCase();
    const matchesQ = !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    const matchesType = typeFilter === "All" || c.type === typeFilter;
    return matchesQ && matchesType;
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Counterparties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers, suppliers, AMCOS groups, and transport partners.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add party
        </Button>
      </div>

      {/* Type filter pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              typeFilter === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Counterparty register</CardTitle>
              <CardDescription className="mt-0.5">
                One place for all parties connected to weighbridge operations.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search name, location…"
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
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No counterparties match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((party) => (
                    <TableRow key={party.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{party.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeVariant(party.type) as any}>{party.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {party.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant={party.status === "active" ? "success" : "outline"}>
                          {party.status}
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
