"use client";

import { useState } from "react";
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
import { Checkbox } from "@workspace/ui/components/checkbox";
import { applyApiErrors } from "@/lib/form-errors";
import { uploadImage } from "@/lib/upload";
import { createDeal, updateDeal, type Deal } from "./api";

const schema = z.object({
  title: z.string().min(2, "Title is too short").max(200),
  badge: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  discountLabel: z.string().min(1, "Discount label is required").max(50),
  code: z.string().max(40).optional(),
  validUntilLabel: z.string().max(100).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type Values = z.infer<typeof schema>;

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function DealForm({ deal }: { deal?: Deal }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [image, setImage] = useState<{ fileId: string; url: string } | null>(
    () =>
      deal?.imageFileId
        ? { fileId: deal.imageFileId, url: deal.imageUrl ?? "" }
        : null,
  );
  const [uploading, setUploading] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: deal?.title ?? "",
      badge: deal?.badge ?? "",
      description: deal?.description ?? "",
      discountLabel: deal?.discountLabel ?? "",
      code: deal?.code ?? "",
      validUntilLabel: deal?.validUntilLabel ?? "",
      startsAt: toDateInput(deal?.startsAt),
      endsAt: toDateInput(deal?.endsAt),
      isActive: deal?.isActive ?? true,
      sortOrder: deal?.sortOrder ?? 0,
    },
  });

  async function onFileSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file, "deal");
      setImage({ fileId: res.fileId, url: res.url });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: Values) {
    const payload = {
      title: values.title,
      badge: values.badge?.trim() || null,
      description: values.description?.trim() || null,
      discountLabel: values.discountLabel,
      code: values.code?.trim() || null,
      validUntilLabel: values.validUntilLabel?.trim() || null,
      startsAt: values.startsAt
        ? new Date(`${values.startsAt}T00:00:00.000Z`).toISOString()
        : null,
      endsAt: values.endsAt
        ? new Date(`${values.endsAt}T23:59:59.000Z`).toISOString()
        : null,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
      imageFileId: image?.fileId ?? null,
    };
    try {
      if (deal) {
        await updateDeal(deal.id, payload);
        toast.success("Deal updated");
      } else {
        await createDeal(payload);
        toast.success("Deal created");
      }
      await qc.invalidateQueries({ queryKey: ["deals"] });
      router.push("/deals");
      router.refresh();
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-xl space-y-5"
      noValidate
    >
      <Field>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <Input
          id="title"
          placeholder="e.g. Summer Special"
          {...form.register("title")}
          aria-invalid={!!form.formState.errors.title}
        />
        <FieldError>{form.formState.errors.title?.message}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="badge">Badge</FieldLabel>
          <Input
            id="badge"
            placeholder="LIMITED TIME"
            {...form.register("badge")}
          />
          <FieldError>{form.formState.errors.badge?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="discountLabel">Discount label</FieldLabel>
          <Input
            id="discountLabel"
            placeholder="25% OFF"
            {...form.register("discountLabel")}
            aria-invalid={!!form.formState.errors.discountLabel}
          />
          <FieldError>{form.formState.errors.discountLabel?.message}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea id="description" rows={4} {...form.register("description")} />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="code">Promo code</FieldLabel>
          <Input
            id="code"
            placeholder="SUMMER25"
            {...form.register("code")}
          />
          <FieldError>{form.formState.errors.code?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="validUntilLabel">Valid-until label</FieldLabel>
          <Input
            id="validUntilLabel"
            placeholder="Valid until Aug 31, 2026"
            {...form.register("validUntilLabel")}
          />
          <FieldError>
            {form.formState.errors.validUntilLabel?.message}
          </FieldError>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="startsAt">Starts (optional)</FieldLabel>
          <Input id="startsAt" type="date" {...form.register("startsAt")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="endsAt">Ends (optional)</FieldLabel>
          <Input id="endsAt" type="date" {...form.register("endsAt")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="sortOrder">Sort order</FieldLabel>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...form.register("sortOrder", { valueAsNumber: true })}
          />
          <FieldError>{form.formState.errors.sortOrder?.message}</FieldError>
        </Field>
        <Field>
          <div className="flex items-center gap-2 pt-8">
            <Checkbox
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) =>
                form.setValue("isActive", checked === true)
              }
            />
            <FieldLabel htmlFor="isActive">Active on website</FieldLabel>
          </div>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="image">Image</FieldLabel>
        {image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt=""
            className="mb-3 aspect-[16/10] w-full max-w-sm rounded-md border object-cover"
          />
        ) : null}
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void onFileSelected(file);
          }}
        />
        {image ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setImage(null)}
          >
            Remove image
          </Button>
        ) : null}
        {uploading ? (
          <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>
        ) : null}
      </Field>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
          {form.formState.isSubmitting
            ? "Saving…"
            : deal
              ? "Save changes"
              : "Create deal"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/deals")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
