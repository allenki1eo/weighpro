import { NextRequest, NextResponse } from "next/server";
import { normalizePlate } from "@/lib/plate";
import { createOptionalServiceSupabaseClient } from "@/lib/supabase";
import { vehicles as sampleVehicles } from "@/lib/sample-data";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("plate") ?? "";
  if (!raw.trim()) {
    return NextResponse.json({ vehicles: [] });
  }

  const normalized = normalizePlate(raw);
  const supabase = createOptionalServiceSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("vehicles")
      .select("plate, driver_name, transport_company, rfid_tag, stored_tare_kg")
      .ilike("plate", `%${normalized}%`)
      .order("plate")
      .limit(8);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ vehicles: data ?? [] });
  }

  // Fallback to sample data when Supabase is not configured
  const matched = sampleVehicles.filter((v) =>
    normalizePlate(v.plate).includes(normalized),
  );

  return NextResponse.json({
    vehicles: matched.map((v) => ({
      plate: v.plate,
      driver_name: v.driver,
      transport_company: v.transporter,
      rfid_tag: null,
      stored_tare_kg: null,
    })),
  });
}
