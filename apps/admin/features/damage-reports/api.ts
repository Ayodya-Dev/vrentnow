import { bffFetch } from "@/lib/api/bff";
import type { PageMeta } from "@/components/data/pagination";

export type DamageReport = {
  id: string;
  bookingId: string;
  userId: string;
  description: string;
  resolvedAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    pickupDate: string;
    returnDate: string;
    status: string;
    vehicle: { id: string; name: string; brand: string; model: string };
  };
  user: { id: string; username: string; email: string };
};

export type DamageReportPage = { items: DamageReport[]; meta: PageMeta };

export type ListDamageReportsParams = {
  page?: number;
  resolved?: boolean;
  bookingId?: string;
};

export function listDamageReports(
  params: ListDamageReportsParams = {},
): Promise<DamageReportPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: "20",
  });
  if (params.resolved !== undefined) qs.set("resolved", String(params.resolved));
  if (params.bookingId) qs.set("bookingId", params.bookingId);
  return bffFetch<DamageReportPage>(`admin/damage-reports?${qs}`);
}

export function resolveDamageReport(id: string): Promise<DamageReport> {
  return bffFetch<DamageReport>(`admin/damage-reports/${id}/resolve`, {
    method: "PATCH",
  });
}

export function reopenDamageReport(id: string): Promise<DamageReport> {
  return bffFetch<DamageReport>(`admin/damage-reports/${id}/reopen`, {
    method: "PATCH",
  });
}
