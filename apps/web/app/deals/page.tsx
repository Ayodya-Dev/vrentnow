import type { Metadata } from "next";
import { DealsContent } from "@/components/deals/deals-content";

export const metadata: Metadata = {
  title: "Exclusive Deals & Special Offers",
  description:
    "Unlock exceptional savings on luxury vehicles, long-term rentals, and special event packages with VRentNow.",
};

export default function DealsPage() {
  return <DealsContent />;
}
