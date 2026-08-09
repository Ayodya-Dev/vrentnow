import { bffFetch } from "@/lib/api/bff";

export type Deal = {
  id: string;
  title: string;
  slug: string;
  badge: string | null;
  description: string | null;
  discountLabel: string;
  code: string | null;
  imageFileId: string | null;
  imageUrl: string | null;
  validUntilLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type DealPage = {
  items: Deal[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type DealInput = {
  title: string;
  badge?: string | null;
  description?: string | null;
  discountLabel: string;
  code?: string | null;
  imageFileId?: string | null;
  validUntilLabel?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export function listDeals(
  page = 1,
  q?: string,
  limit = 20,
): Promise<DealPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q?.trim()) params.set("q", q.trim());
  return bffFetch<DealPage>(`admin/deals?${params}`);
}

export function getDeal(id: string): Promise<Deal> {
  return bffFetch<Deal>(`admin/deals/${id}`);
}

export function createDeal(input: DealInput): Promise<Deal> {
  return bffFetch<Deal>("admin/deals", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDeal(
  id: string,
  input: Partial<DealInput>,
): Promise<Deal> {
  return bffFetch<Deal>(`admin/deals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteDeal(id: string): Promise<void> {
  return bffFetch<void>(`admin/deals/${id}`, { method: "DELETE" });
}
