import type { Metadata } from "next";
import { DealsContent } from "@/components/deals/deals-content";
import { dealToPromotion, listDeals } from "@/lib/api/deals";

export const metadata: Metadata = {
  title: "Exclusive Deals & Special Offers",
  description:
    "Unlock exceptional savings on luxury vehicles, long-term rentals, and special event packages with VRentNow.",
};

/** Always load offers from the API — do not serve a stale empty catalogue. */
export const dynamic = "force-dynamic";

export default async function DealsPage() {
  let promotions: ReturnType<typeof dealToPromotion>[] = [];
  try {
    const page = await listDeals();
    promotions = (page.items ?? []).map(dealToPromotion);
  } catch (error) {
    console.error("[deals] failed to load public deals", error);
    promotions = [];
  }

  return <DealsContent promotions={promotions} />;
}
