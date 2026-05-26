"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [user, setUser]           = useState<any>(null);
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isHome   = pathname === "/";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navBg = isHome
    ? (scrolled ? "bg-white shadow-md" : "bg-transparent")
    : "bg-white shadow-sm";

  const textColor = isHome && !scrolled ? "text-white" : "text-[var(--charcoal)]";
  const logoColor = isHome && !scrolled ? "text-white" : "text-[var(--terracotta)]";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--terracotta)" }}>
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${logoColor}`} style={{ fontFamily: "Playfair Display, serif" }}>
              Nyumba
            </span>
          </Link>

          {/* Desktop nav */}
          <div className={`hidden md:flex items-center gap-6 text-sm font-medium ${textColor}`}>
            <Link href="/properties" className="hover:text-[var(--terracotta)] transition-colors">Browse</Link>
            <Link href="/properties?featured=true" className="hover:text-[var(--terracotta)] transition-colors">Featured</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-[var(--terracotta)] transition-colors">Dashboard</Link>
                <button onClick={handleSignOut} className="hover:text-[var(--terracotta)] transition-colors">Sign Out</button>
                <Link href="/dashboard/add" className="btn-primary text-sm px-5 py-2">+ List Property</Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-[var(--terracotta)] transition-colors">Sign In</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-5 py-2">List Your Property</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className={`md:hidden ${textColor}`} onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-4 py-4 space-y-3">
          <Link href="/properties" className="block text-sm font-medium py-2">Browse Properties</Link>
          <Link href="/properties?featured=true" className="block text-sm font-medium py-2">Featured</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm font-medium py-2">Dashboard</Link>
              <Link href="/dashboard/add" className="block text-sm font-medium py-2 text-[var(--terracotta)]">+ List Property</Link>
              <button onClick={handleSignOut} className="block text-sm font-medium py-2 text-red-500">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block text-sm font-medium py-2">Sign In</Link>
              <Link href="/auth/register" className="block btn-primary text-center">List Your Property</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
