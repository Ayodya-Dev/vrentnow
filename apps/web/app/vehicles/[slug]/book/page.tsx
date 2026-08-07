import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/bookings/booking-form";
import { SimilarVehicleCard } from "@/components/vehicles/similar-vehicle-card";
import { VehicleRentalSteps } from "@/components/vehicles/vehicle-rental-steps";
import { ApiError } from "@/lib/api/public";
import { getVehicle, listVehicles } from "@/lib/api/vehicles";

export const metadata: Metadata = { title: "Reserve & pay" };

function splitName(full?: string | null): { first: string; last: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0]!, last: "" };
  return { first: parts[0]!, last: parts.slice(1).join(" ") };
}

export default async function BookVehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/vehicles/${slug}/book`)}`);
  }

  let vehicle;
  try {
    vehicle = await getVehicle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const { first, last } = splitName(session.user.name);

  const similarPage = await listVehicles({
    categoryId: vehicle.categoryId,
    limit: 6,
  });
  const similar = similarPage.items
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  return (
    <>
      <section className="bg-[#F6F7F9] py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <span className="mb-3 inline-flex rounded-md bg-[#E8A317]/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-[#E8A317] uppercase">
            New booking
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#1D1F23] md:text-4xl">
            Reserve & pay
          </h1>
          <p className="mt-3 mb-10 max-w-2xl text-sm leading-relaxed text-[#6B7280]">
            Enter your details, pick dates on the calendar, choose how you want to pay,
            then confirm. Total updates as you select the rental period.
          </p>

          <BookingForm
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.brand} ${vehicle.model}${
              vehicle.year ? ` ${vehicle.year}` : ""
            }`}
            vehicleSlug={vehicle.slug}
            pricePerDay={vehicle.pricePerDay}
            defaultFirstName={first}
            defaultLastName={last}
            defaultEmail={session.user.email ?? ""}
          />
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
                  Explore other high-performance options in the{" "}
                  {vehicle.category.name} collection.
                </p>
              </div>
              <Link
                href="/vehicles"
                className="inline-flex items-center justify-center border border-white/30 px-5 py-2.5 text-xs font-bold tracking-[0.14em] text-white uppercase transition-colors hover:border-white hover:bg-white/5"
              >
                View all vehicles
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((v) => (
                <SimilarVehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <VehicleRentalSteps />
    </>
  );
}
