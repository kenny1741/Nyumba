"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KENYAN_TOWNS, HOUSE_TYPES } from "@/types";

export default function SearchBar() {
  const [search,    setSearch]    = useState("");
  const [town,      setTown]      = useState("");
  const [houseType, setHouseType] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search)    params.set("search", search);
    if (town)      params.set("town", town);
    if (houseType) params.set("house_type", houseType);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl p-3 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-2xl" style={{ background: "white" }}>
      {/* Search input */}
      <div className="flex-1 flex items-center gap-2 px-3">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--stone)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by location or keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          className="flex-1 outline-none text-sm py-2"
          style={{ fontFamily: "DM Sans, sans-serif", color: "var(--charcoal)" }}
        />
      </div>

      <div className="w-px bg-[var(--border)] hidden sm:block" />

      {/* Town */}
      <select
        value={town}
        onChange={e => setTown(e.target.value)}
        className="px-3 py-2 text-sm outline-none rounded-xl"
        style={{ fontFamily: "DM Sans, sans-serif", color: town ? "var(--charcoal)" : "var(--stone)", minWidth: 130 }}
      >
        <option value="">Any Location</option>
        {KENYAN_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <div className="w-px bg-[var(--border)] hidden sm:block" />

      {/* House type */}
      <select
        value={houseType}
        onChange={e => setHouseType(e.target.value)}
        className="px-3 py-2 text-sm outline-none rounded-xl"
        style={{ fontFamily: "DM Sans, sans-serif", color: houseType ? "var(--charcoal)" : "var(--stone)", minWidth: 130 }}
      >
        <option value="">Any Type</option>
        {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <button onClick={handleSearch} className="btn-primary rounded-xl px-6 py-2 text-sm whitespace-nowrap">
        Search
      </button>
    </div>
  );
}
