import { bffFetch } from "@/lib/api/bff";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "HANDED_OVER"
  | "COMPLETED"
  | "CANCELLED";

export type VehicleStatus =
  | "AVAILABLE"
  | "RENTED"
  | "MAINTENANCE"
  | "INACTIVE";

export type MonthlyPoint = {
  month: string;
  label: string;
  revenue: string;
  bookings: number;
};

export type RecentBooking = {
  id: string;
  firstName: string;
  lastName: string;
  pickupDate: string;
  status: BookingStatus;
  totalAmount: string | number;
  vehicle: { brand: string; model: string; name: string };
};

export type DashboardStats = {
  bookingsByStatus: Record<BookingStatus, number>;
  activeBookings: number;
  vehiclesByStatus: Record<VehicleStatus, number>;
  revenuePaidTotal: string;
  revenuePaidThisMonth: string;
  bookingsCreatedToday: number;
  overdueRentals: number;
  monthly: MonthlyPoint[];
  recentBookings: RecentBooking[];
};

export function getDashboardStats(): Promise<DashboardStats> {
  return bffFetch<DashboardStats>("admin/dashboard/stats");
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

export function shortBookingId(id: string): string {
  return `BK-${id.slice(-4).toUpperCase()}`;
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
