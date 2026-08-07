import { bffFetch } from "@/lib/api/bff";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryPage = {
  items: Category[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type CategoryInput = {
  name: string;
  icon?: string;
  description?: string;
};

export function listCategories(
  page = 1,
  q?: string,
  limit = 20,
): Promise<CategoryPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q?.trim()) params.set("q", q.trim());
  return bffFetch<CategoryPage>(`admin/categories?${params}`);
}

export function getCategory(id: string): Promise<Category> {
  return bffFetch<Category>(`admin/categories/${id}`);
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return bffFetch<Category>("admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  return bffFetch<Category>(`admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return bffFetch<void>(`admin/categories/${id}`, { method: "DELETE" });
}
