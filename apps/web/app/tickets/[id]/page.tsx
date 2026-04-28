import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { tickets } from "@/lib/sample-data";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = tickets.find((t) => t.id === decodeURIComponent(id));

  if (!ticket) notFound();

  return (
    <AppShell>
      <TicketDetail ticket={ticket} />
    </AppShell>
  );
}
