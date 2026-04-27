import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { materials } from "@/lib/sample-data";

export default function MaterialsPage() {
  return <AppShell><div className="mb-5 flex items-start justify-between gap-4 max-sm:flex-col"><div><h1 className="text-2xl font-semibold tracking-normal">Materials & Products</h1><p className="mt-1 text-sm text-muted-foreground">Raw cotton, lint bales, packaging, inputs, and finished goods.</p></div><Button><Plus />Add material</Button></div><Card><CardHeader><CardTitle>Material master</CardTitle><CardDescription>Used to categorize reports and movement rules.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Unit</TableHead></TableRow></TableHeader><TableBody>{materials.map((material) => <TableRow key={material.code}><TableCell className="font-mono text-xs">{material.code}</TableCell><TableCell>{material.name}</TableCell><TableCell>{material.category}</TableCell><TableCell>{material.unit}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></AppShell>;
}
