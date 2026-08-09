"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { IconCrown } from "@tabler/icons-react";

const STEPS = [
  { n: "01_BROWSE", t: "Top-Tier Fleet" },
  { n: "02_BOOK", t: "Secure Booking" },
  { n: "03_DRIVE", t: "Hit the Road" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/** Slide-up mask reveal for a single headline line. */
function RevealLine({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block ${className ?? ""}`}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const carX = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const carY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[min(836px,92dvh)] w-full overflow-hidden bg-[#F6F7F9]"
    >
      {/* Car — previous size, bottom right. Serve original PNG (no optimizer)
          so paint/glass textures stay sharp; CSS filter+transform can crush quality. */}
      <motion.div
        className="pointer-events-none absolute right-[-8%] bottom-[-6%] z-10 w-[min(92vw,720px)] sm:right-[-4%] sm:bottom-[-4%] sm:w-[min(70vw,780px)] lg:right-0 lg:bottom-[-2%] lg:w-[55%]"
        style={{ x: carX, y: carY }}
        initial={{ opacity: 0, x: 160 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/lambo.png"
          alt="Premium sports car"
          width={1400}
          height={800}
          className="h-auto w-full object-contain"
          decoding="async"
          fetchPriority="high"
        />
      </motion.div>

      {/* Copy — aligned with header */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8 lg:px-12">
        <div className="max-w-md lg:max-w-lg">
          {/* Eyebrow */}
          <motion.p
            className="mb-6 flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.18em] text-[#E8A317] uppercase"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          >
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
              className="inline-flex"
            >
              <IconCrown className="size-4 fill-[#E8A317]/20" stroke={1.75} />
            </motion.span>
            VRentNow Premium
          </motion.p>

          {/* Headline — each line slides up out of a mask */}
          <h1 className="mb-5 font-heading text-4xl leading-[1.1] font-bold tracking-tight text-[#121417] sm:text-5xl lg:text-[3.25rem]">
            <RevealLine delay={0.25}>Your ride, ready</RevealLine>
            <RevealLine delay={0.4} className="text-[#E8A317]">
              when you are.
            </RevealLine>
          </h1>

          <motion.p
            className="mb-8 max-w-sm text-base leading-relaxed text-[#5C6169] sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
          >
            Browse available cars and book online in minutes. Premium rentals without the
            hassle.
          </motion.p>

          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
          >
            <Link
              href="/vehicles"
              className="group inline-flex items-center justify-center gap-3 bg-[#E8A317] px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_8px_24px_rgba(232,163,23,0.35)] transition-all hover:bg-[#C4890F] hover:shadow-[0_10px_28px_rgba(232,163,23,0.45)]"
            >
              BROWSE VEHICLES
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/home/IMG_3.svg"
                alt=""
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          {/* Steps — cascade in one after another */}
          <motion.div
            className="flex w-fit items-start gap-8 border-t border-[#121417]/12 pt-7 sm:gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.9 + i * 0.12 }}
              >
                <span className="mb-1 block font-mono text-[12px] font-medium tracking-wide whitespace-nowrap text-[#E8A317] sm:text-sm">
                  {step.n}
                </span>
                <span className="block text-[10px] tracking-[0.12em] whitespace-nowrap text-[#5C6169] uppercase sm:text-xs">
                  {step.t}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
