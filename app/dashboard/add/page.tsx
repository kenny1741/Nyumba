import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import PropertyForm from "@/components/PropertyForm";

export default async function AddPropertyPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <a href="/dashboard" className="text-sm text-[var(--stone)] hover:text-[var(--terracotta)] flex items-center gap-1 mb-4">
              ← Back to Dashboard
            </a>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>Add New Property</h1>
            <p className="text-[var(--stone)] mt-1">Fill in the details below to list your property</p>
          </div>
          <PropertyForm userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
