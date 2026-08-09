import { bffFetch } from "@/lib/api/bff";
import type { PageMeta } from "@/components/data/pagination";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InquiryPage = { items: Inquiry[]; meta: PageMeta };

export type ListInquiriesParams = {
  page?: number;
  q?: string;
  isRead?: boolean;
};

export function listInquiries(
  params: ListInquiriesParams = {},
): Promise<InquiryPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: "20",
  });
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.isRead !== undefined) qs.set("isRead", String(params.isRead));
  return bffFetch<InquiryPage>(`admin/inquiries?${qs}`);
}

export function markInquiryRead(id: string): Promise<Inquiry> {
  return bffFetch<Inquiry>(`admin/inquiries/${id}/read`, { method: "PATCH" });
}

export function markInquiryUnread(id: string): Promise<Inquiry> {
  return bffFetch<Inquiry>(`admin/inquiries/${id}/unread`, { method: "PATCH" });
}

export function deleteInquiry(id: string): Promise<void> {
  return bffFetch<void>(`admin/inquiries/${id}`, { method: "DELETE" });
}
