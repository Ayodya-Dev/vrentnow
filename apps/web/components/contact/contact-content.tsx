"use client";

import { useState } from "react";
import {
  IconHeadset,
  IconMail,
  IconPhone,
  IconMapPin,
  IconClock,
  IconBrandWhatsapp,
  IconSend,
  IconCircleCheck,
  IconLock,
  IconWorld,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";


export function ContactContent() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(
        "Thank you! Your message has been sent successfully. We will get back to you within 2 hours."
      );
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1000);
  };

  return (
    <div className="bg-[#F6F7F9] min-h-screen py-10 lg:py-16 text-[#1D1F23]">
      <Container className="max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF7EC] border border-[#FDE68A] text-[#C4890F] text-xs font-semibold tracking-wider uppercase mb-4">
            <IconHeadset className="size-4 text-[#E8A317]" />
            <span>CONTACT SUPPORT</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#1D1F23] tracking-tight mb-4">
            Contact Us
          </h1>

          <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl leading-relaxed">
            Have a question about a booking or vehicle? Reach out to our team — we're here to ensure your premium VR experience is seamless.
          </p>

          <div className="mt-6 h-1 w-20 bg-[#E8A317] rounded-full" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Get in Touch & Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1D1F23]">
                Get in Touch
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Our support team is available 24/7 for technical inquiries and rental support.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              {/* Email Us */}
              <a
                href="mailto:info@vrentnow.live"
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#DFE1E4] hover:border-[#E8A317]/60 transition-all duration-200 shadow-sm group"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#FEF7EC] text-[#E8A317]">
                  <IconMail className="size-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                    EMAIL US
                  </span>
                  <p className="text-base font-bold text-[#1D1F23] group-hover:text-[#E8A317] transition-colors">
                    info@vrentnow.live
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Direct response within 2 hours
                  </p>
                </div>
              </a>

              {/* Call Us */}
              <a
                href="tel:+94717476810"
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#DFE1E4] hover:border-[#E8A317]/60 transition-all duration-200 shadow-sm group"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#FEF7EC] text-[#E8A317]">
                  <IconPhone className="size-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                    CALL US
                  </span>
                  <p className="text-base font-bold text-[#1D1F23] group-hover:text-[#E8A317] transition-colors">
                    +94717476810
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Mon-Sun, 24/7 active line
                  </p>
                </div>
              </a>

              {/* Visit Office */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#DFE1E4] shadow-sm">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#FEF7EC] text-[#E8A317]">
                  <IconMapPin className="size-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                    VISIT OFFICE
                  </span>
                  <p className="text-base font-bold text-[#1D1F23]">
                    Virtual HQ, Colombo 03
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Visit on appointment
                  </p>
                </div>
              </div>

              {/* Support Hours */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#DFE1E4] shadow-sm">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#FEF7EC] text-[#E8A317]">
                  <IconClock className="size-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                    SUPPORT HOURS
                  </span>
                  <p className="text-base font-bold text-[#1D1F23]">
                    Always Online
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Global availability for all users
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Concierge Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#DFE1E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#1D1F23]">
                  Need instant help?
                </h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                  WHATSAPP CONCIERGE
                </span>
              </div>
              <a
                href="https://wa.me/94717476810?text=Hi%20VRentNow%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#10B981] text-[#10B981] bg-[#ECFDF5] hover:bg-[#10B981] hover:text-white font-semibold text-xs transition-all duration-200 shrink-0"
              >
                <IconBrandWhatsapp className="size-4" />
                <span>CHAT ON WHATSAPP</span>
              </a>
            </div>

            {/* Global Presence indicator */}
            <div className="pt-4 border-t border-[#DFE1E4]/70 flex items-center justify-between text-xs font-bold tracking-wider text-[#6B7280] uppercase">
              <span className="flex items-center gap-2">
                <IconWorld className="size-4 text-[#E8A317]" />
                <span>GLOBAL PRESENCE</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="size-2 rounded-full bg-[#E8A317]" />
                <span className="size-2 rounded-full bg-[#3B82F6]" />
              </div>
            </div>
          </div>

          {/* Right Column: Send a Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-[#DFE1E4] shadow-xl shadow-gray-200/40">
              <div className="mb-6 sm:mb-8">
                <h2 className="font-heading text-2xl font-bold text-[#1D1F23]">
                  Send a Message
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Complete the form below and our technical specialists will contact you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2"
                    >
                      FULL NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full bg-[#F9FAFB] border border-[#DFE1E4] rounded-xl px-4 py-3 text-sm text-[#1D1F23] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8A317]/50 focus:border-[#E8A317] transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2"
                    >
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full bg-[#F9FAFB] border border-[#DFE1E4] rounded-xl px-4 py-3 text-sm text-[#1D1F23] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8A317]/50 focus:border-[#E8A317] transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2"
                    >
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1(555) 000-0000"
                      className="w-full bg-[#F9FAFB] border border-[#DFE1E4] rounded-xl px-4 py-3 text-sm text-[#1D1F23] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8A317]/50 focus:border-[#E8A317] transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2"
                    >
                      SUBJECT
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Hardware inquiry"
                      className="w-full bg-[#F9FAFB] border border-[#DFE1E4] rounded-xl px-4 py-3 text-sm text-[#1D1F23] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8A317]/50 focus:border-[#E8A317] transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2"
                  >
                    YOUR MESSAGE <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    className="w-full bg-[#F9FAFB] border border-[#DFE1E4] rounded-xl p-4 text-sm text-[#1D1F23] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8A317]/50 focus:border-[#E8A317] transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E8A317] hover:bg-[#C4890F] text-white font-bold text-sm tracking-wider uppercase py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="size-5 animate-spin" />
                      <span>SENDING...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT QUERY</span>
                      <IconSend className="size-4" />
                    </>
                  )}
                </button>

                {/* Trust / Security Footer */}
                <div className="pt-6 border-t border-[#DFE1E4]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <IconCircleCheck className="size-4 text-[#10B981]" />
                    <span>Response guaranteed in 24h</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconLock className="size-4 text-[#6B7280]" />
                    <span>End-to-end encrypted form</span>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
