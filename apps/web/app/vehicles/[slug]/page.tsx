import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Button } from "@workspace/ui/components/button";
import { ApiError } from "@/lib/api/public";
import { formatPricePerDay, getVehicle, type Vehicle } from "@/lib/api/vehicles";

async function load(slug: string): Promise<Vehicle | null> {
  try {
    return await getVehicle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await load(slug);
  return { title: vehicle?.name ?? "Not found" };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await load(slug);
  if (!vehicle) notFound();

  return (
    <Container className="max-w-3xl py-16">
      <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {vehicle.category.name}
      </p>
      <h1 className="mb-4 font-heading text-4xl font-semibold tracking-tight text-balance">
        {vehicle.name}
      </h1>
      <p className="mb-8 text-2xl font-semibold">
        {formatPricePerDay(vehicle.pricePerDay)}
        <span className="text-base font-normal text-muted-foreground"> / day</span>
      </p>

      <dl className="mb-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Brand</dt>
          <dd className="font-medium">{vehicle.brand}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Model</dt>
          <dd className="font-medium">{vehicle.model}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Year</dt>
          <dd className="font-medium">{vehicle.year}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Seats</dt>
          <dd className="font-medium">{vehicle.seats}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Fuel</dt>
          <dd className="font-medium">{vehicle.fuel}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Transmission</dt>
          <dd className="font-medium">{vehicle.transmission}</dd>
        </div>
      </dl>

      {vehicle.description ? (
        <p className="mb-10 text-lg leading-relaxed text-pretty text-muted-foreground">
          {vehicle.description}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button render={<Link href="/vehicles" />} variant="outline">
          Back to vehicles
        </Button>
      </div>
    </Container>
  );
}
