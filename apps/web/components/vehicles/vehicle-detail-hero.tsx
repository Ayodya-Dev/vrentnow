import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatFuel,
  formatPricePerDay,
  formatTransmission,
  rentalDatesSearch,
  type Vehicle,
} from "@/lib/api/vehicles";
import { VehicleGallery } from "./vehicle-gallery";

function SpecCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border border-[#DFE1E4] bg-[#F6F7F9]/80 px-3 py-3">
      <span className="mt-0.5 text-[#E8A317]" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-wider text-[#6B7280] uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-[#1D1F23]">{value}</p>
      </div>
    </div>
  );
}

const TRUST = [
  {
    label: "Verified hardware",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8 12.5 10.5 15 16 9.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Instant booking",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path
          d="M13 3 5 14h6l-1 7 9-12h-6l0-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "24/7 support",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

function brandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path d="M4 17h16M6 17l2-8h8l2 8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="17" r="1.5" fill="currentColor" />
      <circle cx="16" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function VehicleDetailHero({
  vehicle,
  from,
  to,
}: {
  vehicle: Vehicle;
  from?: string;
  to?: string;
}) {
  const images = vehicle.imageUrls?.filter(Boolean) ?? [];
  const description =
    vehicle.description?.trim() ||
    `Experience the ${vehicle.brand} ${vehicle.model} with VRentNow — a reliable ${formatFuel(vehicle.fuel).toLowerCase()} choice with ${formatTransmission(vehicle.transmission).toLowerCase()} transmission and seating for ${vehicle.seats}. Ideal for city trips and weekend getaways, maintained to our rental-ready standard.`;

  const available = vehicle.status === "AVAILABLE";
  const datesQs = rentalDatesSearch(from, to);
  const vehiclesBackHref = from && to ? `/vehicles${datesQs}` : "/vehicles";

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div>
        <VehicleGallery
          images={images}
          alt={`${vehicle.brand} ${vehicle.model}`}
          categoryLabel={vehicle.category.name}
        />
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {TRUST.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#1D1F23] uppercase"
            >
              <span className="text-[#E8A317]">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-[#E8A317] uppercase">
          {vehicle.brand} official
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-[#1D1F23] md:text-5xl">
          {vehicle.brand} {vehicle.model}
        </h1>
        <p className="mt-4 text-2xl font-bold text-[#E8A317]">
          {formatPricePerDay(vehicle.pricePerDay)}
          <span className="text-base font-medium text-[#6B7280]"> / day</span>
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <SpecCell label="Brand" value={vehicle.brand} icon={brandIcon()} />
          <SpecCell label="Model" value={vehicle.model} icon={brandIcon()} />
          <SpecCell
            label="Year"
            value={String(vehicle.year)}
            icon={
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                <rect x="4" y="5" width="16" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 10h16M9 3v3M15 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
          />
          <SpecCell
            label="Seats"
            value={String(vehicle.seats)}
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/vehicles/IMG_13.svg" alt="" className="size-4" />
            }
          />
          <SpecCell
            label="Fuel"
            value={vehicle.fuel}
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/vehicles/IMG_12.svg" alt="" className="size-4" />
            }
          />
          <SpecCell
            label="Transmission"
            value={vehicle.transmission}
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/vehicles/IMG_11.svg" alt="" className="size-4" />
            }
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xs font-bold tracking-[0.18em] text-[#1D1F23] uppercase">
            Vehicle description
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6B7280] text-pretty">
            {description}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/vehicles/${vehicle.slug}/book${datesQs}`}
            className="inline-flex flex-1 items-center justify-center bg-[#E8A317] px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#d19215]"
          >
            Rent now
          </Link>
          <Link
            href={vehiclesBackHref}
            className="inline-flex flex-1 items-center justify-center border border-[#1D1F23] bg-white px-6 py-3 text-sm font-bold tracking-wide text-[#1D1F23] uppercase transition-colors hover:bg-[#F6F7F9]"
          >
            Back to vehicles
          </Link>
        </div>

        <div className="mt-6 flex items-start gap-3 border border-[#DFE1E4] bg-[#F6F7F9] px-4 py-3">
          <span
            className={`mt-1.5 size-2 shrink-0 rounded-full ${
              available ? "bg-[#22C55E] shadow-[0_0_8px_#22C55E66]" : "bg-[#F59E0B]"
            }`}
          />
          <p className="text-sm leading-relaxed text-[#4B5563]">
            {available ? (
              <>
                Available for rental now.{" "}
                <span className="font-semibold text-[#1D1F23]">
                  Reserve your slot early
                </span>{" "}
                to guarantee delivery.
              </>
            ) : (
              <>
                This vehicle is currently{" "}
                <span className="font-semibold text-[#1D1F23]">
                  {vehicle.status.toLowerCase()}
                </span>
                . Check similar options below or try another date.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
