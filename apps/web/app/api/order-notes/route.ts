import { normalizePlate } from "@weighpro/core";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabaseClient } from "../../../lib/supabase";

const orderNoteSchema = z.object({
  externalNoteId: z.string().min(1),
  businessUnit: z.string().optional(),
  movementType: z.string().optional(),
  materialCategory: z.string().optional(),
  counterpartyName: z.string().optional(),
  customerName: z.string().min(1),
  vehiclePlate: z.string().min(1),
  driverName: z.string().optional(),
  product: z.string().min(1),
  destination: z.string().optional(),
  quantity: z.coerce.number().optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.ORDER_INGEST_TOKEN;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = orderNoteSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload", details: payload.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const normalizedPlate = normalizePlate(payload.data.vehiclePlate);

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .upsert(
      {
        plate: normalizedPlate,
        driver_name: payload.data.driverName ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plate" },
    )
    .select("id")
    .single();

  if (vehicleError) {
    return NextResponse.json({ error: vehicleError.message }, { status: 500 });
  }

  const { data: orderNote, error: orderError } = await supabase
    .from("order_notes")
    .upsert(
      {
        external_note_id: payload.data.externalNoteId,
        business_unit: payload.data.businessUnit ?? null,
        movement_type: payload.data.movementType ?? null,
        material_category: payload.data.materialCategory ?? null,
        counterparty_name: payload.data.counterpartyName ?? null,
        customer_name: payload.data.customerName,
        vehicle_id: vehicle.id,
        vehicle_plate: normalizedPlate,
        driver_name: payload.data.driverName ?? null,
        product: payload.data.product,
        destination: payload.data.destination ?? null,
        quantity: payload.data.quantity ?? null,
        scheduled_at: payload.data.scheduledAt ?? null,
        notes: payload.data.notes ?? null,
        raw_payload: payload.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "external_note_id" },
    )
    .select("id, external_note_id")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  await supabase.from("integration_events").insert({
    source: "business-system",
    event_type: "movement_note.upserted",
    external_id: payload.data.externalNoteId,
    status: "processed",
    payload: payload.data,
  });

  return NextResponse.json({ orderNote });
}
