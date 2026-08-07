"use client";

import Image from "next/image";
import { Container } from "@/components/layout/container";

interface DealsHeroProps {
  onBrowseOffers: () => void;
  onJoinLoyalty: () => void;
}

export function DealsHero({ onBrowseOffers, onJoinLoyalty }: DealsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#121316] text-white">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/deals/hero.png"
          alt="Luxury Genesis sedan"
          fill
          priority
          className="object-cover object-center brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121316]/95 via-[#121316]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent opacity-80" />
      </div>

      <Container className="relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-[#E8A317]/80 bg-[#E8A317]/15 px-4 py-1.5 backdrop-blur-md">
            <span className="text-[11px] font-bold tracking-wider text-[#E8A317] uppercase">
              EXCLUSIVE MEMBER BENEFITS
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Exclusive Deals & <br />
            Special Offers
          </h1>

          {/* Subtitle */}
          <p className="mt-3 font-serif italic text-2xl sm:text-3xl text-[#E8A317] font-normal">
            Drive Premium for Less.
          </p>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl">
            Unlock exceptional savings on luxury vehicles, long-term rentals, and
            special event packages. Elevate your journey with our exclusive
            limited-time promotions.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onBrowseOffers}
              className="rounded-md bg-[#E8A317] px-7 py-3.5 text-sm font-semibold text-[#1D1F23] shadow-lg transition-all hover:bg-[#D49213] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Browse Offers
            </button>
            <button
              onClick={onJoinLoyalty}
              className="rounded-md border border-white/40 bg-black/30 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Join Loyalty Program
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
