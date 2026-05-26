import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, getSession } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import DashboardPropertyCard from "@/components/DashboardPropertyCard";
import type { Property } from "@/types";

async function getLandlordProperties(userId: string): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("landlord_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const supabase    = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  const properties  = await getLandlordProperties(session.user.id);

  const available = properties.filter(p => p.status === "available").length;
  const rented    = properties.filter(p => p.status === "rented").length;
  const totalViews = properties.reduce((sum, p) => sum + (p.views ?? 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
                Welcome, {profile?.full_name?.split(" ")[0] ?? "Landlord"} 👋
              </h1>
              <p className="text-[var(--stone)] mt-1">{session.user.email}</p>
            </div>
            <Link href="/dashboard/add" className="btn-primary">+ Add Property</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Listings",    value: properties.length, icon: "🏘️", color: "var(--forest)" },
              { label: "Available",          value: available,         icon: "✅", color: "#065F46" },
              { label: "Rented",             value: rented,            icon: "🔑", color: "var(--terracotta)" },
              { label: "Total Views",        value: totalViews,        icon: "👁",  color: "var(--gold)" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-6" style={{ background: "white", border: "1px solid var(--border)" }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm text-[var(--stone)]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Import section */}
          <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, var(--forest) 0%, #0D2B1F 100%)" }}>
            <div>
              <h3 className="font-bold text-white mb-1">Import Properties in Bulk</h3>
              <p className="text-green-300 text-sm">Upload a CSV file or import from an API/RSS feed</p>
            </div>
            <Link href="/dashboard/import" className="btn-gold flex-shrink-0">📥 Import Properties</Link>
          </div>

          {/* Properties */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>Your Properties</h2>
            </div>

            {properties.length === 0 ? (
              <div className="rounded-2xl p-16 text-center" style={{ background: "white", border: "2px dashed var(--border)" }}>
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>No properties yet</h3>
                <p className="text-[var(--stone)] mb-6">Add your first listing and start reaching tenants today</p>
                <Link href="/dashboard/add" className="btn-primary">+ Add Your First Property</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(p => <DashboardPropertyCard key={p.id} property={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
