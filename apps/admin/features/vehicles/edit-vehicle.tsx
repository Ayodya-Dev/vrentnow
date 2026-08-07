"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getVehicle } from "./api";
import { VehicleForm } from "./vehicle-form";

export function EditVehicle({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicle(id),
  });

  if (isPending) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (isError) return <p className="text-destructive">Could not load that vehicle.</p>;

  return <VehicleForm vehicle={data} />;
}
