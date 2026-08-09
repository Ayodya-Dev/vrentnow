import type { Metadata } from "next";
import { DealForm } from "@/features/deals/deal-form";

export const metadata: Metadata = { title: "New deal" };

export default function NewDealPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        New deal
      </h1>
      <DealForm />
    </div>
  );
}
