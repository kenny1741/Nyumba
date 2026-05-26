import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = req.nextUrl;

  let q = supabase
    .from("properties")
    .select("*, profiles(full_name, phone)")
    .eq("status", "available")
    .order("is_featured", { ascending: false })
    .order("created_at",  { ascending: false });

  const town       = searchParams.get("town");
  const house_type = searchParams.get("house_type");
  const min_rent   = searchParams.get("min_rent");
  const max_rent   = searchParams.get("max_rent");
  const search     = searchParams.get("search");
  const limit      = parseInt(searchParams.get("limit") ?? "20");
  const page       = parseInt(searchParams.get("page")  ?? "0");

  if (town)       q = q.eq("town",        town);
  if (house_type) q = q.eq("house_type",  house_type);
  if (min_rent)   q = q.gte("monthly_rent", parseInt(min_rent));
  if (max_rent)   q = q.lte("monthly_rent", parseInt(max_rent));
  if (search)     q = q.or(`title.ilike.%${search}%,location.ilike.%${search}%,town.ilike.%${search}%`);

  q = q.range(page * limit, (page + 1) * limit - 1);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, page, limit });
}
