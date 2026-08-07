import type { Metadata } from "next";
import { CategoryForm } from "@/features/categories/category-form";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">New category</h1>
      <CategoryForm />
    </div>
  );
}
