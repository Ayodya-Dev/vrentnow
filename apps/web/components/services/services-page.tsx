"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const SERVICES = [
  {
    id: "wedding",
    title: "Wedding Cars",
    icon: "/images/services/IMG_3.svg",
    image: "/images/services/wedding.jpg",
    imageAlt: "Wedding transport car",
    description:
      "Arrive in sophisticated style on your special day. Our premium fleet of decorated luxury vehicles ensures a memorable grand entrance.",
    bullets: [
      "Professional Chauffeur",
      "Silk Ribbon Decoration",
      "Champagne Service",
    ],
    cta: { label: "BOOK WEDDING PACKAGE", href: "/contact" },
    imageLeft: true,
  },
  {
    id: "self-drive",
    title: "Self Drive Rental",
    icon: "/images/services/IMG_5.svg",
    image: "/images/services/self-drive.jpeg",
    imageAlt: "Self-drive car rental",
    description:
      "Take full control of the open road with our elite performance vehicles. Experience pure driving pleasure without the hassle of ownership.",
    bullets: [
      "Unlimited Kilometers",
      "24/7 Roadside Support",
      "Flexible Pickup/Drop",
    ],
    cta: { label: "BROWSE FLEET", href: "/vehicles" },
    imageLeft: false,
  },
  {
    id: "airport",
    title: "Airport Transfer",
    icon: "/images/services/IMG_6.svg",
    image: "/images/services/airport.webp",
    imageAlt: "Airport taxi transfer",
    description:
      "Reliable, punctual, and comfortable transfers to and from all major terminals. We monitor your flight to ensure we are always there on time.",
    bullets: ["Meet & Greet Service", "Luggage Assistance", "Flight Tracking"],
    cta: { label: "RESERVE TRANSFER", href: "/contact" },
    imageLeft: true,
  },
  {
    id: "corporate",
    title: "Corporate Car Rental",
    icon: "/images/services/IMG_7.svg",
    image: "/images/services/corporate.jpg",
    imageAlt: "Corporate car rental",
    description:
      "Executive transport solutions for your business needs. Impress clients and maintain productivity with our premium business-class fleet.",
    bullets: [
      "Priority Booking",
      "Dedicated Account Manager",
      "Custom Billing Options",
    ],
    cta: { label: "BUSINESS INQUIRY", href: "/contact" },
    imageLeft: false,
  },
] as const;

const PERKS = [
  {
    icon: "/images/services/IMG_8.svg",
    title: "Secure Booking",
    text: "Full encryption for all transactions and identity protection.",
  },
  {
    icon: "/images/services/IMG_9.svg",
    title: "24/7 Availability",
    text: "Support and rentals available around the clock for your convenience.",
  },
  {
    icon: "/images/services/IMG_10.svg",
    title: "Global Access",
    text: "Strategic pickup locations in all major metropolitan hubs.",
  },
  {
    icon: "/images/services/IMG_2.svg",
    title: "Priority Support",
    text: "Dedicated response team for all your technical and rental needs.",
  },
] as const;

function PaintImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative aspect-[4/3] w-full"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="absolute inset-0 overflow-hidden transition-transform duration-700 ease-out hover:scale-[1.03]"
        style={{
          WebkitMaskImage: "url(/images/services/paint-mask.png)",
          maskImage: "url(/images/services/paint-mask.png)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          // luminance: white shows photo, black hides → brush edges
          WebkitMaskMode: "luminance",
          maskMode: "luminance",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    </motion.div>
  );
}

function ServiceBlock({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const reduce = useReducedMotion();
  const fromX = service.imageLeft ? -40 : 40;

  const copy = (
    <motion.div
      className="flex flex-col justify-center"
      initial={reduce ? false : { opacity: 0, x: -fromX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
    >
      <div className="mb-4 flex size-12 items-center justify-center bg-[#E8A317]/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.icon} alt="" className="size-6" />
      </div>
      <h2 className="mb-4 font-heading text-3xl font-semibold text-[#1D1F23]">
        {service.title}
      </h2>
      <p className="mb-6 max-w-lg text-base leading-relaxed text-[#6B7280]">
        {service.description}
      </p>
      <ul className="mb-8 space-y-3">
        {service.bullets.map((b) => (
          <li key={b} className="flex items-center gap-3">
            <span className="size-1.5 shrink-0 rounded-full bg-[#E8A317]" />
            <span className="text-sm font-medium text-[#1D1F23]/80">{b}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={service.cta.href}
          className="inline-flex h-12 items-center gap-3 bg-[#E8A317] px-8 text-sm font-medium text-[#F6F7F9] transition-colors hover:bg-[#d19215]"
        >
          {service.cta.label}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/services/IMG_4.svg" alt="" className="size-4" />
        </Link>
        <Link
          href="/contact"
          className="px-4 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1D1F23]"
        >
          LEARN MORE
        </Link>
      </div>
    </motion.div>
  );

  const media = (
    <PaintImage src={service.image} alt={service.imageAlt} priority={index === 0} />
  );

  return (
    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {service.imageLeft ? (
        <>
          {media}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {media}
        </>
      )}
    </section>
  );
}

export function ServicesPageContent() {
  const reduce = useReducedMotion();

  return (
    <div className="bg-[#F6F7F9]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-10 sm:px-8 lg:px-12 lg:pt-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 inline-flex items-center gap-2 border border-[#E8A317]/20 bg-[#E8A317]/10 px-3 py-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/services/IMG_2.svg" alt="" className="size-3.5" />
            <span className="text-xs font-bold tracking-wider text-[#E8A317] uppercase">
              Premium Offerings
            </span>
          </div>
          <h1 className="mb-5 font-heading text-5xl font-bold tracking-tight text-[#1D1F23]">
            Services
          </h1>
          <p className="mb-6 max-w-3xl font-heading text-2xl leading-snug text-[#6B7280] opacity-90 md:text-[32px] md:leading-10">
            Airport transfers, long-term rentals, and chauffeur options — more
            service packages coming soon.
          </p>
          <div className="h-1 w-20 bg-[#E8A317]" />
        </motion.div>
      </section>

      {/* Service rows */}
      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-5 py-8 sm:px-8 lg:gap-28 lg:px-12 lg:py-12">
        {SERVICES.map((service, i) => (
          <ServiceBlock key={service.id} service={service} index={i} />
        ))}
      </div>

      {/* Perks bar */}
      <motion.section
        className="border-y border-[#DFE1E4]/40 bg-[#EAECEE]/20"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={perk.icon} alt="" className="mb-4 size-8" />
              <h3 className="mb-2 text-sm font-bold tracking-wide text-[#1D1F23] uppercase">
                {perk.title}
              </h3>
              <p className="text-xs leading-relaxed text-[#6B7280]">{perk.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 lg:px-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65 }}
        >
          <h2 className="mb-5 font-heading text-3xl font-semibold text-[#1D1F23] md:text-4xl">
            Need a custom service package?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
            Our concierge team specializes in tailoring luxury experiences to your
            specific requirements. Whether it&apos;s a private fleet for an event or a
            multi-city tour, we&apos;ve got you covered.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-14 items-center justify-center bg-[#E8A317] px-12 text-sm font-bold text-[#F6F7F9] transition-colors hover:bg-[#d19215]"
            >
              CONTACT CONCIERGE
            </Link>
            <Link
              href="/vehicles"
              className="inline-flex h-14 items-center justify-center border border-[#DFE1E4] bg-[#F6F7F9] px-12 text-sm font-bold text-[#1D1F23] transition-colors hover:bg-white"
            >
              VIEW CATALOG
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
