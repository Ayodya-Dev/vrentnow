"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

const STEPS = [
  { n: "01_BROWSE", t: "Top-Tier Fleet" },
  { n: "02_BOOK", t: "Secure Booking" },
  { n: "03_DRIVE", t: "Hit the Road" },
] as const;

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const carX = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const carY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const carRotate = useTransform(scrollYProgress, [0, 1], [0, -2]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[min(836px,92dvh)] w-full overflow-hidden bg-[#F6F7F9]"
    >
      {/* Car — previous size, bottom right */}
      <motion.div
        className="pointer-events-none absolute right-[-8%] bottom-[-6%] z-10 w-[min(92vw,720px)] sm:right-[-4%] sm:bottom-[-4%] sm:w-[min(70vw,780px)] lg:right-0 lg:bottom-[-2%] lg:w-[55%]"
        style={{ x: carX, y: carY, rotate: carRotate }}
        initial={{ opacity: 0, x: 160 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <Image
          src="/images/home/lambo.png"
          alt="Premium sports car"
          width={1400}
          height={800}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.22)]"
        />
      </motion.div>

      {/* Copy — aligned with header, not flush to edge */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8 lg:px-12">
        <motion.div
          className="max-w-md lg:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 inline-flex w-fit items-center gap-2.5 border border-[#E8A317]/35 bg-white/80 px-3.5 py-1.5">
            <span className="size-2 shrink-0 rounded-full bg-[#E8A317]" />
            <span className="font-mono text-[13px] font-medium tracking-[0.14em] text-[#121417] uppercase">
              VRentNow Premium
            </span>
          </div>

          <h1 className="mb-5 font-heading text-4xl leading-[1.1] font-bold tracking-tight text-[#121417] sm:text-5xl lg:text-[3.25rem]">
            Your ride, ready
            <br />
            <span className="text-[#E8A317]">when you are.</span>
          </h1>

          <p className="mb-8 max-w-md text-base leading-relaxed text-[#5C6169] sm:text-lg">
            Browse available cars and book online in minutes. Premium rentals without the
            hassle.
          </p>

          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/vehicles"
              className="inline-flex items-center justify-center gap-3 bg-[#E8A317] px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_8px_24px_rgba(232,163,23,0.35)] transition-colors hover:bg-[#C4890F]"
            >
              BROWSE VEHICLES
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/home/IMG_3.svg" alt="" className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border border-[#121417] px-8 py-3.5 text-sm font-semibold tracking-wide text-[#121417] transition-colors hover:bg-[#121417]/5"
            >
              SIGN IN
            </Link>
          </div>

          <div className="grid max-w-lg grid-cols-3 gap-4 border-t border-[#121417]/12 pt-7 sm:gap-6">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="mb-1 block font-mono text-[12px] font-medium tracking-wide text-[#E8A317] sm:text-sm">
                  {step.n}
                </span>
                <span className="block text-[10px] tracking-[0.12em] text-[#5C6169] uppercase sm:text-xs">
                  {step.t}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
