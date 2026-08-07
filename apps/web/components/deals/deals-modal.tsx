"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCopy,
  IconCheck,
  IconX,
  IconCrown,
  IconTag,
  IconArrowRight,
  IconShieldCheck,
  IconGift,
  IconFlame,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { Promotion } from "./deals-promotions";

interface ClaimOfferModalProps {
  promotion: Promotion | null;
  onClose: () => void;
}

export function ClaimOfferModal({ promotion, onClose }: ClaimOfferModalProps) {
  const [copied, setCopied] = useState(false);

  if (!promotion) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promotion.code.toUpperCase());
    setCopied(true);
    toast.success(`Promo code "${promotion.code.toUpperCase()}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <IconX className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#FFF8EC] text-[#E8A317]">
            <IconTag className="size-6 stroke-[1.8]" />
          </div>
          <span className="inline-block rounded-md bg-[#E8A317] px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider mb-1">
            {promotion.badge}
          </span>
          <h3 className="font-heading text-2xl font-extrabold text-[#1D1F23]">
            {promotion.title}
          </h3>
          <p className="text-sm font-semibold text-[#E8A317] mt-1">
            Discount: {promotion.discount}
          </p>
        </div>

        <p className="text-xs text-[#6B7280] text-center leading-relaxed mb-6">
          {promotion.description}
        </p>

        {/* Promo Code Box */}
        <div className="mb-6 rounded-xl bg-[#F6F7F9] p-4 border border-dashed border-[#E8A317]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1 text-center">
            Your Exclusive Promo Code
          </p>
          <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-gray-200">
            <span className="font-mono text-lg font-bold tracking-widest text-[#1D1F23] uppercase">
              {promotion.code}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#E8A317] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#D49213] cursor-pointer"
            >
              {copied ? (
                <>
                  <IconCheck className="size-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <IconCopy className="size-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2">
          <Link
            href="/vehicles"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1D1F23] py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            <span>Browse Eligible Vehicles</span>
            <IconArrowRight className="size-4" />
          </Link>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoyaltyModal({ isOpen, onClose }: LoyaltyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <IconX className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-[#FFF8EC] text-[#E8A317]">
            <IconCrown className="size-8 stroke-[1.75]" />
          </div>
          <h3 className="font-heading text-2xl font-extrabold text-[#1D1F23]">
            VRentNow Loyalty Club
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Earn rewards with every rental. Unlock priority upgrades, exclusive
            discounts, and zero security deposit perks.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
              <IconGift className="size-4 text-[#E8A317]" />
              <span>Bronze Tier</span>
            </div>
            <p className="text-[11px] text-amber-800">5% discount on all bookings + 1x points.</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <IconShieldCheck className="size-4 text-slate-600" />
              <span>Silver Tier</span>
            </div>
            <p className="text-[11px] text-slate-600">10% discount + priority check-in & free driver.</p>
          </div>

          <div className="rounded-xl bg-yellow-50/80 p-3.5 border border-yellow-300">
            <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-900 mb-1">
              <IconFlame className="size-4 text-yellow-600" />
              <span>Gold Tier</span>
            </div>
            <p className="text-[11px] text-yellow-800">15% discount + free upgrade on available fleet.</p>
          </div>

          <div className="rounded-xl bg-gray-900 p-3.5 text-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E8A317] mb-1">
              <IconCrown className="size-4 text-[#E8A317]" />
              <span>VIP Elite</span>
            </div>
            <p className="text-[11px] text-gray-300">20% discount + dedicated concierge & zero deposit.</p>
          </div>
        </div>

        {/* Join Button */}
        <div className="flex flex-col gap-2">
          <Link
            href="/register"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#E8A317] py-3 text-sm font-bold text-white transition-all hover:bg-[#D49213]"
          >
            <span>Join Now for Free</span>
            <IconArrowRight className="size-4" />
          </Link>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 py-1 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
