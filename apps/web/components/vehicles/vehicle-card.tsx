import Link from "next/link";
import Image from "next/image";
import {
  formatFuel,
  formatPricePerDay,
  formatStatus,
  formatTransmission,
  rentalDatesSearch,
  vehicleCoverUrl,
  type Vehicle,
} from "@/lib/api/vehicles";

export function VehicleCard({
  vehicle,
  from,
  to,
}: {
  vehicle: Vehicle;
  from?: string;
  to?: string;
}) {
  const cover = vehicleCoverUrl(vehicle);
  const status = formatStatus(vehicle.status);
  const datesQs = rentalDatesSearch(from, to);

  return (
    <article className="group flex flex-col overflow-hidden bg-white shadow-md">
      <Link
        href={`/vehicles/${vehicle.slug}${datesQs}`}
        className="relative aspect-[3/2] overflow-hidden bg-[#EAECEE]/50"
      >
        {cover ? (
          <Image
            src={cover}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAECEE] to-[#DFE1E4] px-4">
            <span className="text-center text-sm font-medium text-[#6B7280]">
              {vehicle.brand} {vehicle.model}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="rounded-full border border-[#DFE1E4] bg-white/80 px-2 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
            {vehicle.category.name}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-xl leading-tight font-bold">
            {vehicle.brand}{" "}
            <span className="text-[#E8A317]">{vehicle.model}</span>
          </h3>
          <div className="shrink-0 text-right">
            <div className="text-xl font-bold text-[#E8A317]">
              {formatPricePerDay(vehicle.pricePerDay)}
            </div>
            <div className="text-[12px] text-[#6B7280]">/day</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#DFE1E4]/40 pt-4">
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/vehicles/IMG_13.svg"
              alt=""
              className="size-3.5"
            />
            <span className="font-mono text-[10px] text-[#6B7280] uppercase">
              {vehicle.seats} Seats
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vehicles/IMG_11.svg" alt="" className="size-4" />
            <span className="font-mono text-[10px] text-[#6B7280] uppercase">
              {formatTransmission(vehicle.transmission)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vehicles/IMG_12.svg" alt="" className="size-4" />
            <span className="truncate font-mono text-[10px] text-[#6B7280] uppercase">
              {formatFuel(vehicle.fuel)}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-6">
          <Link
            href={`/vehicles/${vehicle.slug}/book${datesQs}`}
            className="block w-full bg-[#E8A317] py-2 text-center text-sm font-bold text-white transition-colors hover:bg-[#d19215]"
          >
            RENT NOW
          </Link>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full shadow-[0_0_8px] ${status.dot} ${status.glow}`}
              />
              <span className="font-mono text-[12px] tracking-tighter text-[#6B7280] uppercase">
                {status.label}
              </span>
            </div>
            <Link
              href={`/vehicles/${vehicle.slug}${datesQs}`}
              className="text-sm font-bold transition-colors hover:text-[#E8A317]"
            >
              DETAILS
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
