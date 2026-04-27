import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabaseClient } from "@/lib/supabase";

const captureSchema = z.object({
  sessionId: z.string().uuid(),
  kind: z.enum(["first_weight", "second_weight", "manual_adjustment"]),
  weightKg: z.coerce.number().positive(),
  rawIndicatorFrame: z.string().optional(),
  stable: z.boolean().default(true),
});

export async function POST(request: Request) {
  const payload = captureSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid weight payload", details: payload.error.flatten() }, { status: 400 });
  }

  if (!payload.data.stable) {
    return NextResponse.json({ error: "Cannot save an unstable scale reading" }, { status: 409 });
  }

  const supabase = createServiceSupabaseClient();

  const { data: event, error: eventError } = await supabase
    .from("weigh_events")
    .insert({
      session_id: payload.data.sessionId,
      kind: payload.data.kind,
      weight_kg: payload.data.weightKg,
      raw_indicator_frame: payload.data.rawIndicatorFrame ?? null,
      stable: payload.data.stable,
    })
    .select("id,kind,weight_kg,captured_at")
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  const sessionPatch =
    payload.data.kind === "first_weight"
      ? { first_weight_kg: payload.data.weightKg, status: "awaiting_second_weight" }
      : payload.data.kind === "second_weight"
        ? { second_weight_kg: payload.data.weightKg, status: "completed", closed_at: new Date().toISOString() }
        : {};

  if (Object.keys(sessionPatch).length > 0) {
    const { error: updateError } = await supabase
      .from("weigh_sessions")
      .update(sessionPatch)
      .eq("id", payload.data.sessionId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  await supabase.from("audit_logs").insert({
    action: `weigh_event.${payload.data.kind}`,
    entity_type: "weigh_session",
    entity_id: payload.data.sessionId,
    metadata: {
      eventId: event.id,
      weightKg: payload.data.weightKg,
      rawIndicatorFrame: payload.data.rawIndicatorFrame ?? null,
    },
  });

  return NextResponse.json({ event });
}
