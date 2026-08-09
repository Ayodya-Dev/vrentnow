"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import {
  addFavourite,
  favouriteIds,
  removeFavourite,
} from "@/lib/api/favourites";

export function FavouriteButton({
  vehicleId,
  className = "",
}: {
  vehicleId: string;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: ids = [] } = useQuery({
    queryKey: ["favourite-ids"],
    queryFn: favouriteIds,
    enabled: status === "authenticated",
  });

  const active = ids.includes(vehicleId);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || !session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    try {
      if (active) {
        await removeFavourite(vehicleId);
        toast.success("Removed from favourites");
      } else {
        await addFavourite(vehicleId);
        toast.success("Saved to favourites");
      }
      await qc.invalidateQueries({ queryKey: ["favourite-ids"] });
      await qc.invalidateQueries({ queryKey: ["favourites"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update favourites");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || status === "loading"}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-[#DFE1E4] bg-white/90 text-[#1D1F23] shadow-sm backdrop-blur transition hover:border-[#E8A317]/50 hover:text-[#E8A317] disabled:opacity-60 ${className}`}
    >
      {active ? (
        <IconHeartFilled className="size-5 text-[#E8A317]" />
      ) : (
        <IconHeart className="size-5" />
      )}
    </button>
  );
}
