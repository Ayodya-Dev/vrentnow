import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="VRentNow"
            className="mx-auto h-16 w-auto"
          />
          <div className="space-y-1 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Admin console
            </h1>
            <p className="text-sm text-muted-foreground">Sign in to continue.</p>
          </div>
        </div>
        <LoginForm callbackUrl={callbackUrl ?? "/"} />
      </div>
    </main>
  );
}
