import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Button } from "@workspace/ui/components/button";
import { hasPermission } from "@/lib/permissions";
import { CategoriesTable } from "@/features/categories/categories-table";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Vehicle Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Categories appear as filters on the customer website.
          </p>
        </div>
        {hasPermission(roles, "CATEGORIES_WRITE") ? (
          <Button render={<Link href="/categories/new" />}>New category</Button>
        ) : null}
      </div>

      <CategoriesTable roles={roles} />
    </div>
  );
}
