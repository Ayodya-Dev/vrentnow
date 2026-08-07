import type { Permission } from "@/lib/permissions";

/**
 * The admin nav. Each entry declares the permission needed to see it, and the
 * shell hides the ones the signed-in user cannot use.
 *
 * `Items` belongs to the example feature — rename it when you build a real one.
 */
export const NAV_ITEMS: { label: string; href: string; permission?: Permission }[] = [
  { label: "Dashboard", href: "/" },
  { label: "Vehicles", href: "/vehicles", permission: "VEHICLES_READ" },
  { label: "Bookings", href: "/bookings", permission: "BOOKINGS_READ" },
  { label: "Categories", href: "/categories", permission: "CATEGORIES_READ" },
  { label: "Items", href: "/items", permission: "ITEMS_READ" },
  { label: "Staff", href: "/staff", permission: "STAFF_READ" },
  { label: "Audit log", href: "/audit", permission: "AUDIT_READ" },
];
