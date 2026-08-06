"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Category } from "@/lib/api/categories";

const TRANSMISSIONS = [
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "MANUAL", label: "Manual" },
] as const;

const CAPACITY = [
  { key: "2", seats: 2, seatsMin: null as number | null },
  { key: "4", seats: 4, seatsMin: null },
  { key: "5", seats: 5, seatsMin: null },
  { key: "7+", seats: null, seatsMin: 7 },
] as const;

const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const PRICE_STEP = 500;

type Draft = {
  from: string;
  to: string;
  categoryIds: string[];
  maxPrice: number;
  capacityKey: string;
  transmission: string;
};

function emptyDraft(): Draft {
  return {
    from: "",
    to: "",
    categoryIds: [],
    maxPrice: PRICE_MAX,
    capacityKey: "",
    transmission: "",
  };
}

function draftFromParams(sp: URLSearchParams): Draft {
  const categoryIds = (sp.get("categoryIds") ?? sp.get("categoryId") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const seats = sp.get("seats");
  const seatsMin = sp.get("seatsMin");
  let capacityKey = "";
  if (seatsMin === "7") capacityKey = "7+";
  else if (seats === "2" || seats === "4" || seats === "5") capacityKey = seats;

  const maxPriceRaw = sp.get("maxPrice");
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : PRICE_MAX;

  return {
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    categoryIds,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : PRICE_MAX,
    capacityKey,
    transmission: sp.get("transmission") ?? "",
  };
}

function formatLkr(n: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function VehiclesFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft>(() => draftFromParams(searchParams));

  useEffect(() => {
    setDraft(draftFromParams(searchParams));
  }, [searchParams]);

  function toggleCategory(id: string) {
    setDraft((d) => ({
      ...d,
      categoryIds: d.categoryIds.includes(id)
        ? d.categoryIds.filter((x) => x !== id)
        : [...d.categoryIds, id],
    }));
  }

  function apply() {
    const next = new URLSearchParams(searchParams.toString());
    // keep search/sort from toolbar
    const keep = ["q", "sortBy", "order"];
    for (const key of [...next.keys()]) {
      if (!keep.includes(key)) next.delete(key);
    }

    if (draft.from) next.set("from", draft.from);
    if (draft.to) next.set("to", draft.to);

    if (draft.categoryIds.length === 1) {
      next.set("categoryId", draft.categoryIds[0]!);
    } else if (draft.categoryIds.length > 1) {
      next.set("categoryIds", draft.categoryIds.join(","));
    }

    if (draft.maxPrice < PRICE_MAX) {
      next.set("maxPrice", String(draft.maxPrice));
    }

    const cap = CAPACITY.find((c) => c.key === draft.capacityKey);
    if (cap?.seats != null) next.set("seats", String(cap.seats));
    if (cap?.seatsMin != null) next.set("seatsMin", String(cap.seatsMin));

    if (draft.transmission) next.set("transmission", draft.transmission);

    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function clear() {
    setDraft(emptyDraft());
    const next = new URLSearchParams();
    const q = searchParams.get("q");
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("order");
    if (q) next.set("q", q);
    if (sortBy) next.set("sortBy", sortBy);
    if (order) next.set("order", order);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  const dateLabel =
    draft.from && draft.to
      ? `${draft.from} → ${draft.to}`
      : draft.from
        ? `From ${draft.from}`
        : "Pick rental dates";

  return (
    <aside className={`w-full shrink-0 lg:w-80 ${pending ? "opacity-70" : ""}`}>
      <div className="sticky top-24 border border-[#DFE1E4] bg-white p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vehicles/IMG_7.svg" alt="" className="size-5" />
            <h2 className="text-xl font-bold">Filters</h2>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-bold text-[#E8A317]"
          >
            Reset all
          </button>
        </div>

        <div className="space-y-8">
          {/* Rental Date */}
          <div>
            <label className="mb-4 block text-[14px] font-bold tracking-wider uppercase">
              Rental Date
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 border border-[#DFE1E4] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/vehicles/IMG_8.svg"
                  alt=""
                  className="size-4 shrink-0 opacity-50"
                />
                <span className="truncate text-sm font-medium text-[#6B7280]">
                  {dateLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={draft.from}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, from: e.target.value }))
                  }
                  className="border border-[#DFE1E4] px-2 py-2 text-sm outline-none focus:border-[#E8A317]"
                  aria-label="From date"
                />
                <input
                  type="date"
                  value={draft.to}
                  min={draft.from || undefined}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, to: e.target.value }))
                  }
                  className="border border-[#DFE1E4] px-2 py-2 text-sm outline-none focus:border-[#E8A317]"
                  aria-label="To date"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Category — Van / Car / Bike / Bus from API */}
          <div className="border-t border-[#DFE1E4]/50 pt-4">
            <label className="mb-4 block text-[14px] font-bold tracking-wider uppercase">
              Vehicle Category
            </label>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm text-[#6B7280]">
                  No categories yet. Add Van, Car, Bike, Bus in admin.
                </p>
              ) : (
                categories.map((cat) => {
                  const active = draft.categoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="group flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-[#565d6d] accent-[#E8A317]"
                        checked={active}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <span className="text-sm font-medium text-[#6B7280] group-hover:text-[#1D1F23]">
                        {cat.name}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="border-t border-[#DFE1E4]/50 pt-4">
            <label className="mb-4 block text-[14px] font-bold tracking-wider uppercase">
              Price Range
            </label>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={draft.maxPrice}
              onChange={(e) =>
                setDraft((d) => ({ ...d, maxPrice: Number(e.target.value) }))
              }
              className="mb-4 w-full accent-[#E8A317]"
            />
            <div className="flex justify-between font-mono text-[12px] font-bold">
              <span>{formatLkr(PRICE_MIN)}</span>
              <span>
                {draft.maxPrice >= PRICE_MAX
                  ? `${formatLkr(PRICE_MAX)}+`
                  : `Up to ${formatLkr(draft.maxPrice)}`}
              </span>
            </div>
          </div>

          {/* Capacity */}
          <div className="border-t border-[#DFE1E4]/50 pt-4">
            <label className="mb-4 block text-[14px] font-bold tracking-wider uppercase">
              Capacity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CAPACITY.map((cap) => {
                const active = draft.capacityKey === cap.key;
                return (
                  <button
                    key={cap.key}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        capacityKey: active ? "" : cap.key,
                      }))
                    }
                    className={`h-11 border font-bold transition-colors ${
                      active
                        ? "border-[#E8A317] bg-[#E8A317]/10 text-[#E8A317]"
                        : "border-[#DFE1E4] hover:bg-[#F6F7F9]"
                    }`}
                  >
                    {cap.key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transmission */}
          <div className="border-t border-[#DFE1E4]/50 pt-4">
            <label className="mb-4 block text-[14px] font-bold tracking-wider uppercase">
              Transmission
            </label>
            <div className="space-y-3">
              {TRANSMISSIONS.map((t) => {
                const active = draft.transmission === t.value;
                return (
                  <label
                    key={t.value}
                    className="group flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-[#565d6d] accent-[#E8A317]"
                      checked={active}
                      onChange={() =>
                        setDraft((d) => ({
                          ...d,
                          transmission: active ? "" : t.value,
                        }))
                      }
                    />
                    <span className="text-sm font-medium text-[#6B7280] group-hover:text-[#1D1F23]">
                      {t.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-[#DFE1E4]/50 pt-4">
            <button
              type="button"
              onClick={apply}
              className="w-full bg-[#E8A317] py-3 font-bold text-white shadow-lg transition-colors hover:bg-[#d19215]"
            >
              APPLY FILTERS
            </button>
            <button
              type="button"
              onClick={clear}
              className="w-full border border-[#DFE1E4] py-3 font-bold"
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | null,
) {
  if (!value) params.delete(key);
  else params.set(key, value);
  params.delete("page");
}

export function VehiclesToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function applySearch(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    setParam(next, "q", value.trim() || null);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function applySort(sortBy: string, order: "asc" | "desc") {
    const next = new URLSearchParams(searchParams.toString());
    next.set("sortBy", sortBy);
    next.set("order", order);
    next.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";
  const sortKey = `${sortBy}:${order}`;

  return (
    <div className="flex flex-col items-center gap-4 border border-[#DFE1E4] bg-white p-2 md:flex-row">
      <div className="flex w-full flex-1 items-center gap-3 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/vehicles/IMG_3.svg" alt="" className="size-4 opacity-50" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applySearch(q);
          }}
          placeholder="Search by model, brand, or keyword..."
          className="w-full py-2 text-sm outline-none placeholder:text-[#6B7280]"
        />
        <button
          type="button"
          onClick={() => applySearch(q)}
          className="shrink-0 text-xs font-bold tracking-wide text-[#E8A317] uppercase"
        >
          Search
        </button>
      </div>
      <div className="hidden h-8 w-px bg-[#DFE1E4] md:block" />
      <div className="flex w-full items-center gap-4 px-4 md:w-auto">
        <label className="flex items-center gap-2 text-sm font-bold whitespace-nowrap">
          SORT:
          <select
            value={sortKey}
            onChange={(e) => {
              const [by, ord] = e.target.value.split(":") as [
                string,
                "asc" | "desc",
              ];
              applySort(by, ord);
            }}
            className="bg-transparent outline-none"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="pricePerDay:asc">Price ↑</option>
            <option value="pricePerDay:desc">Price ↓</option>
            <option value="name:asc">Name A–Z</option>
          </select>
        </label>
      </div>
    </div>
  );
}
