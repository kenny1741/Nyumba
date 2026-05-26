import { createServerSupabaseClient } from "@/lib/supabase-server";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertiesFilter from "@/components/PropertiesFilter";
import type { Property, PropertyFilters } from "@/types";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function getProperties(filters: PropertyFilters & { featured?: string }): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();
  let q = supabase
    .from("properties")
    .select("*, profiles(full_name, phone, whatsapp)")
    .eq("status", "available")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(48);

  if (filters.town)       q = q.eq("town", filters.town);
  if (filters.house_type) q = q.eq("house_type", filters.house_type);
  if (filters.min_rent)   q = q.gte("monthly_rent", filters.min_rent);
  if (filters.max_rent)   q = q.lte("monthly_rent", filters.max_rent);
  if (filters.featured === "true") q = q.eq("is_featured", true);
  if (filters.search) {
    q = q.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,town.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data } = await q;
  return data ?? [];
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params  = await searchParams;
  const filters = {
    town:       params.town,
    house_type: params.house_type as any,
    min_rent:   params.min_rent ? parseInt(params.min_rent) : undefined,
    max_rent:   params.max_rent ? parseInt(params.max_rent) : undefined,
    search:     params.search,
    featured:   params.featured,
  };

  const properties = await getProperties(filters);

  const hasFilters = !!(filters.town || filters.house_type || filters.search || filters.min_rent || filters.max_rent);
  const title = filters.town
    ? `Properties in ${filters.town}`
    : filters.house_type
    ? `${filters.house_type} Rentals in Kenya`
    : filters.search
    ? `Search results for "${filters.search}"`
    : "All Properties in Kenya";

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="py-12" style={{ background: "var(--forest)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-green-300">{properties.length} properties found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <PropertiesFilter initialFilters={filters} />
            </aside>

            {/* Grid */}
            <main className="flex-1">
              {properties.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🏚️</div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>No properties found</h3>
                  <p className="text-[var(--stone)] mb-6">Try adjusting your filters or search in a different area</p>
                  <a href="/properties" className="btn-primary">Clear Filters</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
