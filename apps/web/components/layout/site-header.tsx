import Link from "next/link";
import { Container } from "./container";
import { NAV_ITEMS } from "./nav-items";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { AccountMenu } from "@/components/auth/account-menu";
import { auth } from "@/lib/auth";
import { site } from "@/lib/site";

export async function SiteHeader() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 border-b border-[#DFE1E4] bg-[#F6F7F9]/90 backdrop-blur-md">
      <Container className="relative flex h-16 max-w-7xl items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#E8A317]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/home/IMG_1.svg" alt="" className="size-6" />
            </span>
            <span className="font-heading text-xl font-bold tracking-tight text-[#1D1F23]">
              {site.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-4 lg:flex xl:gap-5">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!signedIn ? (
            <>
              <Link
                href="/register"
                className="hidden rounded px-4 py-2 text-sm font-medium text-[#1D1F23] transition-colors hover:bg-black/5 sm:inline-flex"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="hidden rounded bg-[#E8A317] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#C4890F] sm:inline-flex"
              >
                Login
              </Link>
            </>
          ) : (
            <AccountMenu user={session!.user} />
          )}
          <MobileNav showAuthLinks={!signedIn} />
        </div>
      </Container>
    </header>
  );
}
