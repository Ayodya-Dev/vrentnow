"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { applyApiErrors } from "@/lib/form-errors";
import { uploadImage } from "@/lib/upload";
import { listCategories } from "@/features/categories/api";
import {
  createVehicle,
  updateVehicle,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  STATUS_OPTIONS,
  type Vehicle,
  type FuelType,
  type TransmissionType,
  type VehicleStatus,
} from "./api";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(200),
  brand: z.string().min(1, "Brand is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  year: z.number().int().min(1990).max(2100),
  seats: z.number().int().min(1).max(60),
  fuel: z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC"]),
  transmission: z.enum(["AUTOMATIC", "MANUAL"]),
  pricePerDay: z.number().min(0),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"]),
  description: z.string().max(5000).optional(),
});

type Values = z.infer<typeof schema>;

type ImageSlot = { fileId: string; url: string };

const MAX_IMAGES = 8;

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [images, setImages] = useState<ImageSlot[]>(() => {
    if (!vehicle) return [];
    const urls = vehicle.imageUrls ?? [];
    return vehicle.imageFileIds.map((fileId, i) => ({
      fileId,
      url: urls[i] ?? "",
    }));
  });
  const [uploading, setUploading] = useState(false);

  const { data: categoriesPage } = useQuery({
    queryKey: ["categories", "picker"],
    queryFn: () => listCategories(1, undefined, 100),
  });
  const categories = categoriesPage?.items ?? [];

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: vehicle?.name ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year ?? new Date().getFullYear(),
      seats: vehicle?.seats ?? 5,
      fuel: (vehicle?.fuel as FuelType) ?? "PETROL",
      transmission: (vehicle?.transmission as TransmissionType) ?? "AUTOMATIC",
      pricePerDay:
        typeof vehicle?.pricePerDay === "string"
          ? Number(vehicle.pricePerDay)
          : (vehicle?.pricePerDay ?? 0),
      categoryId: vehicle?.categoryId ?? "",
      status: (vehicle?.status as VehicleStatus) ?? "AVAILABLE",
      description: vehicle?.description ?? "",
    },
  });

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} photos per vehicle`);
      return;
    }
    const batch = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.message(`Only ${remaining} more photo(s) can be added`);
    }
    setUploading(true);
    try {
      const uploaded: ImageSlot[] = [];
      for (const file of batch) {
        const res = await uploadImage(file, "vehicle");
        uploaded.push({ fileId: res.fileId, url: res.url });
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(
        uploaded.length === 1 ? "Photo added" : `${uploaded.length} photos added`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(fileId: string) {
    setImages((prev) => prev.filter((img) => img.fileId !== fileId));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[target]!;
      next[target] = tmp;
      return next;
    });
  }

  async function onSubmit(values: Values) {
    const payload = {
      name: values.name,
      brand: values.brand,
      model: values.model,
      year: values.year,
      seats: values.seats,
      fuel: values.fuel,
      transmission: values.transmission,
      pricePerDay: values.pricePerDay,
      categoryId: values.categoryId,
      status: values.status,
      description: values.description?.trim() || undefined,
      imageFileIds: images.map((img) => img.fileId),
    };
    try {
      if (vehicle) {
        await updateVehicle(vehicle.id, payload);
        toast.success("Vehicle updated");
      } else {
        await createVehicle(payload);
        toast.success("Vehicle created");
      }
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/vehicles");
      router.refresh();
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  }

  const selectClass =
    "border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring";

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-5"
      noValidate
    >
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" {...form.register("name")} />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="brand">Brand</FieldLabel>
          <Input id="brand" {...form.register("brand")} />
          <FieldError>{form.formState.errors.brand?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="model">Model</FieldLabel>
          <Input id="model" {...form.register("model")} />
          <FieldError>{form.formState.errors.model?.message}</FieldError>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="year">Year</FieldLabel>
          <Input
            id="year"
            type="number"
            {...form.register("year", { valueAsNumber: true })}
          />
          <FieldError>{form.formState.errors.year?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="seats">Seats</FieldLabel>
          <Input
            id="seats"
            type="number"
            {...form.register("seats", { valueAsNumber: true })}
          />
          <FieldError>{form.formState.errors.seats?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="pricePerDay">Price / day (LKR)</FieldLabel>
          <Input
            id="pricePerDay"
            type="number"
            step="0.01"
            {...form.register("pricePerDay", { valueAsNumber: true })}
          />
          <FieldError>{form.formState.errors.pricePerDay?.message}</FieldError>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="fuel">Fuel</FieldLabel>
          <select id="fuel" className={selectClass} {...form.register("fuel")}>
            {FUEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError>{form.formState.errors.fuel?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="transmission">Transmission</FieldLabel>
          <select
            id="transmission"
            className={selectClass}
            {...form.register("transmission")}
          >
            {TRANSMISSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError>{form.formState.errors.transmission?.message}</FieldError>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <select
            id="categoryId"
            className={selectClass}
            {...form.register("categoryId")}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError>{form.formState.errors.categoryId?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <select id="status" className={selectClass} {...form.register("status")}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError>{form.formState.errors.status?.message}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea id="description" rows={4} {...form.register("description")} />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="images">Photos (gallery)</FieldLabel>
        <p className="text-muted-foreground mb-2 text-xs">
          First photo is the cover on the catalog. Add more photos for the detail-page
          gallery thumbnails (up to {MAX_IMAGES}). JPEG, PNG, or WebP — max 10 MB each.
        </p>

        {images.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div
                key={img.fileId}
                className="relative size-28 overflow-hidden rounded border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url || undefined}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {index === 0 ? "Cover" : `Photo ${index + 1}`}
                </span>
                <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                  <button
                    type="button"
                    className="rounded bg-black/70 px-1.5 text-xs text-white disabled:opacity-30"
                    disabled={index === 0}
                    title="Move earlier"
                    onClick={() => moveImage(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded bg-black/70 px-1.5 text-xs text-white disabled:opacity-30"
                    disabled={index === images.length - 1}
                    title="Move later"
                    onClick={() => moveImage(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="rounded bg-black/70 px-1.5 text-xs text-white"
                    title="Remove"
                    onClick={() => removeImage(img.fileId)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-3 text-sm">No photos yet.</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading || images.length >= MAX_IMAGES}
            className="max-w-xs"
            onChange={(e) => {
              void onFilesSelected(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-muted-foreground text-xs">
            {images.length}/{MAX_IMAGES} photos
            {uploading ? " · Uploading…" : null}
          </span>
        </div>
      </Field>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
          {form.formState.isSubmitting
            ? "Saving…"
            : uploading
              ? "Uploading…"
              : vehicle
                ? "Save changes"
                : "Create vehicle"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/vehicles")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
