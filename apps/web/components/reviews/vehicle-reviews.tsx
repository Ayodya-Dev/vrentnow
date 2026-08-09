"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { listVehicleReviews } from "@/lib/api/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[#E8A317]" aria-label={`${rating} of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? (
          <IconStarFilled key={i} className="size-4" />
        ) : (
          <IconStar key={i} className="size-4 opacity-30" />
        ),
      )}
    </span>
  );
}

export function VehicleReviews({ vehicleId }: { vehicleId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["vehicle-reviews", vehicleId, page],
    queryFn: () => listVehicleReviews(vehicleId, page),
    placeholderData: keepPreviousData,
  });

  if (isPending) return <Skeleton className="h-32 w-full" />;
  if (isError) {
    return <p className="text-sm text-destructive">Could not load reviews.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Customer reviews
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.stats.count === 0
              ? "No reviews yet for this vehicle."
              : `${data.stats.average?.toFixed(1) ?? "—"} average · ${data.stats.count} review${data.stats.count === 1 ? "" : "s"}`}
          </p>
        </div>
        {data.stats.average != null ? (
          <Stars rating={Math.round(data.stats.average)} />
        ) : null}
      </div>

      {data.items.length > 0 ? (
        <ul className="space-y-4">
          {data.items.map((r) => (
            <li key={r.id} className="border border-[#DFE1E4] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{r.user.username}</p>
                <Stars rating={r.rating} />
              </div>
              {r.comment ? (
                <p className="mt-2 text-sm text-[#1D1F23]">{r.comment}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
