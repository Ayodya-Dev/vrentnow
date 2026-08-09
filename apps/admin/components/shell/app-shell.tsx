import Link from "next/link";
import type { Role } from "@/lib/permissions";
import { SidebarNav } from "./sidebar-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AppShell({
  roles,
  email,
  children,
}: {
  roles: Role[];
  email?: string | null;
  children: React.ReactNode;
}) {
  const roleLabel = roles[0]?.replaceAll("_", " ") ?? "STAFF";

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <Link href="/" className="flex items-center px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="VRentNow"
            className="h-12 w-auto"
          />
        </Link>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SidebarNav roles={roles} />
        </div>

        <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
          {email ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{email}</p>
              <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                {roleLabel}
              </p>
            </div>
          ) : null}
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
