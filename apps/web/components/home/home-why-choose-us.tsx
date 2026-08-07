"use client";

import Image from "next/image";
import { motion } from "motion/react";

const TOP = [
  "Easier Rent on Your Budget",
  "The Best Extended Auto Warranties",
  "Most Flexible Payment Plans",
] as const;

const BOTTOM = [
  "Competitive Pricing",
  "Roadside Assistance 24/7",
  "Your Choice of Vehicles",
] as const;

function Marker() {
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-[#BDC0C6] bg-white">
      <span className="size-1.5 rounded-full bg-[#1D1F23]" />
    </span>
  );
}

function Callout({
  label,
  align = "center",
}: {
  label: string;
  align?: "left" | "center" | "right";
}) {
  const alignClass =
    align === "left"
      ? "items-start text-left"
      : align === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <motion.div
      className={`flex flex-col gap-2 ${alignClass}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
    >
      <p className="max-w-[180px] text-sm font-semibold leading-snug text-[#1D1F23]">
        {label}
      </p>
      <Marker />
    </motion.div>
  );
}

export function HomeWhyChooseUs() {
  return (
    <section id="why-choose-us" className="overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-14 text-center">
          <h2 className="mb-4 font-heading text-4xl font-bold text-[#1D1F23] md:text-5xl">
            Why Choose Us
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#DFE1E4]" />
            <p className="text-sm text-[#9DA1A7]">
              We provide you the best rental experience
            </p>
          </div>
        </div>

        <div className="hidden lg:block mx-auto max-w-5xl">
          {/* Top Callouts */}
          <div className="grid grid-cols-3 gap-6 px-4">
            <Callout label={TOP[0]} align="right" />
            <Callout label={TOP[1]} align="center" />
            <Callout label={TOP[2]} align="left" />
          </div>

          {/* Centered Large Car Image */}
          <motion.div
            className="relative mx-auto my-2 w-full flex items-center justify-center py-2"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/images/home/g-wagon-v2.png"
              alt="Mercedes G-Wagon SUV rental vehicle"
              width={952}
              height={579}
              className="mx-auto h-auto max-h-[480px] w-full max-w-4xl object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>

          {/* Bottom Callouts */}
          <div className="grid grid-cols-3 gap-6 px-4">
            {BOTTOM.map((label, i) => (
              <motion.div
                key={label}
                className={`flex flex-col gap-2 ${
                  i === 0
                    ? "items-end text-right"
                    : i === 2
                      ? "items-start text-left"
                      : "items-center text-center"
                }`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Marker />
                <p className="max-w-[180px] text-sm font-semibold leading-snug text-[#1D1F23]">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <Image
              src="/images/home/g-wagon-v2.png"
              alt="Mercedes G-Wagon SUV rental vehicle"
              width={952}
              height={579}
              className="mx-auto mb-8 h-auto max-h-[320px] w-full max-w-md object-contain drop-shadow-xl"
            />
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            {[...TOP, ...BOTTOM].map((label, i) => (
              <motion.div
                key={label}
                className="flex items-start gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Marker />
                <p className="text-sm font-semibold text-[#1D1F23]">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
