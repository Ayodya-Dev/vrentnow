import { bffFetch } from "@/lib/api/bff";
import type { Vehicle, VehiclePage } from "@/lib/api/vehicles";

export type FavouritePage = VehiclePage;

export function listFavourites(page = 1): Promise<FavouritePage> {
  const qs = new URLSearchParams({ page: String(page), limit: "20" });
  return bffFetch<FavouritePage>(`favourites?${qs}`);
}

export function favouriteIds(): Promise<string[]> {
  return bffFetch<string[]>("favourites/ids");
}

export function addFavourite(vehicleId: string): Promise<{ vehicleId: string }> {
  return bffFetch<{ vehicleId: string }>(`favourites/${vehicleId}`, {
    method: "PUT",
  });
}

export function removeFavourite(vehicleId: string): Promise<void> {
  return bffFetch<void>(`favourites/${vehicleId}`, { method: "DELETE" });
}

export type { Vehicle };
