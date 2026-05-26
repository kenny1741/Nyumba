"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KENYAN_TOWNS, HOUSE_TYPES } from "@/types";

interface Props {
  initialFilters: {
    town?: string;
    house_type?: string;
    min_rent?: number;
    max_rent?: number;
    search?: string;
  };
}

export default function PropertiesFilter({ initialFilters }: Props) {
  const [town,      setTown]      = useState(initialFilters.town ?? "");
  const [houseType, setHouseType] = useState(initialFilters.house_type ?? "");
  const [minRent,   setMinRent]   = useState(initialFilters.min_rent?.toString() ?? "");
  const [maxRent,   setMaxRent]   = useState(initialFilters.max_rent?.toString() ?? "");
  const [search,    setSearch]    = useState(initialFilters.search ?? "");
  const router = useRouter();

  const apply = () => {
    const p = new URLSearchParams();
    if (search)    p.set("search",     search);
    if (town)      p.set("town",       town);
    if (houseType) p.set("house_type", houseType);
    if (minRent)   p.set("min_rent",   minRent);
    if (maxRent)   p.set("max_rent",   maxRent);
    router.push(`/properties?${p.toString()}`);
  };

  const clear = () => {
    setTown(""); setHouseType(""); setMinRent(""); setMaxRent(""); setSearch("");
    router.push("/properties");
  };

  return (
    <div className="rounded-2xl p-6 sticky top-20" style={{ background: "white", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>Filters</h3>
        <button onClick={clear} className="text-xs text-[var(--stone)] hover:text-[var(--terracotta)] transition-colors">Clear all</button>
      </div>

      <div className="space-y-5">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--charcoal)" }}>Keyword</label>
          <input
            type="text"
            placeholder="e.g. garden, parking..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Town */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--charcoal)" }}>Location</label>
          <select value={town} onChange={e => setTown(e.target.value)} className="input-field text-sm">
            <option value="">All Locations</option>
            {KENYAN_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* House type */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--charcoal)" }}>House Type</label>
          <div className="space-y-2">
            {["", ...HOUSE_TYPES].map(t => (
              <label key={t || "all"} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="house_type"
                  value={t}
                  checked={houseType === t}
                  onChange={() => setHouseType(t)}
                  className="accent-[var(--terracotta)]"
                />
                <span className="text-sm group-hover:text-[var(--terracotta)] transition-colors" style={{ color: "var(--charcoal)" }}>
                  {t || "All Types"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rent range */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--charcoal)" }}>Monthly Rent (KES)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minRent}
              onChange={e => setMinRent(e.target.value)}
              className="input-field text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxRent}
              onChange={e => setMaxRent(e.target.value)}
              className="input-field text-sm"
            />
          </div>
        </div>

        <button onClick={apply} className="btn-primary w-full justify-center">Apply Filters</button>
      </div>
    </div>
  );
}
