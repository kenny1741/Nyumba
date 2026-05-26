import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import type { Property } from "@/types";
import { KENYAN_TOWNS } from "@/types";

async function getFeatured(): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("properties")
    .select("*, profiles(full_name, phone, whatsapp)")
    .eq("status", "available")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getLatest(): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("properties")
    .select("*, profiles(full_name, phone, whatsapp)")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

async function getStats() {
  const supabase = await createServerSupabaseClient();
  const { count: total }    = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "available");
  const { count: landlords } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: towns }    = await supabase.from("properties").select("town", { count: "exact", head: true }).eq("status", "available");
  return { total: total ?? 0, landlords: landlords ?? 0, towns: towns ?? 0 };
}

const POPULAR_TOWNS = ["Nairobi", "Juja", "Thika", "Ruiru", "Kiambu", "Rongai", "Kitengela", "Mombasa"];

const TOWN_EMOJIS: Record<string, string> = {
  Nairobi: "🏙️", Juja: "🌿", Thika: "🏭", Ruiru: "🌳",
  Kiambu: "☕", Rongai: "🌄", Kitengela: "🦁", Mombasa: "🌊",
};

export default async function HomePage() {
  const [featured, latest, stats] = await Promise.all([getFeatured(), getLatest(), getStats()]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden min-h-[88vh] flex items-center">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full" style={{ background: "var(--gold)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: "var(--terracotta)", filter: "blur(100px)" }} />
        </div>
        {/* Kenyan-inspired geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <polygon points="30,5 55,20 55,40 30,55 5,40 5,20" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium animate-fade-up"
              style={{ background: "rgba(212,168,71,0.2)", color: "var(--gold-light)", border: "1px solid rgba(212,168,71,0.3)" }}>
              🇰🇪 Kenya&apos;s Premier Rental Platform
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-up delay-1">
              Find Your<br />
              <span style={{ color: "var(--gold)" }}>Perfect Home</span><br />
              in Kenya
            </h1>
            <p className="text-lg text-green-100 mb-10 max-w-xl animate-fade-up delay-2">
              Browse thousands of rental properties across Kenya. From cozy bedsitters in Juja to luxury apartments in Nairobi — your dream home is one search away.
            </p>

            {/* Search */}
            <div className="animate-fade-up delay-3">
              <SearchBar />
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 animate-fade-up delay-4">
              {[
                { value: stats.total.toLocaleString(), label: "Active Listings" },
                { value: stats.landlords.toLocaleString(), label: "Landlords" },
                { value: "40+", label: "Towns Covered" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-green-300 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Locations ─────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>Explore By Area</p>
            <h2 className="text-4xl font-bold" style={{ color: "var(--charcoal)" }}>Popular Locations</h2>
          </div>
          <Link href="/properties" className="btn-outline hidden sm:flex">View All</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {POPULAR_TOWNS.map((town, i) => (
            <Link
              key={town}
              href={`/properties?town=${town}`}
              className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, var(--forest) 0%, #0D2B1F 100%)`,
                border: "1px solid var(--border)",
                animationDelay: `${i * 0.05}s`
              }}
            >
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">{TOWN_EMOJIS[town] ?? "🏘️"}</div>
                <h3 className="font-bold text-white text-lg mb-1" style={{ fontFamily: "Playfair Display, serif" }}>{town}</h3>
                <p className="text-green-300 text-xs">Find homes here →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Properties ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-20 pattern-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>Hand-Picked</p>
                <h2 className="text-4xl font-bold" style={{ color: "var(--charcoal)" }}>Featured Properties</h2>
              </div>
              <Link href="/properties?featured=true" className="btn-outline hidden sm:flex">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Listings ───────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>Just Added</p>
            <h2 className="text-4xl font-bold" style={{ color: "var(--charcoal)" }}>Latest Listings</h2>
          </div>
          <Link href="/properties" className="btn-outline hidden sm:flex">Browse All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latest.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
        <div className="text-center mt-10">
          <Link href="/properties" className="btn-primary">Browse All Properties</Link>
        </div>
      </section>

      {/* ── CTA for Landlords ─────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--forest)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Are You a Landlord?</h2>
          <p className="text-green-200 text-lg mb-8 max-w-2xl mx-auto">
            List your property for free and reach thousands of tenants across Kenya. No hidden fees — completely free forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-gold text-lg px-8 py-4">🏠 List Your Property Free</Link>
            <Link href="/properties" className="btn-outline text-white border-white hover:bg-white hover:text-[var(--forest)] text-lg px-8 py-4">Browse Listings</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
