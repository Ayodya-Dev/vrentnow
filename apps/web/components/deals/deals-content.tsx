"use client";

import { useState } from "react";
import { DealsHero } from "./deals-hero";
import { DealsFeatures } from "./deals-features";
import { DealsPromotions, type Promotion } from "./deals-promotions";
import { DealsNewsletter } from "./deals-newsletter";
import { ClaimOfferModal, LoyaltyModal } from "./deals-modal";

export function DealsContent() {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  const handleBrowseOffers = () => {
    const el = document.getElementById("featured-promotions");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7F9]">
      {/* Hero Section */}
      <DealsHero
        onBrowseOffers={handleBrowseOffers}
        onJoinLoyalty={() => setIsLoyaltyOpen(true)}
      />

      {/* Feature Highlights Bar */}
      <DealsFeatures />

      {/* Featured Promotions Grid */}
      <DealsPromotions onClaimOffer={(promo) => setSelectedPromotion(promo)} />

      {/* Newsletter Banner */}
      <DealsNewsletter />

      {/* Modals */}
      <ClaimOfferModal
        promotion={selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />

      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
      />
    </div>
  );
}
