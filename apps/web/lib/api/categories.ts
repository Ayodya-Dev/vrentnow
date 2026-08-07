import { getPublic } from "@/lib/api/public";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export type CategoryPage = {
  items: Category[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export function listCategories(page = 1): Promise<CategoryPage> {
  return getPublic<CategoryPage>("categories", {
    params: { page, limit: 50 },
    revalidate: false,
  });
}
