"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  createReview,
  getMyReviewForBooking,
} from "@/lib/api/reviews";

export function BookingReviewForm({
  bookingId,
  canReview,
}: {
  bookingId: string;
  canReview: boolean;
}) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["booking-review", bookingId],
    queryFn: () => getMyReviewForBooking(bookingId),
    enabled: canReview,
  });

  if (!canReview) return null;
  if (isPending) return <Skeleton className="h-24 w-full" />;

  if (data && typeof data.rating === "number") {
    const statusNote =
      data.status === "PENDING"
        ? "Awaiting admin approval — not shown publicly yet."
        : data.status === "REJECTED"
          ? "This review was not approved and will not appear publicly."
          : "Published on the vehicle page.";

    return (
      <div className="space-y-2 border-t pt-6">
        <h2 className="font-heading text-lg font-semibold">Your review</h2>
        <p className="text-sm">
          {"★".repeat(data.rating)}
          {"☆".repeat(5 - data.rating)}
        </p>
        {data.comment ? (
          <p className="text-sm text-muted-foreground">{data.comment}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">{statusNote}</p>
      </div>
    );
  }

  async function submit() {
    setSaving(true);
    try {
      await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Review submitted — it will appear after admin approval");
      await qc.invalidateQueries({ queryKey: ["booking-review", bookingId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 border-t pt-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Leave a review</h2>
        <p className="text-sm text-muted-foreground">
          Rate your completed rental. Reviews are published after admin approval.
        </p>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
              className="text-[#E8A317]"
            >
              {value <= rating ? (
                <IconStarFilled className="size-7" />
              ) : (
                <IconStar className="size-7 opacity-35" />
              )}
            </button>
          );
        })}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comments"
        rows={3}
      />
      <Button
        onClick={submit}
        disabled={saving}
        className="bg-[#E8A317] text-white hover:bg-[#d19215]"
      >
        {saving ? "Saving…" : "Submit review"}
      </Button>
    </div>
  );
}
