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

  const issuedAt = ticket.completedAt ?? new Date().toLocaleString();

  return (
    /* Force light theme for certificate — must print on white */
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
        <button
          onClick={() => window.print()}
          className={buttonVariants({ size: "sm" })}
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
        <span className="text-sm text-zinc-500">
          Use your browser&apos;s &quot;Save as PDF&quot; option when printing for a digital copy.
        </span>
      </div>

      {/* Certificate body — A4-ish width, centred */}
      <div className="mx-auto max-w-[700px] px-8 py-10 print:max-w-none print:px-12 print:py-8">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-6 border-b-4 border-zinc-900 pb-4 text-center">
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Weighbridge Operations System
          </div>
          <h1 className="text-3xl font-extrabold uppercase tracking-wider">WeighPro</h1>
          <div className="mt-2 inline-block rounded border border-zinc-300 bg-zinc-50 px-6 py-1 text-base font-bold uppercase tracking-widest">
            Weighbridge Certificate
          </div>
        </div>

        {/* ── Ref & date ───────────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm">
          <div>
            <span className="font-semibold text-zinc-500">Certificate No.&nbsp;</span>
            <span className="font-mono font-bold">{ticket.id}</span>
          </div>
          <div>
            <span className="font-semibold text-zinc-500">Issued&nbsp;</span>
            <span className="font-medium">{issuedAt}</span>
          </div>
          <div>
            <span className="font-semibold text-zinc-500">Status&nbsp;</span>
            <span className="font-medium uppercase">{ticket.status.replaceAll("_", " ")}</span>
          </div>
        </div>

        {/* ── Section: Vehicle ─────────────────────────────────── */}
        <Section title="Vehicle Details">
          <Row label="Vehicle Registration" value={ticket.plate} mono />
          <Row label="Driver Name" value={ticket.driver} />
          <Row label="Transport Company" value="—" />
        </Section>

        {/* ── Section: Movement ────────────────────────────────── */}
        <Section title="Movement Details">
          <Row label="Movement Type" value={ticket.movement} />
          <Row label="Customer / Supplier / AMCOS" value={ticket.customer} />
          <Row label="Product / Material" value={ticket.product} />
        </Section>

        {/* ── Section: Weight ──────────────────────────────────── */}
        <section className="mb-5">
          <SectionHeading title="Weight Measurements" />
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr className="border border-zinc-300">
                <td className="border-r border-zinc-300 bg-zinc-50 px-4 py-3 font-semibold uppercase tracking-wide text-zinc-500 w-1/2">
                  First Weighment
                  <div className="text-xs font-normal normal-case text-zinc-400">
                    Laden / Gross weight
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-xl font-bold tabular-nums">
                  {ticket.firstWeightKg != null
                    ? ticket.firstWeightKg.toLocaleString() + " KG"
                    : "PENDING"}
                </td>
              </tr>
              <tr className="border border-t-0 border-zinc-300">
                <td className="border-r border-zinc-300 bg-zinc-50 px-4 py-3 font-semibold uppercase tracking-wide text-zinc-500">
                  Second Weighment
                  <div className="text-xs font-normal normal-case text-zinc-400">
                    Empty / Tare weight
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-xl font-bold tabular-nums">
                  {ticket.secondWeightKg != null
                    ? ticket.secondWeightKg.toLocaleString() + " KG"
                    : "PENDING"}
                </td>
              </tr>
              <tr className="border border-t-0 border-2 border-zinc-900 bg-zinc-900 text-white">
                <td className="px-4 py-4 font-bold uppercase tracking-widest text-lg">
                  Net Weight
                  <div className="text-xs font-normal normal-case text-zinc-300">
                    First weighment − Second weighment
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-3xl font-extrabold tabular-nums">
                  {ticket.netWeightKg != null
                    ? ticket.netWeightKg.toLocaleString() + " KG"
                    : "PENDING"}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 flex gap-4 text-xs text-zinc-500">
            <span>Scale Indicator: <strong>XK3190-DS1</strong></span>
            <span>Unit: <strong>Kilograms (kg)</strong></span>
            <span>Weighbridge: <strong>WeighPro Station 1</strong></span>
          </div>
        </section>

        {/* ── Signatures ───────────────────────────────────────── */}
        <section className="mb-6 grid grid-cols-2 gap-8">
          <SignatureLine label="Weighbridge Operator" />
          <SignatureLine label="Supervisor / Authorised Signatory" />
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="border-t border-zinc-200 pt-4 text-xs text-zinc-400">
          <p>
            This certificate is issued by WeighPro Weighbridge Operations System and constitutes an
            official record of the weighing transaction identified above. The net weight stated
            herein is based on calibrated scale readings captured by the XK3190-DS1 indicator.
            Any discrepancy should be reported within 24 hours of issue.
          </p>
          <p className="mt-2">
            <strong>WeighPro System</strong> — Weighbridge Certificate {ticket.id} — Generated{" "}
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

/* ── Helpers ─────────────────────────────────────────────────────── */

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">{title}</h2>
      <div className="flex-1 border-t border-zinc-200" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <SectionHeading title={title} />
      <div className="rounded-md border border-zinc-200 divide-y divide-zinc-100">{children}</div>
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

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <div className="mt-8 border-b border-zinc-400" />
      <div className="mt-1.5 text-xs text-zinc-500">{label}</div>
      <div className="mt-0.5 text-xs text-zinc-400">Name: ____________________</div>
      <div className="mt-0.5 text-xs text-zinc-400">Date: ____________________</div>
    </div>
  );
}
