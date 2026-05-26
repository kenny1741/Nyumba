"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import type { Property } from "@/types";

function formatKES(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

export default function PropertyDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // increment views
      try { await supabase.rpc("increment_views", { property_id: id }); } catch {}

      const { data } = await supabase
        .from("properties")
        .select("*, profiles(full_name, phone, whatsapp, is_verified)")
        .eq("id", id)
        .single();
      setProperty(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-[var(--stone)]">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Property not found</h2>
          <a href="/properties" className="btn-primary">Browse Properties</a>
        </div>
      </div>
    );
  }

  const landlord    = property.profiles;
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in your property: ${property.title}`);
  const whatsappNum = property.whatsapp ?? landlord?.whatsapp ?? "";

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-[var(--stone)]">
            <a href="/" className="hover:text-[var(--terracotta)]">Home</a>
            <span className="mx-2">/</span>
            <a href="/properties" className="hover:text-[var(--terracotta)]">Properties</a>
            <span className="mx-2">/</span>
            <a href={`/properties?town=${property.town}`} className="hover:text-[var(--terracotta)]">{property.town}</a>
            <span className="mx-2">/</span>
            <span className="text-[var(--charcoal)]">{property.title}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <ImageGallery images={property.images} title={property.title} />

              {/* Header */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`badge ${property.status === "available" ? "badge-available" : "badge-rented"}`}>
                    {property.status === "available" ? "✓ Available" : "Rented"}
                  </span>
                  {property.is_featured && <span className="badge badge-featured">⭐ Featured</span>}
                  {property.is_verified && <span className="badge" style={{ background: "#DBEAFE", color: "#1E40AF" }}>✓ Verified</span>}
                </div>
                <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>{property.title}</h1>
                <div className="flex items-center gap-2 text-[var(--stone)] mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{property.location}, {property.town}, {property.county}</span>
                </div>
                <div className="text-3xl font-bold" style={{ color: "var(--terracotta)" }}>
                  {formatKES(property.monthly_rent)}<span className="text-lg font-normal text-[var(--stone)]">/month</span>
                </div>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: "🏠", label: "Type",      value: property.house_type },
                  { icon: "🛏", label: "Bedrooms",  value: property.bedrooms > 0 ? property.bedrooms : "–" },
                  { icon: "🚿", label: "Bathrooms", value: property.bathrooms },
                  { icon: "👁", label: "Views",     value: property.views },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "white", border: "1px solid var(--border)" }}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xs text-[var(--stone)] mb-1">{s.label}</div>
                    <div className="font-bold text-sm">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid var(--border)" }}>
                  <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>About This Property</h2>
                  <p className="text-[var(--stone)] leading-relaxed whitespace-pre-wrap">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid var(--border)" }}>
                  <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>Amenities & Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((a: string) => (
                      <div key={a} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: "#D1FAE5", color: "#065F46" }}>✓</span>
                        <span style={{ color: "var(--charcoal)" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Directions */}
              {property.directions && (
                <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid var(--border)" }}>
                  <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>How to Get There</h2>
                  <p className="text-[var(--stone)] leading-relaxed">{property.directions}</p>
                  {property.google_maps_url && (
                    <a href={property.google_maps_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-semibold"
                      style={{ color: "var(--terracotta)" }}>
                      📍 Open in Google Maps →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-2xl p-6 sticky top-20" style={{ background: "white", border: "1px solid var(--border)" }}>
                <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>Contact Landlord</h3>

                {landlord && (
                  <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg" style={{ background: "var(--forest)" }}>
                      {landlord.full_name?.[0] ?? "L"}
                    </div>
                    <div>
                      <div className="font-semibold">{landlord.full_name ?? "Landlord"}</div>
                      <div className="text-xs text-[var(--stone)]">
                        {landlord.is_verified ? "✓ Verified Landlord" : "Property Owner"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {(property.phone ?? landlord?.phone) && (
                    <a href={`tel:${property.phone ?? landlord?.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "var(--cream)", border: "1px solid var(--border)", color: "var(--charcoal)" }}>
                      📞 Call: {property.phone ?? landlord?.phone}
                    </a>
                  )}

                  {whatsappNum && (
                    <a href={`https://wa.me/${whatsappNum.replace(/\D/g, "")}?text=${whatsappMsg}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                      style={{ background: "#25D366" }}>
                      💬 WhatsApp
                    </a>
                  )}

                  <a href={`sms:${property.phone ?? landlord?.phone ?? ""}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: "var(--terracotta)", color: "white" }}>
                    ✉️ Send SMS
                  </a>
                </div>

                <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="text-xs text-[var(--stone)] space-y-2">
                    <div className="flex justify-between">
                      <span>Listed</span>
                      <span>{new Date(property.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="font-semibold" style={{ color: property.status === "available" ? "#065F46" : "#991B1B" }}>
                        {property.status === "available" ? "Available" : "Rented"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}