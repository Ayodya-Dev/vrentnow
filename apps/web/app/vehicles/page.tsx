import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import {
  VehiclesFilters,
  VehiclesToolbar,
} from "@/components/vehicles/vehicles-filters";
import { listCategories } from "@/lib/api/categories";
import { listVehicles } from "@/lib/api/vehicles";

export const metadata: Metadata = { title: "All Vehicles" };

const CATEGORY_ORDER = ["van", "car", "bike", "bus"];

function sortCategories<T extends { name: string; slug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug.toLowerCase());
    const bi = CATEGORY_ORDER.indexOf(b.slug.toLowerCase());
    const aRank = ai === -1 ? 99 : ai;
    const bRank = bi === -1 ? 99 : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);
  const q = first(sp.q);
  const categoryId = first(sp.categoryId);
  const categoryIds = first(sp.categoryIds);
  const fuel = first(sp.fuel);
  const transmission = first(sp.transmission);
  const seats = first(sp.seats) ? Number(first(sp.seats)) : undefined;
  const seatsMin = first(sp.seatsMin) ? Number(first(sp.seatsMin)) : undefined;
  const minPrice = first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined;
  const maxPrice = first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined;
  const sortBy = first(sp.sortBy);
  const order = (first(sp.order) as "asc" | "desc" | undefined) ?? undefined;
  const from = first(sp.from);
  const to = first(sp.to);

  const [{ items, meta }, categoriesPage] = await Promise.all([
    listVehicles({
      page,
      limit: 12,
      q,
      categoryId,
      categoryIds,
      fuel,
      transmission,
      seats: Number.isFinite(seats) ? seats : undefined,
      seatsMin: Number.isFinite(seatsMin) ? seatsMin : undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      from,
      to,
      sortBy,
      order,
    }),
    listCategories(),
  ]);
  const categories = sortCategories(categoriesPage.items);

  const queryForPage = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    if (categoryIds) params.set("categoryIds", categoryIds);
    if (fuel) params.set("fuel", fuel);
    if (transmission) params.set("transmission", transmission);
    if (seats != null && Number.isFinite(seats)) params.set("seats", String(seats));
    if (seatsMin != null && Number.isFinite(seatsMin)) {
      params.set("seatsMin", String(seatsMin));
    }
    if (minPrice != null && Number.isFinite(minPrice)) {
      params.set("minPrice", String(minPrice));
    }
    if (maxPrice != null && Number.isFinite(maxPrice)) {
      params.set("maxPrice", String(maxPrice));
    }
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (sortBy) params.set("sortBy", sortBy);
    if (order) params.set("order", order);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/vehicles?${qs}` : "/vehicles";
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 lg:px-24 xl:px-40">
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/vehicles/IMG_2.svg" alt="" className="size-4" />
          <span className="font-mono text-[12px] tracking-[4px] text-[#E8A317] uppercase">
            Catalog Experience
          </span>
        </div>
        <h1 className="mb-4 font-heading text-4xl font-semibold">
          Available Vehicles
        </h1>
        <p className="mb-8 max-w-2xl text-[#6B7280]">
          Browse our fleet and reserve online. Cars added in the admin panel appear
          here automatically when they are available.
        </p>

        <Suspense fallback={<div className="h-14 border border-[#DFE1E4] bg-white" />}>
          <VehiclesToolbar />
        </Suspense>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense
          fallback={
            <aside className="h-96 w-full shrink-0 border border-[#DFE1E4] bg-white lg:w-80" />
          }
        >
          <VehiclesFilters categories={categories} />
        </Suspense>

        <div className="flex-1">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-[#DFE1E4]/60 pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{meta.total}</span>
              <span className="text-[#6B7280]">
                {meta.total === 1 ? "vehicle matches" : "vehicles match"} your
                criteria
              </span>
            </div>
            {(q ||
              categoryId ||
              categoryIds ||
              fuel ||
              transmission ||
              seats ||
              seatsMin ||
              maxPrice ||
              from ||
              to) && (
              <Link
                href="/vehicles"
                className="text-sm font-bold text-[#6B7280] hover:text-[#1D1F23]"
              >
                Reset filters
              </Link>
            )}
          </div>

          {items.length === 0 ? (
            <div className="border border-[#DFE1E4] bg-white px-8 py-16 text-center">
              <p className="mb-2 text-lg font-semibold text-[#1D1F23]">
                No vehicles found
              </p>
              <p className="mb-6 text-[#6B7280]">
                Try clearing filters, or check back after new cars are added in
                admin.
              </p>
              <Link
                href="/vehicles"
                className="inline-flex bg-[#E8A317] px-6 py-3 text-sm font-bold text-white"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  from={from}
                  to={to}
                />
              ))}
            </div>
          )}

          {meta.totalPages > 1 ? (
            <div className="mt-12 flex flex-col items-center gap-8">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (meta.totalPages <= 7) return true;
                    return (
                      p === 1 ||
                      p === meta.totalPages ||
                      Math.abs(p - meta.page) <= 1
                    );
                  })
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0) {
                      const prev = arr[idx - 1]!;
                      if (p - prev > 1) acc.push("…");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span key={`e${idx}`} className="px-2 text-[#6B7280]">
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={queryForPage(p)}
                        className={`flex size-12 items-center justify-center font-bold transition-colors ${
                          p === meta.page
                            ? "bg-[#E8A317] text-white"
                            : "text-[#6B7280] hover:bg-white"
                        }`}
                      >
                        {p}
                      </Link>
                    ),
                  )}
              </div>
              {meta.page < meta.totalPages ? (
                <Link
                  href={queryForPage(meta.page + 1)}
                  className="flex h-14 w-full max-w-sm items-center justify-center gap-4 border border-[#E8A317] font-bold text-[#E8A317] transition-colors hover:bg-[#E8A317]/5"
                >
                  LOAD MORE VEHICLES
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/vehicles/IMG_19.svg" alt="" className="size-5" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <section className="relative mt-32 overflow-hidden bg-[#171717] p-8 text-center lg:p-16">
        <div className="pointer-events-none absolute top-0 right-0 size-80 opacity-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/vehicles/IMG_2.svg" alt="" className="size-full" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-8 inline-block rounded-full border border-[#E8A317]/50 px-4 py-1">
            <span className="text-[12px] font-semibold tracking-wider text-[#E8A317] uppercase">
              Featured Experience
            </span>
          </div>
          <h2 className="mb-6 font-heading text-3xl font-semibold text-white lg:text-4xl">
            Can&apos;t find the perfect ride?
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-[#B2B6BC]">
            Our team can help source the right vehicle for your trip. Contact us for a
            custom rental plan.
          </p>
          <Link
            href="/contact"
            className="mx-auto inline-flex items-center gap-4 bg-[#E8A317] px-10 py-4 font-bold text-white transition-colors hover:bg-[#d19215]"
          >
            GET IN TOUCH
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vehicles/IMG_20.svg" alt="" className="size-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
