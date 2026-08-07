"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@workspace/ui/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4 xl:gap-5">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-all",
              isActive
                ? "border border-[#E8A317] text-[#E8A317] rounded px-3 py-1 font-semibold"
                : "text-[#1D1F23]/70 hover:text-[#1D1F23] px-1 py-1"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
