import { bffFetch } from "@/lib/api/bff";

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

export type DamageReportPage = {
  items: DamageReport[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export function createDamageReport(input: {
  bookingId: string;
  description: string;
}): Promise<DamageReport> {
  return bffFetch<DamageReport>("damage-reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listMyDamageReports(
  bookingId?: string,
): Promise<DamageReportPage> {
  const qs = new URLSearchParams({ page: "1", limit: "20" });
  if (bookingId) qs.set("bookingId", bookingId);
  return bffFetch<DamageReportPage>(`damage-reports/mine?${qs}`);
}
