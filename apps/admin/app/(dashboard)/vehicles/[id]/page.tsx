import type { Metadata } from "next";
import { EditVehicle } from "@/features/vehicles/edit-vehicle";

export const metadata: Metadata = { title: "Edit vehicle" };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Edit vehicle</h1>
      <EditVehicle id={id} />
    </div>
  );
}
