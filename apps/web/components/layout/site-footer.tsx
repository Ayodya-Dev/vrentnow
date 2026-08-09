import Link from "next/link";
import { Container } from "./container";
import { site } from "@/lib/site";

const FOOTER_COLS = [
  {
    title: "Platform",
    links: [
      { label: "How it Works", href: "/#how-it-works" },
      { label: "Vehicles", href: "/vehicles" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Help", href: "/vehicles" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-0 border-t border-[#DFE1E4] bg-white pt-16 pb-8">
      <Container className="max-w-7xl">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt={site.name}
                className="h-14 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[#6B7280]">
              Rent the right vehicle online — browse available cars and book in minutes.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h5 className="mb-6 text-sm font-semibold tracking-wider text-[#1D1F23] uppercase">
                {col.title}
              </h5>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B7280] transition-colors hover:text-[#1D1F23]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h5 className="mb-6 text-sm font-semibold tracking-wider text-[#1D1F23] uppercase">
              Connect
            </h5>
            <div className="flex gap-3">
              {["IMG_14.svg", "IMG_15.svg", "IMG_16.svg", "IMG_17.svg"].map((file) => (
                <span
                  key={file}
                  className="flex size-9 items-center justify-center rounded-full bg-[#DFE1E4]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/home/${file}`} alt="" className="size-5 opacity-60" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#DFE1E4] pt-8 md:flex-row">
          <p className="text-xs text-[#6B7280]">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-[#6B7280]">Cookie Policy</span>
            <span className="text-xs text-[#6B7280]">Accessibility</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
