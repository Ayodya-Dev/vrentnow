import { bffFetch } from "@/lib/api/bff";

export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationPage = {
  items: Notification[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export function listNotifications(page = 1): Promise<NotificationPage> {
  const qs = new URLSearchParams({ page: String(page), limit: "20" });
  return bffFetch<NotificationPage>(`notifications?${qs}`);
}

export function unreadNotificationCount(): Promise<{ count: number }> {
  return bffFetch<{ count: number }>("notifications/unread-count");
}

export function markNotificationRead(id: string): Promise<Notification> {
  return bffFetch<Notification>(`notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead(): Promise<{ count: number }> {
  return bffFetch<{ count: number }>("notifications/read-all", {
    method: "POST",
  });
}
