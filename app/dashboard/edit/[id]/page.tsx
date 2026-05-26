import { redirect, notFound } from "next/navigation";
import { createServerSupabaseClient, getSession } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import PropertyForm from "@/components/PropertyForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const supabase = await createServerSupabaseClient();
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("landlord_id", session.user.id)
    .single();

  if (!property) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <a href="/dashboard" className="text-sm text-[var(--stone)] hover:text-[var(--terracotta)] flex items-center gap-1 mb-4">
              ← Back to Dashboard
            </a>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>Edit Property</h1>
            <p className="text-[var(--stone)] mt-1">{property.title}</p>
          </div>
          <PropertyForm userId={session.user.id} property={property} />
        </div>
      </div>
    </div>
  );
}
