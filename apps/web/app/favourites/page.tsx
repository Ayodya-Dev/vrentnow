import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { FavouritesList } from "@/components/favourites/favourites-list";

export const metadata: Metadata = { title: "My favourites" };

export default async function FavouritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/favourites");

  return (
    <Container className="max-w-6xl py-16">
      <h1 className="mb-2 font-heading text-3xl font-semibold tracking-tight">
        My favourites
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Vehicles you have saved for later.
      </p>
      <FavouritesList />
    </Container>
  );
}
