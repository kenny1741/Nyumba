"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Tab = "csv" | "api" | "rss";

export default function ImportPage() {
  const [tab,      setTab]      = useState<Tab>("csv");
  const [url,      setUrl]      = useState("");
  const [file,     setFile]     = useState<File | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<any>(null);
  const [error,    setError]    = useState("");
  const router = useRouter();

  const handleImport = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const fd = new FormData();
    fd.append("source_type", tab);
    if (url)  fd.append("url", url);
    if (file) fd.append("file", file);

    const res  = await fetch("/api/import", { method: "POST", body: fd });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Import failed");
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <a href="/dashboard" className="text-sm text-[var(--stone)] hover:text-[var(--terracotta)] flex items-center gap-1 mb-6">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>Import Properties</h1>
          <p className="text-[var(--stone)] mb-8">Bulk-import listings from CSV files, external APIs, or RSS feeds.</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "white", border: "1px solid var(--border)" }}>
            {(["csv", "api", "rss"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all uppercase"
                style={{
                  background: tab === t ? "var(--terracotta)" : "transparent",
                  color:      tab === t ? "white" : "var(--stone)",
                }}>
                {t === "csv" ? "📄 CSV / Excel" : t === "api" ? "🔌 API" : "📡 RSS Feed"}
              </button>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid var(--border)" }}>
            {tab === "csv" && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>Upload CSV File</h3>
                <div className="rounded-xl p-4 text-sm" style={{ background: "var(--cream)", border: "1px solid var(--border)" }}>
                  <p className="font-semibold mb-2">Required CSV columns:</p>
                  <code className="text-xs block text-[var(--stone)]">
                    title, house_type, monthly_rent, location, town, county, description, phone, amenities (pipe-separated)
                  </code>
                </div>
                <label
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer hover:border-[var(--terracotta)] transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={e => setFile(e.target.files?.[0] ?? null)} className="hidden" />
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-semibold">{file ? file.name : "Click to select CSV or Excel file"}</p>
                  <p className="text-sm text-[var(--stone)]">Supports .csv, .xlsx, .xls</p>
                </label>
              </div>
            )}

            {tab === "api" && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>Import from API</h3>
                <p className="text-sm text-[var(--stone)]">Enter a REST API endpoint that returns a JSON array of properties.</p>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/listings" className="input-field" />
                <div className="rounded-xl p-4 text-sm" style={{ background: "var(--cream)" }}>
                  <p className="font-semibold mb-1">Expected JSON format:</p>
                  <pre className="text-xs text-[var(--stone)] overflow-x-auto">{`[{
  "title": "2BR Apartment",
  "house_type": "2 Bedroom",
  "monthly_rent": 25000,
  "location": "Westlands",
  "town": "Nairobi",
  "phone": "0712345678"
}]`}</pre>
                </div>
              </div>
            )}

            {tab === "rss" && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>Import from RSS Feed</h3>
                <p className="text-sm text-[var(--stone)]">Enter the URL of a property listing RSS feed.</p>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/properties.rss" className="input-field" />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>{error}</div>
            )}

            {result && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: "#D1FAE5" }}>
                <p className="font-bold text-green-800">✅ Import Complete!</p>
                <p className="text-sm text-green-700 mt-1">
                  Imported: {result.imported} · Skipped (duplicates): {result.skipped} · Errors: {result.errors}
                </p>
              </div>
            )}

            <button onClick={handleImport} disabled={loading || (!file && !url)}
              className="btn-primary w-full justify-center py-3 mt-6">
              {loading ? "Importing..." : "Start Import"}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-8 rounded-2xl p-6" style={{ background: "white", border: "1px solid var(--border)" }}>
            <h3 className="font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>Import Tips</h3>
            <ul className="space-y-2 text-sm text-[var(--stone)]">
              <li>✓ Duplicate listings are automatically detected and skipped</li>
              <li>✓ Imported listings are marked with their source (CSV/API/RSS)</li>
              <li>✓ You can edit imported listings after import</li>
              <li>✓ Large imports may take a few minutes to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
