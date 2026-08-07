import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  IconArrowRight,
  IconLock,
  IconUsers,
  IconClock,
  IconAward,
  IconCar,
  IconHeadset,
} from "@tabler/icons-react";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "At VRentNow, we make vehicle rentals simple, secure, and convenient. Premium service for those who value time and reliability.",
};

const FEATURES = [
  {
    icon: IconLock,
    title: "Secure Booking",
    description:
      "Our secure booking system and flexible payment options ensure a hassle-free experience from reservation to return.",
  },
  {
    icon: IconUsers,
    title: "Customer Trust",
    description:
      "Customer satisfaction is at the heart of everything we do. We are committed to providing quality vehicles and exceptional service.",
  },
  {
    icon: IconClock,
    title: "Fast & Affordable",
    description:
      "We believe renting a vehicle should be fast, affordable, and stress-free. Our quick process keeps focus on your destination.",
  },
  {
    icon: IconAward,
    title: "Highest Standards",
    description:
      "Every vehicle is regularly inspected, cleaned, and maintained to the highest standards of safety and reliability.",
  },
  {
    icon: IconCar,
    title: "Diverse Fleet",
    description:
      "From compact city cars to premium luxury sedans, find the perfect vehicle for your specific travel requirements.",
  },
  {
    icon: IconHeadset,
    title: "Dedicated Support",
    description:
      "Our team works hard to ensure your experience is smooth, providing assistance whenever you need it 24/7.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-[#F8F9FA] text-[#1D1F23]">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-24">
        <Container className="max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Hero Left Content */}
            <div className="flex flex-col justify-center lg:col-span-6">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8A317]">
                <span className="text-base font-semibold">/</span>
                <span>OUR JOURNEY</span>
              </div>

              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-[#1D1F23] sm:text-5xl lg:text-6xl leading-[1.15] mb-6">
                Your Trusted Partner <br />
                for{" "}
                <span className="text-[#E8A317]">Every Journey.</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#5A5D63] sm:text-lg mb-8">
                At VRentNow, we make vehicle rentals simple, secure, and
                convenient. Premium service for those who value time and
                reliability.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/vehicles"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#E8A317] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#C4890F] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E8A317] focus:ring-offset-2"
                >
                  <span>EXPLORE FLEET</span>
                  <IconArrowRight className="size-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-[#DFE1E4] bg-white px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1D1F23] shadow-sm transition-all hover:bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1D1F23]/20"
                >
                  CONTACT US
                </Link>
              </div>
            </div>

            {/* Hero Right Image */}
            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl border border-gray-100/80">
                <Image
                  src="/images/about/hero-car.png"
                  alt="VRentNow rental car on city street"
                  fill
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: SIMPLE, SECURE, CONVENIENT */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white py-16 md:py-24 border-t border-gray-100">
        <Container className="max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Text Content Left */}
            <div className="lg:col-span-7 pr-0 lg:pr-8">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[#1D1F23] sm:text-4xl mb-6">
                Simple, Secure, Convenient
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-[#5A5D63]">
                <p>
                  At VRentNow, we make vehicle rentals simple, secure, and
                  convenient. Whether you&apos;re planning a family vacation, a
                  business trip, or need a reliable vehicle for everyday travel,
                  our platform offers a seamless online rental experience
                  tailored to your needs.
                </p>
                <p>
                  With a wide range of well-maintained vehicles, VRentNow allows
                  customers to easily browse available cars, compare features,
                  check real-time availability, and book their preferred vehicle
                  in just a few clicks.
                </p>
              </div>
            </div>

            {/* Image Right */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-md border border-gray-100">
                <Image
                  src="/images/about/dark-car.png"
                  alt="Sleek dark sports sedan vehicle"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: WHY VRENTNOW STANDS OUT */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#F6F7F9] py-20 md:py-28">
        <Container className="max-w-7xl">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#1D1F23] sm:text-4xl mb-4">
              Why VRentNow Stands Out
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              With our easy-to-use booking system, high quality maintained
              vehicles & 24/7 support, we make renting a vehicle simple,
              transparent & stress-free.
            </p>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#E8A317]" />
          </div>

          {/* 3x2 Feature Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group flex flex-col rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100"
                >
                  <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-[#FFF8E6] text-[#E8A317] transition-colors group-hover:bg-[#E8A317] group-hover:text-white">
                    <Icon className="size-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#1D1F23] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6B7280]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: TRAVEL WITH CONFIDENCE */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white py-16 md:py-24 border-t border-gray-100">
        <Container className="max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Image Left */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-md border border-gray-100">
                <Image
                  src="/images/about/camper-van.png"
                  alt="Traveler with red van in scenic mountains"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Text Content Right */}
            <div className="lg:col-span-7 order-1 lg:order-2 pl-0 lg:pl-8">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[#1D1F23] sm:text-4xl mb-4">
                Travel With Confidence
              </h2>
              <div className="mb-6 h-1 w-12 rounded-full bg-[#E8A317]" />
              <div className="space-y-4 text-base leading-relaxed text-[#5A5D63]">
                <p>
                  Customer satisfaction is at the heart of everything we do. We
                  are committed to providing quality vehicles, exceptional
                  service, and a seamless rental process. Our dedicated team
                  works hard to ensure every vehicle is regularly inspected,
                  cleaned, and maintained to the highest standards of safety and
                  reliability.
                </p>
                <p>
                  At VRentNow, we believe renting a vehicle should be fast,
                  affordable, and stress-free. Whether you&apos;re exploring new
                  destinations or commuting for work, we&apos;re here to help you
                  travel with confidence.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: DARK CTA BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#18191C] py-20 md:py-24 text-white">
        {/* Subtle background SVG pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <Container className="relative z-10 max-w-4xl text-center">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
            Drive with confidence.
          </h2>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-[#E8A317] leading-tight mb-6">
            Rent with VRentNow.
          </h2>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#9CA3AF] mb-10 leading-relaxed">
            Ready to start your next journey with the partner you can trust?
            Our fleet is ready for you!
          </p>

          <Link
            href="/vehicles"
            className="inline-flex items-center justify-center rounded-lg bg-[#E8A317] px-9 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#C4890F] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E8A317] focus:ring-offset-2 focus:ring-offset-[#18191C]"
          >
            BROWSE ALL VEHICLES
          </Link>
        </Container>
      </section>
    </div>
  );
}
