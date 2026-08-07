"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { applyApiErrors } from "@/lib/form-errors";
import { createCategory, updateCategory, type Category } from "./api";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  icon: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
});

type Values = z.infer<typeof schema>;

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const qc = useQueryClient();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? "",
      description: category?.description ?? "",
    },
  });

  async function onSubmit(values: Values) {
    const payload = {
      name: values.name,
      icon: values.icon?.trim() || undefined,
      description: values.description?.trim() || undefined,
    };
    try {
      if (category) {
        await updateCategory(category.id, payload);
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }
      await qc.invalidateQueries({ queryKey: ["categories"] });
      router.push("/categories");
      router.refresh();
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-5" noValidate>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          placeholder="e.g. Van, Car, Bike, Bus"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
        />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="icon">Icon (optional)</FieldLabel>
        <Input id="icon" placeholder="Icon key or emoji" {...form.register("icon")} />
        <FieldError>{form.formState.errors.icon?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea id="description" rows={4} {...form.register("description")} />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </Field>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving…"
            : category
              ? "Save changes"
              : "Create category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
