import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePlate } from "@/lib/plate";
import { createServiceSupabaseClient } from "@/lib/supabase";

const cameraReadSchema = z.object({
  cameraId: z.string().min(1),
  plate: z.string().min(1),
  confidence: z.coerce.number().min(0).max(1).optional(),
  imageUrl: z.string().url().optional(),
  rawPayload: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const expectedToken = process.env.CAMERA_INGEST_TOKEN;
  const authHeader = request.headers.get("authorization");

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = cameraReadSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid camera payload", details: payload.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const plate = normalizePlate(payload.data.plate);

  const { data: vehicle } = await supabase.from("vehicles").select("id").eq("plate", plate).maybeSingle();
  const { data: session } = await supabase
    .from("weigh_sessions")
    .select("id,vehicles!inner(plate)")
    .eq("vehicles.plate", plate)
    .neq("status", "completed")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: read, error } = await supabase
    .from("camera_reads")
    .insert({
      camera_id: payload.data.cameraId,
      plate,
      confidence: payload.data.confidence ?? null,
      image_url: payload.data.imageUrl ?? null,
      matched_vehicle_id: vehicle?.id ?? null,
      matched_session_id: session?.id ?? null,
      raw_payload: payload.data.rawPayload ?? payload.data,
    })
    .select("id,plate,matched_session_id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    action: "camera_read.received",
    entity_type: "camera_read",
    entity_id: read.id,
    metadata: { plate, matchedSessionId: read.matched_session_id },
  });

  return NextResponse.json({ read }, { status: 201 });
}
