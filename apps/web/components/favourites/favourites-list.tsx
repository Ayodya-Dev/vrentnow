"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { listFavourites } from "@/lib/api/favourites";

export function FavouritesList() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["favourites", page],
    queryFn: () => listFavourites(page),
    placeholderData: keepPreviousData,
  });

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (isError) {
    return <p className="text-destructive">Could not load favourites.</p>;
  }

  if (data.items.length === 0) {
    return (
      <p className="text-muted-foreground">
        No favourites yet. Tap the heart on any vehicle to save it here.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      {data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.meta.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
