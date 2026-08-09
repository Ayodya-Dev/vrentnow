import { bffFetch } from "@/lib/api/bff";
import type { PageMeta } from "@/components/data/pagination";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  bookingId: string;
  vehicleId: string;
  createdAt: string;
  user: { id: string; username: string; email: string };
  vehicle: {
    id: string;
    name: string;
    brand: string;
    model: string;
    slug: string;
  };
  booking: { id: string; status: string };
};

export type ReviewPage = { items: Review[]; meta: PageMeta };

export type ListReviewsParams = {
  page?: number;
  status?: ReviewStatus;
};

export function listReviews(
  params: ListReviewsParams = {},
): Promise<ReviewPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: "20",
  });
  if (params.status) qs.set("status", params.status);
  return bffFetch<ReviewPage>(`admin/reviews?${qs}`);
}

export function approveReview(id: string): Promise<Review> {
  return bffFetch<Review>(`admin/reviews/${id}/approve`, { method: "PATCH" });
}

export function rejectReview(id: string): Promise<Review> {
  return bffFetch<Review>(`admin/reviews/${id}/reject`, { method: "PATCH" });
}
