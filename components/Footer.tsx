import Link from "next/link";
import { KENYAN_TOWNS, HOUSE_TYPES } from "@/types";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--charcoal)", color: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--terracotta)" }}>
                <span className="text-white font-bold">N</span>
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "Playfair Display, serif" }}>Nyumba</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
              Kenya&apos;s premier property rental platform. Find your perfect home across all major towns and cities.
            </p>
            <div className="flex gap-3 mt-6">
              {["Facebook", "Twitter", "Instagram"].map(s => (
                <a key={s} href="#" className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Popular Towns */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--gold)" }}>Popular Towns</h4>
            <ul className="space-y-2">
              {KENYAN_TOWNS.slice(0, 8).map(t => (
                <li key={t}>
                  <Link href={`/properties?town=${t}`} className="text-sm transition-colors hover:text-white" style={{ color: "#9CA3AF" }}>
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--gold)" }}>Property Types</h4>
            <ul className="space-y-2">
              {HOUSE_TYPES.map(t => (
                <li key={t}>
                  <Link href={`/properties?house_type=${encodeURIComponent(t)}`} className="text-sm transition-colors hover:text-white" style={{ color: "#9CA3AF" }}>
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Landlords */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--gold)" }}>For Landlords</h4>
            <ul className="space-y-2">
              {[
                { label: "List Your Property", href: "/auth/register" },
                { label: "Landlord Dashboard",  href: "/dashboard" },
                { label: "Import Properties",   href: "/dashboard/import" },
                { label: "Sign In",             href: "/auth/login" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: "#9CA3AF" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "var(--gold)" }}>🆓 Always Free</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>List unlimited properties at no cost, ever.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-sm" style={{ color: "#6B7280" }}>© {year} Nyumba Kenya. All rights reserved.</p>
          <div className="flex gap-6 text-sm" style={{ color: "#6B7280" }}>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
