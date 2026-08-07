import type { Metadata } from "next";
import { EditCategory } from "@/features/categories/edit-category";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Edit category</h1>
      <EditCategory id={id} />
    </div>
  );
}
