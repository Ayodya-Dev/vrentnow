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
  /** Resolved public URLs for imageFileIds (from API). */
  imageUrls?: string[];
  categoryId: string;
  category: VehicleCategory;
  createdAt: string;
};

export type VehiclePage = {
  items: Vehicle[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type ListVehiclesParams = {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  categoryIds?: string;
  fuel?: string;
  transmission?: string;
  seats?: number;
  seatsMin?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: "asc" | "desc";
};

export function listVehicles(params: ListVehiclesParams = {}): Promise<VehiclePage> {
  const {
    page = 1,
    limit = 12,
    q,
    categoryId,
    categoryIds,
    fuel,
    transmission,
    seats,
    seatsMin,
    minPrice,
    maxPrice,
    sortBy,
    order,
  } = params;

  return getPublic<VehiclePage>("vehicles", {
    params: {
      page,
      limit,
      q: q || undefined,
      categoryId: categoryId || undefined,
      categoryIds: categoryIds || undefined,
      fuel: fuel || undefined,
      transmission: transmission || undefined,
      seats: seats ?? undefined,
      seatsMin: seatsMin ?? undefined,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      sortBy: sortBy || undefined,
      order: order || undefined,
    },
    revalidate: false,
  });
}

export function getVehicle(slug: string): Promise<Vehicle> {
  return getPublic<Vehicle>(`vehicles/${slug}`, { revalidate: false });
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

export function vehicleCoverUrl(vehicle: Vehicle): string | null {
  return vehicle.imageUrls?.[0] ?? null;
}

export function formatTransmission(value: string): string {
  switch (value) {
    case "AUTOMATIC":
      return "Auto";
    case "MANUAL":
      return "Manual";
    default:
      return value;
  }
}

export function formatFuel(value: string): string {
  switch (value) {
    case "PETROL":
      return "Petrol";
    case "DIESEL":
      return "Diesel";
    case "HYBRID":
      return "Hybrid";
    case "ELECTRIC":
      return "Electric";
    default:
      return value;
  }
}

export function formatStatus(status: string): {
  label: string;
  dot: string;
  glow: string;
} {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available",
        dot: "bg-[#22C55E]",
        glow: "shadow-[#22C55E66]",
      };
    case "RENTED":
      return {
        label: "Reserved",
        dot: "bg-[#F59E0B]",
        glow: "shadow-[#F59E0B66]",
      };
    case "MAINTENANCE":
      return {
        label: "Maintenance",
        dot: "bg-[#EF4444]",
        glow: "shadow-[#EF444466]",
      };
    default:
      return {
        label: status,
        dot: "bg-[#6B7280]",
        glow: "shadow-[#6B728066]",
      };
  }
}
