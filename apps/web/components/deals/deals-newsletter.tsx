"use client";

import { useState } from "react";
import { IconBolt, IconShieldCheck, IconCheck } from "@tabler/icons-react";
import { Container } from "@/components/layout/container";
import { toast } from "sonner";

export function DealsNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitted(true);
    toast.success("Subscribed successfully! Welcome to Priority Pass.");
  };

  return (
    <section className="bg-[#18191C] py-16 sm:py-20 text-white relative overflow-hidden">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Content + Form */}
          <div className="lg:col-span-7">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Never Miss a Premium Deal
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mb-8">
              Subscribe to our exclusive &quot;Priority Pass&quot; newsletter.
              Get first access to limited-edition vehicle releases and seasonal flash
              sales before they go public.
            </p>

            {submitted ? (
              <div className="inline-flex items-center gap-3 rounded-lg bg-[#E8A317]/20 border border-[#E8A317]/40 px-5 py-3.5 text-sm text-[#E8A317]">
                <IconCheck className="size-5 shrink-0 text-[#E8A317]" />
                <span>You&apos;re subscribed to Priority Pass! Check your email for deals.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mb-6 max-w-lg">
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 rounded-lg border border-gray-700 bg-[#2A2D34] px-4 py-3.5 text-sm text-white placeholder-gray-400 focus:border-[#E8A317] focus:outline-none focus:ring-1 focus:ring-[#E8A317]"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#E8A317] px-6 py-3.5 text-sm font-bold text-[#1D1F23] transition-all hover:bg-[#D49213] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                  >
                    Subscribe Now
                  </button>
                </div>
              </form>
            )}

            {/* Checkmarks */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-2">
                <IconBolt className="size-4 text-[#E8A317]" />
                <span>Instant Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <IconShieldCheck className="size-4 text-[#E8A317]" />
                <span>Spam-free Privacy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Gold SUV Silhouette Art */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="w-full max-w-md opacity-25 hover:opacity-35 transition-opacity">
              <svg
                viewBox="0 0 500 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto text-[#E8A317]"
              >
                {/* SUV Car Body Stroke Silhouette */}
                <path
                  d="M30 140 H70 M130 140 H370 M430 140 H470 M30 140 C25 140 20 135 20 125 C20 115 35 110 50 110 L90 108 L150 60 C165 48 185 45 240 45 L340 48 C375 50 395 65 420 95 L460 100 C475 102 485 112 485 125 C485 135 480 140 470 140 M90 108 L170 108 M160 62 L320 62 L375 105 L170 105 Z"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Windows */}
                <path
                  d="M175 66 L250 66 L250 100 L175 100 Z M260 66 L330 66 L365 100 L260 100 Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Wheel Front */}
                <circle cx="100" cy="140" r="30" stroke="currentColor" strokeWidth="4" />
                <circle cx="100" cy="140" r="14" stroke="currentColor" strokeWidth="3" />
                {/* Wheel Rear */}
                <circle cx="400" cy="140" r="30" stroke="currentColor" strokeWidth="4" />
                <circle cx="400" cy="140" r="14" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
