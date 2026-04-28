"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileText,
  Save,
  Scale,
  Truck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Ticket = {
  id: string;
  plate: string;
  movement: string;
  firstWeightKg: number | null;
  secondWeightKg: number | null;
  netWeightKg: number | null;
  netWeight: string;
  status: string;
  driver: string;
  transportCompany?: string;
  customer: string;
  product: string;
  completedAt: string | null;
};

function statusVariant(status: string) {
  if (status === "completed") return "success";
  if (status === "awaiting_second_weight") return "warning";
  if (status === "awaiting_first_weight") return "info";
  return "outline";
}

interface EditableFields {
  driver: string;
  transportCompany: string;
  customer: string;
  product: string;
  plate: string;
  movement: string;
  notes: string;
}

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState<EditableFields>({
    driver: ticket.driver,
    transportCompany: ticket.transportCompany ?? "—",
    customer: ticket.customer,
    product: ticket.product,
    plate: ticket.plate,
    movement: ticket.movement,
    notes: "",
  });
  const [draft, setDraft] = useState<EditableFields>(fields);

  function startEdit() {
    setDraft({ ...fields });
    setEditing(true);
    setSaved(false);
  }

  function cancelEdit() {
    setDraft(fields);
    setEditing(false);
  }

  function saveEdit() {
    setFields(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const completed = ticket.status === "completed";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Tickets
          </Link>
          <div>
            <h1 className="font-mono text-lg font-semibold">{ticket.id}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={statusVariant(ticket.status) as any}>
                {ticket.status.replaceAll("_", " ")}
              </Badge>
              {ticket.completedAt && (
                <span className="text-xs text-muted-foreground">
                  Completed {ticket.completedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!editing && (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Edit2 className="h-4 w-4" />
                Edit details
              </Button>
              {completed && (
                <Link
                  href={`/tickets/${encodeURIComponent(ticket.id)}/certificate?print=1`}
                  target="_blank"
                  className={buttonVariants({ size: "sm" })}
                >
                  <Download className="h-4 w-4" />
                  Download certificate
                </Link>
              )}
              {completed && (
                <Link
                  href={`/tickets/${encodeURIComponent(ticket.id)}/certificate`}
                  target="_blank"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <FileText className="h-4 w-4" />
                  View certificate
                </Link>
              )}
            </>
          )}
          {editing && (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit}>
                <Save className="h-4 w-4" />
                Save changes
              </Button>
            </>
          )}
        </div>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Changes saved to this ticket.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Main details */}
        <div className="grid gap-6">
          {/* Vehicle & movement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-primary" />
                Vehicle &amp; movement details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Vehicle plate</Label>
                  {editing ? (
                    <Input
                      value={draft.plate}
                      onChange={(e) => setDraft({ ...draft, plate: e.target.value })}
                    />
                  ) : (
                    <p className="font-mono text-sm font-medium">{fields.plate}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Driver name</Label>
                  {editing ? (
                    <Input
                      value={draft.driver}
                      onChange={(e) => setDraft({ ...draft, driver: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{fields.driver}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Transport company</Label>
                  {editing ? (
                    <Input
                      value={draft.transportCompany}
                      onChange={(e) => setDraft({ ...draft, transportCompany: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{fields.transportCompany}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Movement type</Label>
                  {editing ? (
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={draft.movement}
                      onChange={(e) => setDraft({ ...draft, movement: e.target.value })}
                    >
                      <option>Raw cotton receipt</option>
                      <option>Raw material receipt</option>
                      <option>Finished goods dispatch</option>
                      <option>Production transfer</option>
                      <option>Packaging receipt</option>
                      <option>Manual weigh</option>
                    </select>
                  ) : (
                    <p className="text-sm">{fields.movement}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Customer / Supplier / AMCOS</Label>
                  {editing ? (
                    <Input
                      value={draft.customer}
                      onChange={(e) => setDraft({ ...draft, customer: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{fields.customer}</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Product / Material</Label>
                  {editing ? (
                    <Input
                      value={draft.product}
                      onChange={(e) => setDraft({ ...draft, product: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{fields.product}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-1.5">
                <Label>Notes / remarks</Label>
                {editing ? (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Add any relevant notes for this ticket…"
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {fields.notes || "No notes added."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight measurements sidebar */}
        <div className="grid gap-6 content-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4 text-primary" />
                Weight measurements
              </CardTitle>
              <CardDescription>XK3190-DS1 scale indicator readings</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md border">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">First weighment</span>
                  <span className="tabular-nums font-semibold">
                    {ticket.firstWeightKg ? ticket.firstWeightKg.toLocaleString() + " kg" : "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">Second weighment</span>
                  <span className="tabular-nums font-semibold">
                    {ticket.secondWeightKg ? ticket.secondWeightKg.toLocaleString() + " kg" : "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between bg-primary/5 px-4 py-3 rounded-b-md">
                  <span className="text-sm font-medium">Net weight</span>
                  <span className="tabular-nums text-lg font-bold text-primary">
                    {ticket.netWeightKg ? ticket.netWeightKg.toLocaleString() + " kg" : "—"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="rounded-md bg-muted px-3 py-2">
                  <div className="font-medium text-foreground">Indicator</div>
                  <div>XK3190-DS1</div>
                </div>
                <div className="rounded-md bg-muted px-3 py-2">
                  <div className="font-medium text-foreground">Unit</div>
                  <div>Kilograms (kg)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                Status timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border pl-5 space-y-4">
                {[
                  { label: "Ticket opened", done: true },
                  {
                    label: "First weight captured",
                    done: ticket.firstWeightKg !== null,
                    value: ticket.firstWeightKg
                      ? ticket.firstWeightKg.toLocaleString() + " kg"
                      : null,
                  },
                  {
                    label: "Second weight captured",
                    done: ticket.secondWeightKg !== null,
                    value: ticket.secondWeightKg
                      ? ticket.secondWeightKg.toLocaleString() + " kg"
                      : null,
                  },
                  {
                    label: "Ticket completed",
                    done: ticket.status === "completed",
                    value: ticket.completedAt,
                  },
                ].map((step) => (
                  <li key={step.label} className="relative">
                    <div
                      className={`absolute -left-[1.375rem] mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        step.done
                          ? "border-primary bg-primary"
                          : "border-muted-foreground bg-background"
                      }`}
                    >
                      {step.done && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <p className={`text-sm font-medium ${step.done ? "" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {step.value && (
                      <p className="text-xs text-muted-foreground">{step.value}</p>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
