import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getSession } from "@/lib/supabase-server";

// ── CSV parser (no external deps) ────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines  = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const vals: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    vals.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

// ── Normalise a raw row → property insert shape ───────────────────────────────
function normaliseRow(row: Record<string, string>, landlordId: string, source: string, sourceId?: string) {
  const clean = (s: string) => (s ?? "").replace(/[^\x00-\x7F]/g, "").trim();
  const houseTypes = ["Single Room","Bedsitter","Studio","1 Bedroom","2 Bedroom","3 Bedroom","Maisonette"];
  let houseType = clean(row.house_type ?? row["type"] ?? "Bedsitter");
  if (!houseTypes.includes(houseType)) houseType = "Bedsitter";

  return {
    landlord_id:    landlordId,
    title:          clean(row.title         ?? row.name ?? "Untitled Property"),
    description:    clean(row.description   ?? row.desc ?? ""),
    house_type:     houseType,
    monthly_rent:   parseInt(row.monthly_rent ?? row.rent ?? row.price ?? "0") || 0,
    bedrooms:       parseInt(row.bedrooms    ?? row.beds ?? "0") || 0,
    bathrooms:      parseInt(row.bathrooms   ?? row.baths ?? "1") || 1,
    location:       clean(row.location      ?? row.address ?? ""),
    town:           clean(row.town          ?? row.city ?? "Nairobi"),
    county:         clean(row.county        ?? "Nairobi"),
    directions:     clean(row.directions    ?? ""),
    google_maps_url: clean(row.google_maps_url ?? row.maps ?? row.map_url ?? ""),
    phone:          clean(row.phone         ?? row.contact ?? ""),
    whatsapp:       clean(row.whatsapp      ?? row.phone ?? ""),
    amenities:      (row.amenities ?? "").split("|").map(a => a.trim()).filter(Boolean),
    images:         (row.images    ?? "").split("|").map(i => i.trim()).filter(Boolean),
    status:         "available" as const,
    source:         source as any,
    source_id:      sourceId ?? null,
    source_url:     clean(row.source_url ?? row.url ?? ""),
  };
}

// ── Upsert rows, skipping duplicates ─────────────────────────────────────────
async function upsertRows(
  supabase: any,
  rows: ReturnType<typeof normaliseRow>[]
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let imported = 0, skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    // Skip if missing required fields
    if (!row.title || !row.monthly_rent || row.monthly_rent < 100) {
      skipped++;
      continue;
    }

    // Duplicate check by source_id or title+town+rent
    if (row.source_id) {
      const { data: existing } = await supabase
        .from("properties")
        .select("id")
        .eq("source_id", row.source_id)
        .maybeSingle();
      if (existing) { skipped++; continue; }
    } else {
      const { data: existing } = await supabase
        .from("properties")
        .select("id")
        .eq("title",        row.title)
        .eq("town",         row.town)
        .eq("monthly_rent", row.monthly_rent)
        .maybeSingle();
      if (existing) { skipped++; continue; }
    }

    const { error } = await supabase.from("properties").insert(row);
    if (error) errors.push(`${row.title}: ${error.message}`);
    else imported++;
  }

  return { imported, skipped, errors };
}

// ── Parse RSS feed ────────────────────────────────────────────────────────────
function parseRSS(xml: string): Record<string, string>[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  return items.map(item => {
    const get = (tag: string) => item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.+?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`))?.[1] ?? item.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`))?.[1] ?? "";
    return {
      title:       get("title"),
      description: get("description"),
      source_url:  get("link"),
      source_id:   get("guid") || get("link"),
      location:    get("category"),
    };
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServerSupabaseClient();
  const fd = await req.formData();

  const sourceType = fd.get("source_type") as string;
  const url        = fd.get("url")         as string | null;
  const file       = fd.get("file")        as File   | null;

  let rows: Record<string, string>[] = [];

  try {
    if (sourceType === "csv" && file) {
      const text = await file.text();
      rows = parseCSV(text);
    } else if (sourceType === "api" && url) {
      const res  = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!res.ok) return NextResponse.json({ error: `API returned ${res.status}` }, { status: 400 });
      const data = await res.json();
      rows = Array.isArray(data) ? data : (data.results ?? data.data ?? data.listings ?? []);
    } else if (sourceType === "rss" && url) {
      const res  = await fetch(url);
      if (!res.ok) return NextResponse.json({ error: `RSS returned ${res.status}` }, { status: 400 });
      const xml  = await res.text();
      rows = parseRSS(xml);
    } else {
      return NextResponse.json({ error: "Invalid source type or missing file/URL" }, { status: 400 });
    }

    if (!rows.length) return NextResponse.json({ error: "No rows found in source" }, { status: 400 });

    const normalised = rows.map((r, i) =>
      normaliseRow(r, session.user.id, sourceType, r.source_id ?? r.id ?? r.guid ?? `${sourceType}-${Date.now()}-${i}`)
    );

    const result = await upsertRows(supabase, normalised);

    // Log the import job
    await supabase.from("import_jobs").insert({
      landlord_id:  session.user.id,
      source_type:  sourceType,
      source_url:   url ?? null,
      status:       "done",
      total:        rows.length,
      imported:     result.imported,
      skipped:      result.skipped,
      errors:       result.errors,
      finished_at:  new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Import error:", e);
    return NextResponse.json({ error: e.message ?? "Import failed" }, { status: 500 });
  }
}
