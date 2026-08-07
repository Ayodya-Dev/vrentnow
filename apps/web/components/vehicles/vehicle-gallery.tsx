"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export function VehicleGallery({
  images,
  alt,
  categoryLabel,
}: {
  images: string[];
  alt: string;
  categoryLabel: string;
}) {
  const urls = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const safeActive = Math.min(active, Math.max(urls.length - 1, 0));
  const current = urls[safeActive] ?? null;

  // Up to 4 thumbnail slots: real photos first, empty slots if fewer uploads.
  const thumbSlots = Array.from({ length: 4 }, (_, i) => urls[i] ?? null);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EAECEE] shadow-sm">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current + safeActive}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={current}
                alt={alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EAECEE] to-[#DFE1E4] px-6">
              <span className="text-center text-lg font-medium text-[#6B7280]">{alt}</span>
            </div>
          )}
        </AnimatePresence>
        <span className="absolute top-4 left-4 rounded bg-[#1D1F23] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
          {categoryLabel}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {thumbSlots.map((src, i) => {
          const selected = src !== null && i === safeActive;
          const empty = src === null;
          return (
            <button
              key={i}
              type="button"
              disabled={empty}
              onClick={() => {
                if (src) setActive(i);
              }}
              className={`relative aspect-square overflow-hidden bg-[#EAECEE] transition ${
                empty
                  ? "cursor-default border border-dashed border-[#DFE1E4]"
                  : selected
                    ? "ring-2 ring-[#E8A317] ring-offset-1"
                    : "ring-1 ring-[#DFE1E4] hover:ring-[#E8A317]/60"
              }`}
              aria-label={empty ? `Empty gallery slot ${i + 1}` : `View photo ${i + 1}`}
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
