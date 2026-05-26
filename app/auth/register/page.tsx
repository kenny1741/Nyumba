"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with phone
    if (data.user && phone) {
      await supabase.from("profiles").update({ phone, whatsapp: phone }).eq("id", data.user.id);
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--terracotta)" }}>
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: "Playfair Display, serif" }}>Nyumba</span>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
            List Your Property<br />100% Free 🎉
          </h2>
          <div className="space-y-4 text-left max-w-sm mx-auto mt-8">
            {["Create your landlord account", "Upload property photos", "Reach tenants across Kenya", "Mark as rented when done"].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--gold)", color: "var(--charcoal)" }}>{i + 1}</span>
                <span className="text-green-100 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>Create Account</h1>
          <p className="text-[var(--stone)] mb-8">Free forever — no hidden fees</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Kamau" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="input-field" />
            </div>

            {error && (
              <div className="text-sm p-3 rounded-xl" style={{ background: "#FEE2E2", color: "#991B1B" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? "Creating account..." : "Create Free Account"}
            </button>

            <p className="text-xs text-center text-[var(--stone)]">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>

          <p className="text-center mt-6 text-sm text-[var(--stone)]">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "var(--terracotta)" }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
