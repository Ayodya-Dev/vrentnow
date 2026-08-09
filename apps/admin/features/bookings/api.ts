import { bffFetch } from "@/lib/api/bff";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "HANDED_OVER"
  | "COMPLETED"
  | "CANCELLED";

export type BookingVehicleRef = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  pricePerDay: string | number;
  status: string;
};

export type BookingUserRef = {
  id: string;
  email: string;
  username: string;
};

export type Booking = {
  id: string;
  userId: string;
  vehicleId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  status: BookingStatus;
  totalAmount: string | number;
  paymentMethod: "PAYHERE" | "KOKOPAY" | "PAYZY";
  notes: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  nicFileId?: string | null;
  licenceFileId?: string | null;
  agreementFileId?: string | null;
  nicUrl?: string | null;
  licenceUrl?: string | null;
  agreementUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: BookingVehicleRef;
  user: BookingUserRef;
  payment?: {
    id: string;
    amount: string | number;
    provider: string;
    status: "PENDING" | "PAID" | "FAILED";
    transactionId: string | null;
    paidAt: string | null;
  } | null;
};

export type BookingPage = {
  items: Booking[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type ListBookingsParams = {
  page?: number;
  q?: string;
  status?: BookingStatus;
  userId?: string;
  paid?: boolean;
};

export function listBookings(params: ListBookingsParams = {}): Promise<BookingPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: "20",
  });
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.status) qs.set("status", params.status);
  if (params.userId) qs.set("userId", params.userId);
  if (params.paid !== undefined) qs.set("paid", String(params.paid));
  return bffFetch<BookingPage>(`admin/bookings?${qs}`);
}

export function markBookingPaid(id: string): Promise<Booking> {
  return bffFetch<Booking>(`admin/bookings/${id}/payment/paid`, {
    method: "POST",
  });
}

export function getBooking(id: string): Promise<Booking> {
  return bffFetch<Booking>(`admin/bookings/${id}`);
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus,
  cancelReason?: string,
): Promise<Booking> {
  return bffFetch<Booking>(`admin/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, cancelReason }),
  });
}

export function updateHandoverDocs(
  id: string,
  body: {
    nicFileId?: string | null;
    licenceFileId?: string | null;
    agreementFileId?: string | null;
  },
): Promise<Booking> {
  return bffFetch<Booking>(`admin/bookings/${id}/handover-docs`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "HANDED_OVER", label: "Handed over" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const NEXT_STATUSES: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["HANDED_OVER", "CANCELLED"],
  HANDED_OVER: ["COMPLETED"],
};

export function formatMoney(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return String(amount);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDateOnly(iso: string): string {
  const d = iso.slice(0, 10);
  return d;
}
