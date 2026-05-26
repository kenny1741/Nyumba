export type HouseType =
  | "Single Room"
  | "Bedsitter"
  | "Studio"
  | "1 Bedroom"
  | "2 Bedroom"
  | "3 Bedroom"
  | "Maisonette";

export type PropertyStatus = "available" | "rented" | "pending";
export type PropertySource = "manual" | "api" | "csv" | "rss" | "import";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  role: "landlord" | "admin";
  is_verified: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string | null;
  house_type: HouseType;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  town: string;
  county: string;
  directions: string | null;
  google_maps_url: string | null;
  amenities: string[];
  images: string[];
  phone: string | null;
  whatsapp: string | null;
  status: PropertyStatus;
  is_featured: boolean;
  is_verified: boolean;
  source: PropertySource;
  source_id: string | null;
  source_url: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface PropertyFilters {
  town?: string;
  house_type?: HouseType | "";
  min_rent?: number;
  max_rent?: number;
  search?: string;
  status?: PropertyStatus;
}

export const KENYAN_TOWNS = [
  "Nairobi", "Westlands", "Kilimani", "Karen", "Lavington",
  "Kasarani", "Roysambu", "Ruaka", "Ruiru", "Juja", "Thika",
  "Kiambu", "Limuru", "Githunguri", "Kikuyu", "Rongai",
  "Ngong", "Kitengela", "Athi River", "Mlolongo", "Syokimau",
  "Mombasa", "Nyali", "Bamburi", "Kisauni", "Likoni",
  "Nakuru", "Eldoret", "Kisumu", "Meru", "Embu",
  "Machakos", "Kajiado", "Malindi", "Nanyuki", "Nyahururu",
];

export const HOUSE_TYPES: HouseType[] = [
  "Single Room", "Bedsitter", "Studio",
  "1 Bedroom", "2 Bedroom", "3 Bedroom", "Maisonette",
];

export const AMENITIES_LIST = [
  "Water 24/7", "Borehole", "Electricity", "Solar Power",
  "Parking", "Security Guard", "CCTV", "Perimeter Wall",
  "Balcony", "Rooftop", "Garden", "Swimming Pool",
  "Gym", "WiFi Ready", "DSH Ready", "Backup Generator",
  "Servant Quarter", "Store Room", "Modern Kitchen",
  "En-suite Bathroom", "Walk-in Closet", "Tiled Floors",
];
