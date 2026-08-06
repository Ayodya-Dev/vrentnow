"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "./nav-items";

export function MobileNav({
  showAuthLinks,
}: {
  showAuthLinks: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded text-[#1D1F23] hover:bg-black/5"
      >
        <span className="sr-only">Menu</span>
        <span className="flex flex-col gap-1.5">
          <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </span>
      </button>

      {open ? (
        <div className="absolute top-16 right-0 left-0 border-b border-[#DFE1E4] bg-[#F6F7F9] px-5 py-4 shadow-sm">
          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[#1D1F23]"
              >
                {item.label}
              </Link>
            ))}
            {showAuthLinks ? (
              <>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="pt-2 text-sm font-medium text-[#1D1F23]"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-fit rounded bg-[#E8A317] px-6 py-2 text-sm font-medium text-white"
                >
                  Login
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
