import type { ComponentType } from "react";
import {
  IconLayoutDashboard,
  IconCar,
  IconCalendarEvent,
  IconUsers,
  IconTag,
  IconCategory,
  IconBox,
  IconUserShield,
  IconClipboardList,
  IconMailbox,
  IconAlertTriangle,
  IconStar,
} from "@tabler/icons-react";
import type { Permission } from "@/lib/permissions";

export const NAV_ITEMS: {
  label: string;
  href: string;
  permission?: Permission;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { label: "Dashboard", href: "/", icon: IconLayoutDashboard },
  { label: "Vehicles", href: "/vehicles", permission: "VEHICLES_READ", icon: IconCar },
  {
    label: "Bookings",
    href: "/bookings",
    permission: "BOOKINGS_READ",
    icon: IconCalendarEvent,
  },
  { label: "Customers", href: "/customers", permission: "USERS_READ", icon: IconUsers },
  { label: "Offers", href: "/deals", permission: "DEALS_READ", icon: IconTag },
  {
    label: "Inquiries",
    href: "/inquiries",
    permission: "INQUIRIES_READ",
    icon: IconMailbox,
  },
  {
    label: "Damage reports",
    href: "/damage-reports",
    permission: "BOOKINGS_READ",
    icon: IconAlertTriangle,
  },
  {
    label: "Reviews",
    href: "/reviews",
    permission: "BOOKINGS_READ",
    icon: IconStar,
  },
  {
    label: "Categories",
    href: "/categories",
    permission: "CATEGORIES_READ",
    icon: IconCategory,
  },
  { label: "Items", href: "/items", permission: "ITEMS_READ", icon: IconBox },
  { label: "Staff", href: "/staff", permission: "STAFF_READ", icon: IconUserShield },
  {
    label: "Audit log",
    href: "/audit",
    permission: "AUDIT_READ",
    icon: IconClipboardList,
  },
];
