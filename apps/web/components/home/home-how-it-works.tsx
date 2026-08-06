"use client";

import { motion } from "motion/react";

const STEPS = [
  {
    title: "Choose Your Location",
    body: "Select your preferred pickup location with VRentNow’s simple interface for a seamless rental experience.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
        <path
          d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Pick-Up Date",
    body: "Choose your preferred pick-up date and plan your trip — start your journey on time with VRentNow.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Book Your Car",
    body: "Securely reserve your vehicle online with VRentNow’s hassle-free booking. Start your journey now.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
        <path
          d="M4 14h16l-1.5-5.5A2 2 0 0 0 16.6 7H7.4a2 2 0 0 0-1.9 1.5L4 14Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 14v3h2.5M20 14v3h-2.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor" />
        <circle cx="16.5" cy="17.5" r="1.5" fill="currentColor" />
        <path d="M9 10h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <h2 className="mb-3 font-heading text-4xl font-bold text-[#1D1F23] md:text-5xl">
          How It Works
        </h2>
        <p className="mb-16 text-[#9DA1A7] md:mb-20">
          Effortlessly rent your dream car with VRentNow
        </p>

        <div className="relative">
          <svg
            className="pointer-events-none absolute top-10 left-0 hidden h-40 w-full md:block"
            viewBox="0 0 1000 160"
            fill="none"
            aria-hidden
          >
            <path
              d="M120 40 C 280 40, 320 130, 500 130 C 680 130, 720 40, 880 40"
              stroke="#D1D5DB"
              strokeWidth="2"
              strokeDasharray="6 8"
              fill="none"
            />
            <path d="M330 95 L345 110 L355 88" stroke="#D1D5DB" strokeWidth="2" fill="none" />
            <path d="M645 95 L660 80 L670 102" stroke="#D1D5DB" strokeWidth="2" fill="none" />
          </svg>

          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 md:pt-2">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                className={`flex flex-col items-center ${
                  index === 1 ? "md:translate-y-10" : ""
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
              >
                <motion.div
                  className="z-10 mb-6 flex size-24 items-center justify-center rounded-2xl border border-[#EFEFEF] bg-white text-[#1D1F23] shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="mb-3 text-lg font-bold text-[#1D1F23]">{step.title}</h3>
                <p className="max-w-[260px] text-sm leading-relaxed text-[#9DA1A7]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
