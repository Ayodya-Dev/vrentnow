"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getDeal } from "./api";
import { DealForm } from "./deal-form";

export function EditDeal({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["deals", id],
    queryFn: () => getDeal(id),
  });

  if (isPending) return <Skeleton className="h-64 w-full max-w-xl" />;
  if (isError) return <p className="text-destructive">Could not load that deal.</p>;

  return <DealForm deal={data} />;
}
