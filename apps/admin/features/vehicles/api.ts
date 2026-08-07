import { bffFetch } from "@/lib/api/bff";

export type VehicleCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type TransmissionType = "AUTOMATIC" | "MANUAL";
export type VehicleStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  fuel: FuelType;
  transmission: TransmissionType;
  pricePerDay: string | number;
  status: VehicleStatus;
  description: string | null;
  imageFileIds: string[];
  imageUrls?: string[];
  categoryId: string;
  category: VehicleCategoryRef;
  createdAt: string;
  updatedAt: string;
};

export type VehiclePage = {
  items: Vehicle[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type VehicleInput = {
  name: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  fuel: FuelType;
  transmission: TransmissionType;
  pricePerDay: number;
  categoryId: string;
  status?: VehicleStatus;
  description?: string;
  imageFileIds?: string[];
};

export type ListVehiclesParams = {
  page?: number;
  q?: string;
  categoryId?: string;
  status?: VehicleStatus;
};

export function listVehicles(params: ListVehiclesParams = {}): Promise<VehiclePage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: "20",
  });
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.status) qs.set("status", params.status);
  return bffFetch<VehiclePage>(`admin/vehicles?${qs}`);
}

export function getVehicle(id: string): Promise<Vehicle> {
  return bffFetch<Vehicle>(`admin/vehicles/${id}`);
}

export function createVehicle(input: VehicleInput): Promise<Vehicle> {
  return bffFetch<Vehicle>("admin/vehicles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateVehicle(
  id: string,
  input: Partial<VehicleInput>,
): Promise<Vehicle> {
  return bffFetch<Vehicle>(`admin/vehicles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteVehicle(id: string): Promise<void> {
  return bffFetch<void>(`admin/vehicles/${id}`, { method: "DELETE" });
}

export const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ELECTRIC", label: "Electric" },
];

export const TRANSMISSION_OPTIONS: { value: TransmissionType; label: string }[] = [
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "MANUAL", label: "Manual" },
];

export const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RENTED", label: "Rented" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "INACTIVE", label: "Inactive" },
];
