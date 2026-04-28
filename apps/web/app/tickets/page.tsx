import { Suspense } from "react";
import { getAllTickets } from "@/lib/server-data";
import { TicketsClient } from "@/components/tickets/tickets-client";
import { AppShell } from "@/components/layout/app-shell";

export default async function TicketsPage() {
  const tickets = await getAllTickets();

  return (
    <AppShell>
      <Suspense fallback={null}>
        <TicketsClient initialTickets={tickets} />
      </Suspense>
    </AppShell>
  );
}
