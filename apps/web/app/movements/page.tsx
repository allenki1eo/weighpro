"use client";

import { useState } from "react";
import { Calendar, Plus, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pendingOrders, sessions } from "@/lib/sample-data";

function sessionStatusVariant(status: string) {
  if (status === "awaiting_second_weight") return "warning";
  if (status === "awaiting_first_weight") return "info";
  return "outline";
}

export default function MovementsPage() {
  const [tab, setTab] = useState("pending");

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Movements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Imported notes, manual bookings, and active vehicle sessions.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add movement
        </Button>
      </div>

      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card className="py-3">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <p className="text-sm text-muted-foreground">Pending notes</p>
            <Badge variant="info">{pendingOrders.length}</Badge>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <p className="text-sm text-muted-foreground">Active sessions</p>
            <Badge variant="warning">{sessions.length}</Badge>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center justify-between px-4 py-0">
            <p className="text-sm text-muted-foreground">Completed today</p>
            <Badge variant="success">5</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="pending">Pending notes ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="sessions">Active sessions ({sessions.length})</TabsTrigger>
        </TabsList>

        {/* Pending movement notes */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending movement notes</CardTitle>
              <CardDescription>From order, procurement, and cotton workflows awaiting vehicle arrival.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>External ID</TableHead>
                      <TableHead>Business unit</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="hidden md:table-cell">Product</TableHead>
                      <TableHead className="hidden lg:table-cell">Counterparty</TableHead>
                      <TableHead className="hidden sm:table-cell">Scheduled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order.externalNoteId}>
                        <TableCell className="font-mono text-xs">{order.externalNoteId}</TableCell>
                        <TableCell className="text-muted-foreground">{order.businessUnit}</TableCell>
                        <TableCell className="font-medium">{order.vehiclePlate}</TableCell>
                        <TableCell className="text-muted-foreground">{order.driverName}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {order.product}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {order.customerName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {order.scheduledAt}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session queue</CardTitle>
              <CardDescription>Vehicles currently on or expected at the weighbridge.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Plate</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Next action</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-xs">{session.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                            {session.plate}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{session.product}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {session.status === "awaiting_first_weight"
                            ? "Capture first weight"
                            : "Vehicle return · capture second weight"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sessionStatusVariant(session.status) as any}>
                            {session.status.replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
