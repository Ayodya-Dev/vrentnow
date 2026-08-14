import { bffDownload, bffFetch } from "@/lib/api/bff";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "HANDED_OVER"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentProvider = "PAYHERE" | "KOKOPAY" | "PAYZY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type Payment = {
  id: string;
  amount: string | number;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
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
  paymentMethod: PaymentProvider;
  notes: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  /** Signed/public URL for the rental agreement photo only (never NIC/licence). */
  agreementUrl?: string | null;
  vehicle: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    model: string;
    pricePerDay: string | number;
    status: string;
  };
  payment?: Payment | null;
};

export type BookingPage = {
  items: Booking[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type CreateBookingInput = {
  vehicleId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  paymentMethod: PaymentProvider;
  notes?: string;
};

export const PAYMENT_OPTIONS: {
  value: PaymentProvider;
  label: string;
  blurb: string;
}[] = [
  {
    value: "KOKOPAY",
    label: "KokoPay",
    blurb: "Buy now, pay later — 3 or 6 month installments",
  },
  {
    value: "PAYZY",
    label: "Payzy",
    blurb: "Flexible installment repayment plans",
  },
  {
    value: "PAYHERE",
    label: "PayHere",
    blurb: "Cards, bank transfer, eZ Cash & mCash",
  },
];

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return bffFetch<Booking>("bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listMyBookings(page = 1): Promise<BookingPage> {
  const qs = new URLSearchParams({ page: String(page), limit: "20" });
  return bffFetch<BookingPage>(`bookings?${qs}`);
}

export function getMyBooking(id: string): Promise<Booking> {
  return bffFetch<Booking>(`bookings/${id}`);
}

export function cancelMyBooking(id: string, reason?: string): Promise<Booking> {
  return bffFetch<Booking>(`bookings/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function completeSandboxPayment(id: string): Promise<Booking> {
  return bffFetch<Booking>(`bookings/${id}/pay/sandbox`, { method: "POST" });
}

export type PayHereCheckout = {
  checkoutUrl: string;
  fields: Record<string, string>;
};

export function initiatePayHereCheckout(id: string): Promise<PayHereCheckout> {
  return bffFetch<PayHereCheckout>(`bookings/${id}/pay/payhere/initiate`, {
    method: "POST",
  });
}

export function downloadReceipt(id: string): Promise<void> {
  return bffDownload(`bookings/${id}/receipt`, `vrentnow-receipt-${id}.pdf`);
}

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
  return iso.slice(0, 10);
}

/** Inclusive calendar days between YYYY-MM-DD dates. */
export function estimateDays(pickup: string, returnDate: string): number {
  if (!pickup || !returnDate) return 0;
  const a = Date.parse(`${pickup}T00:00:00Z`);
  const b = Date.parse(`${returnDate}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.floor((b - a) / 86400000) + 1;
}

export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}
