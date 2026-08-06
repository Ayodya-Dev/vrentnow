import type { Metadata } from "next";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata: Metadata = { title: "Deals & Offers" };

export default function DealsPage() {
  return (
    <SimplePage
      title="Deals & Offers"
      description="Seasonal discounts and category offers will appear here. Check back soon for the latest promotions."
    />
  );
}
