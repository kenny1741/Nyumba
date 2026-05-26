"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Property } from "@/types";

function formatKES(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPropertyCard({ property }: { property: Property }) {
  const [loading, setLoading] = useState(false);
  const router   = useRouter();
  const supabase = createClient();
  const image    = property.images?.[0] ?? "/placeholder.jpg";

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = property.status === "available" ? "rented" : "available";
    await supabase.from("properties").update({ status: newStatus }).eq("id", property.id);
    router.refresh();
    setLoading(false);
  };

  const deleteProperty = async () => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    setLoading(true);
    await supabase.from("properties").delete().eq("id", property.id);
    router.refresh();
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid var(--border)" }}>
      <div className="relative h-44 overflow-hidden">
        <img src={image} alt={property.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }} />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${property.status === "available" ? "badge-available" : "badge-rented"}`}>
            {property.status === "available" ? "Available" : "Rented"}
          </span>
          {property.is_featured && <span className="badge badge-featured">⭐</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <span className="text-white font-bold text-sm">{formatKES(property.monthly_rent)}/mo</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold mb-1 line-clamp-1" style={{ fontFamily: "Playfair Display, serif" }}>{property.title}</h3>
        <p className="text-sm text-[var(--stone)] mb-1">📍 {property.town}</p>
        <p className="text-sm text-[var(--stone)] mb-4">🏠 {property.house_type} · 👁 {property.views} views</p>

        <div className="grid grid-cols-3 gap-2">
          <Link href={`/dashboard/edit/${property.id}`}
            className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: "var(--cream)", border: "1px solid var(--border)", color: "var(--charcoal)" }}>
            ✏️ Edit
          </Link>
          <button onClick={toggleStatus} disabled={loading}
            className="flex items-center justify-center py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: property.status === "available" ? "#FEF3C7" : "#D1FAE5", color: property.status === "available" ? "#92400E" : "#065F46" }}>
            {property.status === "available" ? "🔑 Rented" : "✅ Available"}
          </button>
          <button onClick={deleteProperty} disabled={loading}
            className="flex items-center justify-center py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: "#FEE2E2", color: "#991B1B" }}>
            🗑 Delete
          </button>
        </div>

        <Link href={`/properties/${property.id}`}
          className="mt-2 flex items-center justify-center py-2 rounded-xl text-xs font-semibold transition-colors w-full"
          style={{ background: "var(--cream)", color: "var(--stone)", border: "1px solid var(--border)" }}>
          👁 View Public Listing
        </Link>
      </div>
    </div>
  );
}
