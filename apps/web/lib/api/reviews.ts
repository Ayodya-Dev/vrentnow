import { apiFetch } from "@/lib/api/client";
import { bffFetch } from "@/lib/api/bff";

export type ReviewPublic = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { username: string };
};

export type VehicleReviewsPage = {
  items: ReviewPublic[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  stats: { average: number | null; count: number };
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  bookingId: string;
  vehicleId: string;
  status: ReviewStatus;
  createdAt: string;
};

export function listVehicleReviews(
  vehicleId: string,
  page = 1,
): Promise<VehicleReviewsPage> {
  const qs = new URLSearchParams({
    vehicleId,
    page: String(page),
    limit: "10",
  });
  return apiFetch<VehicleReviewsPage>(`reviews?${qs}`);
}

export function getMyReviewForBooking(
  bookingId: string,
): Promise<Review | null> {
  return bffFetch<Review | null>(`reviews/booking/${bookingId}`);
}

export function createReview(input: {
  bookingId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return bffFetch<Review>("reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
