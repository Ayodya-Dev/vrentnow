"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { hasPermission, type Role } from "@/lib/permissions";
import { deleteCategory, listCategories } from "./api";

export function CategoriesTable({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "CATEGORIES_WRITE");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["categories", page, appliedQ],
    queryFn: () => listCategories(page, appliedQ || undefined),
    placeholderData: keepPreviousData,
  });

  async function remove(id: string, name: string) {
    try {
      await deleteCategory(id);
      toast.success(`Deleted “${name}”`);
      await qc.invalidateQueries({ queryKey: ["categories"] });
      if (data && data.items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete that category");
    }
  }

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) return <p className="text-destructive">Could not load categories.</p>;

  return (
    <div className="space-y-4">
      <form
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setAppliedQ(q);
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories…"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No categories yet.
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">
                  {cat.icon ? <span className="mr-2">{cat.icon}</span> : null}
                  {cat.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(cat.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {canWrite ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/categories/${cat.id}`} />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(cat.id, cat.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination meta={data.meta} onPageChange={setPage} disabled={isFetching} />
    </div>
  );
}
