"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { hasPermission, type Role } from "@/lib/permissions";
import { NAV_ITEMS } from "./nav-items";

export function SidebarNav({ roles }: { roles: Role[] }) {
  const pathname = usePathname();

  const visible = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(roles, item.permission),
  );

  return (
    <nav className="flex flex-col gap-0.5">
      {visible.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary"
              />
            ) : null}
            <Icon className="size-[1.125rem] shrink-0 stroke-[1.75]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
