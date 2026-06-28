export type ProductCategory =
  | "sofa"
  | "dining"
  | "wardrobe"
  | "bed"
  | "accessory"
  | "other";

export const CATEGORIES: ProductCategory[] = [
  "sofa", "dining", "wardrobe", "bed", "accessory", "other",
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  sofa:      "Sofas",
  dining:    "Dining",
  wardrobe:  "Wardrobes",
  bed:       "Beds",
  accessory: "Accessories",
  other:     "Other",
};

export interface Product {
  id:                string;
  title:             string;
  slug:              string;
  category:          ProductCategory;
  description:       string | null;
  material:          string | null;
  finish:            string | null;
  dimensions:        string | null;
  price_range_min:   number | null;
  price_range_max:   number | null;
  delivery_timeline: string | null;
  image_url:         string | null;
  featured:          boolean;
  active:            boolean;
  sort_order:        number;
  created_at:        string;
  updated_at:        string;
}

export type ProductPayload = Omit<Product, "id" | "created_at" | "updated_at">;

export function formatPriceRange(
  min: number | null,
  max: number | null
): string {
  if (!min && !max) return "Custom Quote";
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min)         return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
