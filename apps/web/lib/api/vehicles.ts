import { getPublic } from "@/lib/api/public";

export type VehicleCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  fuel: string;
  transmission: string;
  pricePerDay: string | number;
  status: string;
  description: string | null;
  imageFileIds: string[];
  categoryId: string;
  category: VehicleCategory;
  createdAt: string;
};

export type VehiclePage = {
  items: Vehicle[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export function listVehicles(page = 1): Promise<VehiclePage> {
  return getPublic<VehiclePage>("vehicles", { params: { page, limit: 12 } });
}

export function getVehicle(slug: string): Promise<Vehicle> {
  return getPublic<Vehicle>(`vehicles/${slug}`);
}

export function formatPricePerDay(price: string | number): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(n);
}
