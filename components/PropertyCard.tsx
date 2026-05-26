"use client";
import Link from "next/link";
import type { Property } from "@/types";

function formatKES(amount: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
}

export default function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0] ?? "/placeholder.jpg";

  return (
    <Link href={`/properties/${property.id}`} className="card group block">
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {property.is_featured && <span className="badge badge-featured">⭐ Featured</span>}
          <span className={`badge ${property.status === "available" ? "badge-available" : "badge-rented"}`}>
            {property.status === "available" ? "Available" : "Rented"}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <span className="text-white font-bold text-lg">{formatKES(property.monthly_rent)}<span className="text-sm font-normal opacity-80">/mo</span></span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-[var(--charcoal)] line-clamp-1 group-hover:text-[var(--terracotta)] transition-colors" style={{ fontFamily: "Playfair Display, serif" }}>
            {property.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-[var(--stone)] text-sm mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{property.location}, {property.town}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[var(--stone)]">
          <span className="flex items-center gap-1">
            <span>🏠</span> {property.house_type}
          </span>
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <span>🛏</span> {property.bedrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span>🚿</span> {property.bathrooms}
          </span>
        </div>

        {property.amenities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--stone)", border: "1px solid var(--border)" }}>
                {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--stone)" }}>
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}