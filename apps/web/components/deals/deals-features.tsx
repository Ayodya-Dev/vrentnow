"use client";

import { IconPercentage, IconClock, IconShieldCheck } from "@tabler/icons-react";
import { Container } from "@/components/layout/container";

const FEATURES = [
  {
    icon: IconPercentage,
    title: "Best Price Guarantee",
    description:
      "Find a lower price elsewhere? We'll match it and give you an extra 5% off your rental.",
  },
  {
    icon: IconClock,
    title: "Early Bird Savings",
    description:
      "Book 30 days in advance and unlock special tier-1 discounts across our entire fleet.",
  },
  {
    icon: IconShieldCheck,
    title: "Premium Protection",
    description:
      "Most deals include our comprehensive damage waiver and roadside assistance at no extra cost.",
  },
];

export function DealsFeatures() {
  return (
    <section className="bg-[#F6F7F9] py-10 border-b border-[#E5E7EB]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100/80 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FFF8EC] text-[#E8A317]">
                  <Icon className="size-6 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#1D1F23]">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
