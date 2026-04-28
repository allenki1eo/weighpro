"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Ticket = {
  id: string;
  plate: string;
  movement: string;
  firstWeightKg: number | null;
  secondWeightKg: number | null;
  netWeightKg: number | null;
  status: string;
  driver: string;
  transportCompany?: string;
  customer: string;
  product: string;
  completedAt: string | null;
};

export function WeighCertificate({
  ticket,
  autoPrint,
}: {
  ticket: Ticket;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const issuedAt = ticket.completedAt
    ? new Date(ticket.completedAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const entranceKg = ticket.firstWeightKg;
  const exitKg = ticket.secondWeightKg;
  const netKg =
    ticket.netWeightKg ??
    (entranceKg != null && exitKg != null
      ? Math.abs(entranceKg - exitKg)
      : null);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden flex items-center gap-3 border-b bg-white px-5 py-3 shadow-sm">
        <Link
          href={`/tickets/${encodeURIComponent(ticket.id)}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ticket
        </Link>
        <button onClick={() => window.print()} className={buttonVariants({ size: "sm" })}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
        <span className="text-sm text-zinc-500">
          Use &quot;Save as PDF&quot; in the print dialog for a digital copy.
        </span>
      </div>

      {/* Certificate body */}
      <div className="mx-auto max-w-[720px] px-8 py-10 print:max-w-none print:px-12 print:py-8">
        {/* ── Header ── */}
        <div className="mb-6 border-b-4 border-zinc-900 pb-5 text-center">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
            Official Weighbridge Document
          </div>
          <h1 className="text-4xl font-extrabold uppercase tracking-wider">WeighPro</h1>
          <div className="mt-1 text-xs text-zinc-500">Weighbridge Operations System</div>
          <div className="mt-3 inline-block rounded border border-zinc-300 bg-zinc-50 px-8 py-1.5 text-sm font-bold uppercase tracking-widest">
            Weighbridge Certificate
          </div>
        </div>

        {/* ── Ref & meta ── */}
        <div className="mb-5 grid grid-cols-3 gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Certificate No.</div>
            <div className="mt-0.5 font-mono font-bold">{ticket.id}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Issued</div>
            <div className="mt-0.5 font-medium">{issuedAt}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Status</div>
            <div className="mt-0.5 font-medium uppercase">{ticket.status.replaceAll("_", " ")}</div>
          </div>
        </div>

        {/* ── Vehicle details ── */}
        <Section title="Vehicle Details">
          <Row label="Vehicle Registration" value={ticket.plate} mono />
          <Row label="Driver Name" value={ticket.driver || "—"} />
          <Row label="Transport Company" value={ticket.transportCompany || "—"} />
        </Section>

        {/* ── Movement details ── */}
        <Section title="Movement Details">
          <Row label="Movement Type" value={ticket.movement || "—"} />
          <Row label="Customer / Supplier / AMCOS" value={ticket.customer || "—"} />
          <Row label="Product / Material" value={ticket.product || "—"} />
        </Section>

        {/* ── Weight measurements ── */}
        <section className="mb-6">
          <SectionHeading title="Weight Measurements" />
          <table className="w-full border-collapse text-sm">
            <tbody>
              <WeighRow
                label="Entrance Weighment"
                sub="First weighment — laden / gross"
                value={entranceKg}
              />
              <WeighRow
                label="Exit Weighment"
                sub="Second weighment — empty / tare"
                value={exitKg}
              />
              {/* Net weight row */}
              <tr className="border border-t-0 bg-zinc-900 text-white">
                <td className="px-4 py-4 font-bold">
                  <div className="text-base uppercase tracking-widest">Net Weight</div>
                  <div className="text-xs font-normal normal-case text-zinc-400">
                    Entrance − Exit
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-3xl font-extrabold tabular-nums">
                    {netKg != null ? netKg.toLocaleString() : "PENDING"}
                  </span>
                  {netKg != null && (
                    <span className="ml-2 text-lg font-bold text-zinc-400">KG</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>
              Scale indicator: <strong>XK3190-DS1</strong>
            </span>
            <span>
              Unit: <strong>Kilograms (kg)</strong>
            </span>
            <span>
              Station: <strong>WeighPro Station 1</strong>
            </span>
          </div>
        </section>

        {/* ── Signatures ── */}
        <section className="mb-6 grid grid-cols-2 gap-10">
          <SignatureLine label="Weighbridge Operator" />
          <SignatureLine label="Supervisor / Authorised Signatory" />
        </section>

        {/* ── Footer ── */}
        <div className="border-t border-zinc-200 pt-4 text-[10px] leading-relaxed text-zinc-400">
          <p>
            This certificate is an official record of the weighing transaction above, issued by the
            WeighPro Weighbridge Operations System. The net weight is based on calibrated scale readings
            captured by the XK3190-DS1 indicator. Any discrepancy must be reported within 24 hours of
            issue.
          </p>
          <p className="mt-2 font-medium text-zinc-500">
            WeighPro System · Certificate {ticket.id} · Generated{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{title}</h2>
      <div className="flex-1 border-t border-zinc-200" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <SectionHeading title={title} />
      <div className="divide-y divide-zinc-100 rounded-md border border-zinc-200">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
      <span className="shrink-0 font-medium text-zinc-500">{label}</span>
      <span className={`text-right ${mono ? "font-mono font-semibold" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

function WeighRow({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: number | null;
}) {
  return (
    <tr className="border border-b-0 border-zinc-300 last:border-b">
      <td className="border-r border-zinc-200 bg-zinc-50 px-4 py-3 w-1/2">
        <div className="font-semibold uppercase tracking-wide text-zinc-500 text-xs">{label}</div>
        <div className="text-[11px] font-normal text-zinc-400">{sub}</div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-xl font-bold tabular-nums">
          {value != null ? value.toLocaleString() : "PENDING"}
        </span>
        {value != null && <span className="ml-1.5 text-sm font-semibold text-zinc-400">KG</span>}
      </td>
    </tr>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <div className="mt-10 border-b border-zinc-400" />
      <div className="mt-1.5 text-xs text-zinc-500">{label}</div>
      <div className="mt-0.5 text-xs text-zinc-400">Name: ____________________</div>
      <div className="mt-0.5 text-xs text-zinc-400">Date: ____________________</div>
    </div>
  );
}
