"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getCategory } from "./api";
import { CategoryForm } from "./category-form";

export function EditCategory({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["categories", id],
    queryFn: () => getCategory(id),
  });

  if (isPending) return <Skeleton className="h-64 w-full max-w-xl" />;
  if (isError) return <p className="text-destructive">Could not load that category.</p>;

  return <CategoryForm category={data} />;
}
