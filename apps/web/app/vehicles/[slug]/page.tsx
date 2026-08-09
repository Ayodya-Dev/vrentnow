import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiError } from "@/lib/api/public";
import {
  getVehicle,
  listVehicles,
  rentalDatesSearch,
  type Vehicle,
} from "@/lib/api/vehicles";
import { VehicleDetailHero } from "@/components/vehicles/vehicle-detail-hero";
import { SimilarVehicleCard } from "@/components/vehicles/similar-vehicle-card";
import { VehicleRentalSteps } from "@/components/vehicles/vehicle-rental-steps";

async function load(slug: string): Promise<Vehicle | null> {
  try {
    return await getVehicle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await load(slug);
  if (!vehicle) return { title: "Not found" };
  return {
    title: `${vehicle.brand} ${vehicle.model}`,
    description:
      vehicle.description ??
      `Rent the ${vehicle.brand} ${vehicle.model} with VRentNow.`,
  };
}

export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const from = first(sp.from);
  const to = first(sp.to);
  const datesQs = rentalDatesSearch(from, to);
  const vehiclesHref = from && to ? `/vehicles${datesQs}` : "/vehicles";

  const vehicle = await load(slug);
  if (!vehicle) notFound();

  const similarPage = await listVehicles({
    categoryId: vehicle.categoryId,
    limit: 6,
    from,
    to,
  });
  const similar = similarPage.items
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  return (
    <>
      <div className="border-b border-[#DFE1E4] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href={vehiclesHref}
            className="text-xs font-bold tracking-[0.14em] text-[#1D1F23] uppercase transition-colors hover:text-[#E8A317]"
          >
            ← Back to vehicles
          </Link>
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-medium tracking-[0.12em] text-[#6B7280] uppercase"
          >
            <Link href={vehiclesHref} className="hover:text-[#1D1F23]">
              Catalog
            </Link>
            <span className="mx-2">/</span>
            <span className="font-bold text-[#1D1F23]">
              {vehicle.brand} {vehicle.model}
            </span>
          </nav>
        </div>
      </div>

      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <VehicleDetailHero vehicle={vehicle} from={from} to={to} />
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="bg-[#1D1F23] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
                  Similar Vehicles
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Explore other options in the {vehicle.category.name} collection.
                </p>
              </div>
              <Link
                href={vehiclesHref}
                className="text-xs font-bold tracking-[0.16em] text-[#E8A317] uppercase transition-colors hover:text-white"
              >
                View all vehicles →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((v) => (
                <SimilarVehicleCard
                  key={v.id}
                  vehicle={v}
                  from={from}
                  to={to}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <VehicleRentalSteps />
    </>
  );
}
