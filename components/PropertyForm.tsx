"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { HOUSE_TYPES, KENYAN_TOWNS, AMENITIES_LIST } from "@/types";
import type { Property } from "@/types";

interface Props {
  userId: string;
  property?: Property;
}

export default function PropertyForm({ userId, property }: Props) {
  const isEdit = !!property;
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title:          property?.title ?? "",
    description:    property?.description ?? "",
    house_type:     property?.house_type ?? "Bedsitter",
    monthly_rent:   property?.monthly_rent?.toString() ?? "",
    bedrooms:       property?.bedrooms?.toString() ?? "0",
    bathrooms:      property?.bathrooms?.toString() ?? "1",
    location:       property?.location ?? "",
    town:           property?.town ?? "Nairobi",
    county:         property?.county ?? "Nairobi",
    directions:     property?.directions ?? "",
    google_maps_url: property?.google_maps_url ?? "",
    phone:          property?.phone ?? "",
    whatsapp:       property?.whatsapp ?? "",
  });

  const [amenities,  setAmenities]  = useState<string[]>(property?.amenities ?? []);
  const [images,     setImages]     = useState<string[]>(property?.images ?? []);
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [uploadProg, setUploadProg] = useState(0);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext  = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${i}.${ext}`;
      const { data, error } = await supabase.storage.from("properties").upload(path, file, { upsert: true });
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from("properties").getPublicUrl(path);
        uploaded.push(publicUrl);
      }
      setUploadProg(Math.round(((i + 1) / files.length) * 100));
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
    setUploadProg(0);
  };

  const removeImage = (url: string) => setImages(prev => prev.filter(i => i !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      monthly_rent: parseInt(form.monthly_rent),
      bedrooms:     parseInt(form.bedrooms),
      bathrooms:    parseInt(form.bathrooms),
      amenities,
      images,
      landlord_id:  userId,
    };

    if (isEdit) {
      const { error } = await supabase.from("properties").update(payload).eq("id", property!.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("properties").insert(payload);
      if (error) { setError(error.message); setSaving(false); return; }
    }

    router.push("/dashboard");
  };

  const sectionClass = "rounded-2xl p-6 mb-6";
  const sectionStyle = { background: "white", border: "1px solid var(--border)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* Basic info */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Playfair Display, serif" }}>Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Property Title *</label>
            <input required value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Modern 1BR in Juja near JKUAT" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">House Type *</label>
              <select required value={form.house_type} onChange={e => set("house_type", e.target.value)} className="input-field">
                {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Monthly Rent (KES) *</label>
              <input required type="number" min="500" value={form.monthly_rent} onChange={e => set("monthly_rent", e.target.value)} placeholder="8000" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Bedrooms</label>
              <input type="number" min="0" value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bathrooms</label>
              <input type="number" min="1" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              rows={4} placeholder="Describe the property, neighborhood, nearby facilities..." className="input-field resize-none" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Playfair Display, serif" }}>Location</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Exact Location / Estate *</label>
            <input required value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Kahawa West, near Total Petrol Station" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Town *</label>
              <select required value={form.town} onChange={e => set("town", e.target.value)} className="input-field">
                {KENYAN_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">County</label>
              <input value={form.county} onChange={e => set("county", e.target.value)} placeholder="Nairobi" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Directions</label>
            <textarea value={form.directions} onChange={e => set("directions", e.target.value)}
              rows={2} placeholder="e.g. Take matatu No. 45 from town, alight at Total, 200m walk..." className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Google Maps Link</label>
            <input type="url" value={form.google_maps_url} onChange={e => set("google_maps_url", e.target.value)} placeholder="https://maps.google.com/..." className="input-field" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Playfair Display, serif" }}>Contact Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number *</label>
            <input required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0712 345 678" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
            <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="0712 345 678" className="input-field" />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Playfair Display, serif" }}>Amenities & Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMENITIES_LIST.map(a => (
            <label key={a} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--cream)] transition-colors">
              <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-[var(--terracotta)] w-4 h-4" />
              <span className="text-sm">{a}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Playfair Display, serif" }}>Property Photos</h2>
        <div
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--terracotta)] transition-colors mb-4"
          style={{ borderColor: "var(--border)" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
          {uploading ? (
            <div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: "var(--cream)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${uploadProg}%`, background: "var(--terracotta)" }} />
              </div>
              <p className="text-sm text-[var(--stone)]">Uploading {uploadProg}%...</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📷</div>
              <p className="font-semibold mb-1">Click to upload photos</p>
              <p className="text-sm text-[var(--stone)]">JPG, PNG, WEBP supported. Multiple files OK.</p>
            </>
          )}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden group" style={{ height: 80 }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(img)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl">
                  ✕
                </button>
                {i === 0 && <span className="absolute top-1 left-1 text-xs bg-[var(--gold)] text-[var(--charcoal)] px-1.5 py-0.5 rounded font-bold">Cover</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>{error}</div>
      )}

      <div className="flex gap-4">
        <a href="/dashboard" className="btn-outline flex-1 justify-center py-3">Cancel</a>
        <button type="submit" disabled={saving || uploading} className="btn-primary flex-1 justify-center py-3 text-base">
          {saving ? "Saving..." : isEdit ? "Update Property" : "Publish Listing"}
        </button>
      </div>
    </form>
  );
}
