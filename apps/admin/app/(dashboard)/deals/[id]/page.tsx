import type { Metadata } from "next";
import { EditDeal } from "@/features/deals/edit-deal";

export const metadata: Metadata = { title: "Edit deal" };

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Edit deal
      </h1>
      <EditDeal id={id} />
    </div>
  );
}
