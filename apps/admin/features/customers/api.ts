import { bffFetch } from "@/lib/api/bff";
import type { PageMeta } from "@/components/data/pagination";

export type Customer = {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  contactName: string | null;
  createdAt: string;
  disabledAt: string | null;
  lockedUntil: string | null;
  failedLoginAttempts: number;
  bookingCount: number;
};

export type CustomerPage = { items: Customer[]; meta: PageMeta };

export type ListCustomersParams = {
  page?: number;
  search?: string;
  disabled?: boolean;
};

export function listCustomers(
  params: ListCustomersParams = {},
): Promise<CustomerPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: "20",
  });
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.disabled !== undefined) qs.set("disabled", String(params.disabled));
  return bffFetch<CustomerPage>(`admin/customers?${qs}`);
}

export function getCustomer(id: string): Promise<Customer> {
  return bffFetch<Customer>(`admin/customers/${id}`);
}

export function disableCustomer(id: string): Promise<Customer> {
  return bffFetch<Customer>(`admin/customers/${id}/disable`, { method: "POST" });
}

export function enableCustomer(id: string): Promise<Customer> {
  return bffFetch<Customer>(`admin/customers/${id}/enable`, { method: "POST" });
}

export function unlockCustomer(id: string): Promise<Customer> {
  return bffFetch<Customer>(`admin/customers/${id}/unlock`, { method: "POST" });
}

export function isLocked(customer: Customer): boolean {
  if (!customer.lockedUntil) return false;
  return new Date(customer.lockedUntil).getTime() > Date.now();
}
