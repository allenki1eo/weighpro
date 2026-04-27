import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePlate } from "@/lib/plate";
import { createServiceSupabaseClient } from "@/lib/supabase";

const createSessionSchema = z.object({
  plate: z.string().min(1),
  driverName: z.string().optional(),
  transportCompany: z.string().optional(),
  movementType: z.string().optional(),
  direction: z.enum(["inbound", "outbound", "internal"]).default("inbound"),
  customerName: z.string().optional(),
  product: z.string().optional(),
  orderNoteId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = createSessionSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid session payload", details: payload.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const plate = normalizePlate(payload.data.plate);
  const now = new Date().toISOString();

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .upsert(
      {
        plate,
        driver_name: payload.data.driverName ?? null,
        transport_company: payload.data.transportCompany ?? null,
        updated_at: now,
      },
      { onConflict: "plate" },
    )
    .select("id,plate")
    .single();

  if (vehicleError) {
    return NextResponse.json({ error: vehicleError.message }, { status: 500 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("weigh_sessions")
    .insert({
      order_note_id: payload.data.orderNoteId ?? null,
      vehicle_id: vehicle.id,
      status: "awaiting_first_weight",
      direction: payload.data.direction,
      movement_type: payload.data.movementType ?? null,
      counterparty_name: payload.data.customerName ?? null,
      product: payload.data.product ?? null,
      notes: payload.data.notes ?? null,
    })
    .select("id,ticket_no,status")
    .single();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    action: "weigh_session.created",
    entity_type: "weigh_session",
    entity_id: session.id,
    metadata: { plate, movementType: payload.data.movementType ?? null },
  });

  return NextResponse.json({ session: { ...session, plate } }, { status: 201 });
}
