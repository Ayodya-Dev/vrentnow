"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";

export function NotificationsList() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => listNotifications(page),
    placeholderData: keepPreviousData,
  });

  async function markOne(id: string, isRead: boolean) {
    if (isRead) return;
    try {
      await markNotificationRead(id);
      await qc.invalidateQueries({ queryKey: ["notifications"] });
      await qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    }
  }

  async function markAll() {
    try {
      await markAllNotificationsRead();
      toast.success("All notifications marked as read");
      await qc.invalidateQueries({ queryKey: ["notifications"] });
      await qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    }
  }

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (isError) {
    return <p className="text-destructive">Could not load notifications.</p>;
  }

  const hasUnread = data.items.some((n) => !n.isRead);

  return (
    <div className="space-y-4">
      {hasUnread ? (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all as read
          </Button>
        </div>
      ) : null}

      {data.items.length === 0 ? (
        <p className="text-muted-foreground">No notifications yet.</p>
      ) : (
        <ul className="divide-y border">
          {data.items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markOne(n.id, n.isRead)}
                className={`w-full px-4 py-4 text-left transition hover:bg-[#F6F7F9] ${
                  n.isRead ? "" : "bg-[#FEF7EC]/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-sm ${
                        n.isRead ? "font-medium" : "font-semibold"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-[#E8A317]" />
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

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
