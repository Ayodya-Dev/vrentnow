import type { Metadata } from "next";
import { VehicleForm } from "@/features/vehicles/vehicle-form";

export const metadata: Metadata = { title: "New vehicle" };

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">New vehicle</h1>
      <VehicleForm />
    </div>
  );
}
