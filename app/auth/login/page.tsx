"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--terracotta)" }}>
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: "Playfair Display, serif" }}>Nyumba</span>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
            Welcome Back,<br />Landlord 🏠
          </h2>
          <p className="text-green-200 text-lg max-w-sm mx-auto">
            Manage your properties, track inquiries, and reach thousands of tenants across Kenya.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--terracotta)" }}>
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "Playfair Display, serif", color: "var(--terracotta)" }}>Nyumba</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>Sign In</h1>
          <p className="text-[var(--stone)] mb-8">Enter your details to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-field"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold">Password</label>
                <Link href="/auth/forgot-password" className="text-sm hover:underline" style={{ color: "var(--terracotta)" }}>Forgot?</Link>
              </div>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input-field"
              />
            </div>

            {error && (
              <div className="text-sm p-3 rounded-xl" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[var(--stone)]">
            No account?{" "}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: "var(--terracotta)" }}>
              Register free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
