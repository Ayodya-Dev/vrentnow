import Link from "next/link";
import Image from "next/image";
import { formatPricePerDay, vehicleCoverUrl, type Vehicle } from "@/lib/api/vehicles";

/** Compact card for the dark “Similar Vehicles” strip (Visily detail). */
export function SimilarVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const cover = vehicleCoverUrl(vehicle);

  return (
    <article className="flex flex-col overflow-hidden bg-white">
      <div className="relative aspect-[16/10] bg-[#EAECEE]">
        {cover ? (
          <Image
            src={cover}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-sm text-[#6B7280]">
            {vehicle.brand} {vehicle.model}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base leading-snug font-bold text-[#1D1F23]">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="shrink-0 text-sm font-bold whitespace-nowrap text-[#E8A317]">
            {formatPricePerDay(vehicle.pricePerDay)}{" "}
            <span className="font-normal text-[#6B7280]">/ day</span>
          </p>
        </div>
        <Link
          href={`/vehicles/${vehicle.slug}`}
          className="mt-auto block bg-[#1D1F23] py-2.5 text-center text-xs font-bold tracking-wide text-white uppercase transition-colors hover:bg-black"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
