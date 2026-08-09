"use client";

import Image from "next/image";
import {
  IconCalendar,
  IconTag,
  IconChevronRight,
  IconArrowRight,
} from "@tabler/icons-react";
import { Container } from "@/components/layout/container";
import type { DealPromotion } from "@/lib/api/deals";

export type Promotion = DealPromotion;

interface DealsPromotionsProps {
  promotions: Promotion[];
  onClaimOffer: (promotion: Promotion) => void;
}

export function DealsPromotions({
  promotions,
  onClaimOffer,
}: DealsPromotionsProps) {
  return (
    <section id="featured-promotions" className="bg-[#F6F7F9] py-16 sm:py-20">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1D1F23]">
              Featured Promotions
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Choose from our carefully curated selection of seasonal deals and
              strategic rental packages.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById("featured-promotions");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#1D1F23] transition-colors cursor-pointer"
          >
            <span>View All Active Deals</span>
            <IconArrowRight className="size-4" />
          </button>
        </div>

        {promotions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-[#6B7280]">
            No active deals right now. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    unoptimized={promo.image.startsWith("http")}
                  />

                  <div className="absolute top-4 left-4 z-10">
                    <span className="rounded-md bg-[#E8A317] px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider shadow-md">
                      {promo.badge}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-heading text-xl font-bold text-[#1D1F23]">
                      {promo.title}
                    </h3>
                    <span className="font-heading text-lg font-bold text-[#E8A317] shrink-0">
                      {promo.discount}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-[#6B7280] mb-6 flex-1">
                    {promo.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#6B7280] border-t border-gray-100 pt-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <IconCalendar className="size-3.5 text-gray-400" />
                      <span>{promo.validUntil}</span>
                    </div>
                    {promo.code ? (
                      <div className="flex items-center gap-1.5">
                        <IconTag className="size-3.5 text-gray-400" />
                        <span>{promo.code}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onClaimOffer(promo)}
                      className="flex-1 rounded-lg bg-[#E8A317] py-2.5 px-4 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#D49213] active:scale-[0.99] cursor-pointer text-center shadow-sm"
                    >
                      {promo.code ? "Claim Offer" : "View Offer"}
                    </button>
                    <button
                      onClick={() => onClaimOffer(promo)}
                      className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-black cursor-pointer shrink-0"
                      aria-label={`Open ${promo.title}`}
                    >
                      <IconChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
