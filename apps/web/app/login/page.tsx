import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return (
    <>
      <main>
        <Container className="flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="VRentNow"
              className="mx-auto mb-6 h-16 w-auto"
            />
            <h1 className="mb-6 text-center font-serif text-3xl font-semibold text-primary">
              Welcome back
            </h1>
            <LoginForm callbackUrl={callbackUrl || "/account"} />
          </div>
        </Container>
      </main>
    </>
  );
}
