import { createOptionalServiceSupabaseClient } from "@/lib/supabase";
import {
  tickets as sampleTickets,
  sessions as sampleSessions,
  auditItems as sampleAudit,
} from "@/lib/sample-data";

export interface DashboardStats {
  weighingsToday: number;
  netWeightTodayKg: number;
  activeSessions: number;
  awaitingSecondWeigh: number;
  amcosFuelPayable: number;
  receiptsToday: number;
  dispatchesToday: number;
}

export interface RecentTicketRow {
  id: string;
  plate: string;
  product: string | null;
  netWeightKg: number | null;
  status: string;
  movement: string | null;
  driver: string | null;
  customer: string | null;
  completedAt: string | null;
  firstWeightKg: number | null;
  secondWeightKg: number | null;
}

export interface AuditRow {
  id: string;
  action: string;
  entity: string;
  detail: string | null;
  timestamp: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createOptionalServiceSupabaseClient();

  if (supabase) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [sessionsRes, orderNotesRes] = await Promise.all([
      supabase
        .from("weigh_sessions")
        .select("id, status, net_weight_kg, movement_type, opened_at")
        .gte("opened_at", todayStart.toISOString()),
      supabase
        .from("order_notes")
        .select("fuel_payable_amount")
        .not("fuel_payable_amount", "is", null),
    ]);

    const sessions = sessionsRes.data ?? [];
    const orderNotes = orderNotesRes.data ?? [];

    const completed = sessions.filter((s) => s.status === "completed");
    const netWeightKg = completed.reduce(
      (sum, s) => sum + (s.net_weight_kg ?? 0),
      0,
    );
    const active = sessions.filter((s) => s.status !== "completed" && s.status !== "cancelled");
    const awaitingSecond = sessions.filter((s) => s.status === "awaiting_second_weight");

    const receipts = sessions.filter(
      (s) =>
        s.movement_type === "raw_material_receipt" ||
        s.movement_type === "raw_cotton_receipt",
    ).length;
    const dispatches = sessions.filter(
      (s) => s.movement_type === "finished_goods_dispatch",
    ).length;

    const fuelTotal = orderNotes.reduce(
      (sum, n) => sum + (n.fuel_payable_amount ?? 0),
      0,
    );

    return {
      weighingsToday: completed.length,
      netWeightTodayKg: netWeightKg,
      activeSessions: active.length,
      awaitingSecondWeigh: awaitingSecond.length,
      amcosFuelPayable: fuelTotal,
      receiptsToday: receipts,
      dispatchesToday: dispatches,
    };
  }

  // Sample data fallback
  const completed = sampleTickets.filter((t) => t.status === "completed");
  const netKg = completed.reduce((s, t) => s + (t.netWeightKg ?? 0), 0);
  const active = sampleSessions.length;
  const awaitingSecond = sampleSessions.filter(
    (s) => s.status === "awaiting_second_weight",
  ).length;

  return {
    weighingsToday: completed.length,
    netWeightTodayKg: netKg,
    activeSessions: active,
    awaitingSecondWeigh: awaitingSecond,
    amcosFuelPayable: 1_209_450,
    receiptsToday: 8,
    dispatchesToday: 3,
  };
}

export async function getRecentTickets(limit = 5): Promise<RecentTicketRow[]> {
  const supabase = createOptionalServiceSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("weigh_sessions")
      .select(
        "id, ticket_no, status, movement_type, counterparty_name, product, notes, opened_at, closed_at, first_weight_kg, second_weight_kg, net_weight_kg, vehicles(plate, driver_name)",
      )
      .order("opened_at", { ascending: false })
      .limit(limit);

    if (data) {
      return data.map((row: any) => ({
        id: row.ticket_no ?? row.id,
        plate: row.vehicles?.plate ?? "—",
        product: row.product,
        netWeightKg: row.net_weight_kg,
        status: row.status,
        movement: row.movement_type?.replaceAll("_", " ") ?? null,
        driver: row.vehicles?.driver_name ?? null,
        customer: row.counterparty_name,
        completedAt: row.closed_at,
        firstWeightKg: row.first_weight_kg,
        secondWeightKg: row.second_weight_kg,
      }));
    }
  }

  // Sample data fallback
  return sampleTickets.slice(0, limit).map((t) => ({
    id: t.id,
    plate: t.plate,
    product: t.product,
    netWeightKg: t.netWeightKg,
    status: t.status,
    movement: t.movement,
    driver: t.driver,
    customer: t.customer,
    completedAt: t.completedAt,
    firstWeightKg: t.firstWeightKg,
    secondWeightKg: t.secondWeightKg,
  }));
}

export async function getAllTickets(): Promise<RecentTicketRow[]> {
  const supabase = createOptionalServiceSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("weigh_sessions")
      .select(
        "id, ticket_no, status, movement_type, counterparty_name, product, opened_at, closed_at, first_weight_kg, second_weight_kg, net_weight_kg, vehicles(plate, driver_name)",
      )
      .order("opened_at", { ascending: false })
      .limit(200);

    if (data) {
      return data.map((row: any) => ({
        id: row.ticket_no ?? row.id,
        plate: row.vehicles?.plate ?? "—",
        product: row.product,
        netWeightKg: row.net_weight_kg,
        status: row.status,
        movement: row.movement_type?.replaceAll("_", " ") ?? null,
        driver: row.vehicles?.driver_name ?? null,
        customer: row.counterparty_name,
        completedAt: row.closed_at,
        firstWeightKg: row.first_weight_kg,
        secondWeightKg: row.second_weight_kg,
      }));
    }
  }

  // Sample data fallback
  return sampleTickets.map((t) => ({
    id: t.id,
    plate: t.plate,
    product: t.product,
    netWeightKg: t.netWeightKg,
    status: t.status,
    movement: t.movement,
    driver: t.driver,
    customer: t.customer,
    completedAt: t.completedAt,
    firstWeightKg: t.firstWeightKg,
    secondWeightKg: t.secondWeightKg,
  }));
}

export async function getRecentAuditLogs(limit = 6): Promise<AuditRow[]> {
  const supabase = createOptionalServiceSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data) {
      return data.map((row: any) => ({
        id: row.id,
        action: row.action,
        entity: `${row.entity_type}:${row.entity_id}`,
        detail: row.metadata?.detail ?? null,
        timestamp: new Date(row.created_at).toLocaleString(),
      }));
    }
  }

  // Sample data fallback
  return sampleAudit.slice(0, limit).map((a) => ({
    id: a.id,
    action: a.action,
    entity: a.entity,
    detail: a.detail,
    timestamp: a.timestamp,
  }));
}
