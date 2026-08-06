import Link from "next/link";
import { formatPricePerDay, type Vehicle } from "@/lib/api/vehicles";
import type { Category } from "@/lib/api/categories";

export function HomeCollection({
  vehicles,
  categories,
}: {
  vehicles: Vehicle[];
  categories: Category[];
}) {
  return (
    <section className="bg-[#121417] py-24 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-4xl font-bold md:text-5xl">New Collection</h2>
          <p className="mb-6 font-mono text-sm tracking-[3px] text-[#B2B6BC] uppercase">
            Looking to save more on your rental car?
          </p>
          <div className="mx-auto h-0.5 w-12 bg-[#E8A317]" />
        </div>

        <div className="mb-16 flex flex-wrap justify-center gap-4">
          <Link
            href="/vehicles"
            className="rounded-full bg-white px-8 py-2 text-sm font-medium text-black"
          >
            Show All
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/vehicles?categoryId=${cat.id}`}
              className="rounded-full border border-white px-8 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {vehicles.length === 0 ? (
          <p className="text-center text-[#B2B6BC]">No vehicles available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.slice(0, 8).map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.slug}`}
                className="flex flex-col rounded-[32px] bg-white p-6 text-black transition-transform hover:-translate-y-1"
              >
                <div className="mb-6 flex size-8 items-center justify-center rounded-full bg-black/5">
                  <span className="text-[10px] font-bold">V</span>
                </div>
                <h4 className="mb-6 line-clamp-2 h-10 text-[14px] font-bold uppercase">
                  {vehicle.name}
                </h4>
                <div className="mb-6 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-[#F6F7F9]">
                  <span className="px-4 text-center text-xs text-[#6B7280]">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
                <div className="mb-6 flex items-center justify-between border-y border-black/5 py-2">
                  {[`${vehicle.seats} seats`, vehicle.transmission, vehicle.fuel].map((spec) => (
                    <div key={spec} className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-black/20" />
                      <span className="text-[10px] text-black/60">{spec}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold">
                      {formatPricePerDay(vehicle.pricePerDay)}
                    </span>
                    <span className="block text-[10px] text-black/40">/day</span>
                  </div>
                  <span className="rounded-full bg-black px-4 py-2 text-[10px] font-bold text-white">
                    RENT NOW
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
