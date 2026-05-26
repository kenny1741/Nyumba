"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--terracotta)" }}>
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "Playfair Display, serif", color: "var(--terracotta)" }}>Nyumba</span>
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>Reset Password</h1>
        <p className="text-[var(--stone)] mb-8">Enter your email and we&apos;ll send a reset link</p>

        {sent ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "white", border: "1px solid var(--border)" }}>
            <div className="text-5xl mb-4">📬</div>
            <h3 className="font-bold text-lg mb-2">Check your email</h3>
            <p className="text-sm text-[var(--stone)] mb-6">We sent a password reset link to <strong>{email}</strong></p>
            <Link href="/auth/login" className="btn-primary justify-center w-full">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="rounded-2xl p-6 space-y-4" style={{ background: "white", border: "1px solid var(--border)" }}>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" />
            </div>
            {error && <div className="text-sm p-3 rounded-xl" style={{ background: "#FEE2E2", color: "#991B1B" }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center text-sm text-[var(--stone)]">
              <Link href="/auth/login" className="hover:underline" style={{ color: "var(--terracotta)" }}>Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
