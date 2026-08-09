import { getPublic } from "@/lib/api/public";

export type Deal = {
  id: string;
  title: string;
  slug: string;
  badge: string | null;
  description: string | null;
  discountLabel: string;
  code: string | null;
  imageUrl: string | null;
  validUntilLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type DealPage = {
  items: Deal[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** UI shape used by the public /deals page (safe to import from Server Components). */
export type DealPromotion = {
  id: string;
  badge: string;
  image: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  code: string;
};

const FALLBACK_BY_SLUG: Record<string, string> = {
  "summer-special": "/images/deals/summer.png",
  "weekend-getaway": "/images/deals/weekend.png",
  "long-term-rental": "/images/deals/longterm.png",
};

const FALLBACK_IMAGE = "/images/deals/summer.png";

export function dealToPromotion(deal: Deal): DealPromotion {
  return {
    id: deal.id,
    badge: deal.badge?.trim() || "OFFER",
    image: deal.imageUrl || FALLBACK_BY_SLUG[deal.slug] || FALLBACK_IMAGE,
    title: deal.title,
    discount: deal.discountLabel,
    description: deal.description?.trim() || "",
    validUntil: deal.validUntilLabel?.trim() || "Ongoing",
    code: deal.code?.trim() || "",
  };
}

export function listDeals(limit = 50): Promise<DealPage> {
  return getPublic<DealPage>("deals", {
    params: { page: 1, limit },
    // Offers change from admin often; avoid sticky empty ISR cache.
    revalidate: false,
  });
}
