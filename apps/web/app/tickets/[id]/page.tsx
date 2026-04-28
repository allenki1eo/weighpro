import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { createOptionalServiceSupabaseClient } from "@/lib/supabase";
import { tickets as sampleTickets } from "@/lib/sample-data";

async function getTicket(rawId: string) {
  const id = decodeURIComponent(rawId);
  const supabase = createOptionalServiceSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("weigh_sessions")
      .select(
        "id, ticket_no, status, movement_type, counterparty_name, product, opened_at, closed_at, first_weight_kg, second_weight_kg, net_weight_kg, notes, vehicles(plate, driver_name, transport_company)",
      )
      .or(`ticket_no.eq.${id},id.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (data) {
      const v = (data as any).vehicles;
      return {
        id: (data as any).ticket_no ?? (data as any).id,
        plate: v?.plate ?? "—",
        movement: (data as any).movement_type?.replaceAll("_", " ") ?? "—",
        firstWeightKg: (data as any).first_weight_kg,
        secondWeightKg: (data as any).second_weight_kg,
        netWeightKg: (data as any).net_weight_kg,
        netWeight:
          (data as any).net_weight_kg != null
            ? (data as any).net_weight_kg.toLocaleString() + " kg"
            : "—",
        status: (data as any).status,
        driver: v?.driver_name ?? "—",
        transportCompany: v?.transport_company ?? "—",
        customer: (data as any).counterparty_name ?? "—",
        product: (data as any).product ?? "—",
        completedAt: (data as any).closed_at,
      };
    }
  }

  // Fallback to sample data
  const t = sampleTickets.find((t) => t.id === id);
  if (!t) return null;
  return { ...t, transportCompany: "—" };
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) notFound();

  return (
    <AppShell>
      <TicketDetail ticket={ticket} />
    </AppShell>
  );
}
