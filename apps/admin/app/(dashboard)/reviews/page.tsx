import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ReviewsTable } from "@/features/reviews/reviews-table";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Reviews
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate customer reviews. Only accepted reviews appear on the public
          vehicle page.
        </p>
      </div>

      <ReviewsTable roles={roles} />
    </div>
  );
}
