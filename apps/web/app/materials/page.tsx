"use client";

import { useState } from "react";
import { Package2, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { materials } from "@/lib/sample-data";

const CATEGORIES = ["All", "Raw cotton", "Finished goods", "By-product", "Packaging", "Input"];

function categoryVariant(cat: string) {
  if (cat === "Raw cotton") return "warning";
  if (cat === "Finished goods") return "success";
  if (cat === "By-product") return "info";
  if (cat === "Packaging") return "secondary";
  return "outline";
}

export default function MaterialsPage() {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const filtered = materials.filter((m) => {
    const q = query.toLowerCase();
    const matchesQ = !q || m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
    const matchesCat = catFilter === "All" || m.category === catFilter;
    return matchesQ && matchesCat;
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Materials &amp; Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Raw cotton, lint bales, packaging, inputs, and finished goods.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add material
        </Button>
      </div>

      {/* Category filter pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              catFilter === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Material master</CardTitle>
              <CardDescription className="mt-0.5">
                Used to categorise reports, movement rules, and fuel calculations.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search code or name…"
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
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No materials match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((material) => (
                    <TableRow key={material.code}>
                      <TableCell className="font-mono text-xs font-medium">{material.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {material.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryVariant(material.category) as any}>
                          {material.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{material.unit}</TableCell>
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
