"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { StatusPill } from "@/components/status-pill";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { hasPermission, type Role } from "@/lib/permissions";
import { uploadImage } from "@/lib/upload";
import { bffDownload } from "@/lib/api/bff";
import {
  formatDateOnly,
  formatMoney,
  getBooking,
  markBookingPaid,
  NEXT_STATUSES,
  updateBookingStatus,
  updateHandoverDocs,
  type Booking,
  type BookingStatus,
} from "./api";

const ACTION_LABELS: Partial<Record<BookingStatus, string>> = {
  CONFIRMED: "Confirm booking",
  HANDED_OVER: "Mark handed over",
  COMPLETED: "Mark completed",
  CANCELLED: "Cancel booking",
};

type DocKey = "nic" | "licence" | "agreement";

const DOC_META: Record<
  DocKey,
  {
    label: string;
    kind: string;
    visibility: "public" | "private";
    fileField: "nicFileId" | "licenceFileId" | "agreementFileId";
    urlField: "nicUrl" | "licenceUrl" | "agreementUrl";
  }
> = {
  nic: {
    label: "NIC photo",
    kind: "booking-nic",
    visibility: "private",
    fileField: "nicFileId",
    urlField: "nicUrl",
  },
  licence: {
    label: "Driving licence",
    kind: "booking-licence",
    visibility: "private",
    fileField: "licenceFileId",
    urlField: "licenceUrl",
  },
  agreement: {
    label: "Rental agreement",
    kind: "booking-agreement",
    visibility: "public",
    fileField: "agreementFileId",
    urlField: "agreementUrl",
  },
};

export function BookingDetail({ id, roles }: { id: string; roles: Role[] }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "BOOKINGS_WRITE");
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState<BookingStatus | null>(null);
  const [uploading, setUploading] = useState<DocKey | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["bookings", id],
    queryFn: () => getBooking(id),
  });

  async function setStatus(status: BookingStatus) {
    if (status === "CANCELLED" && !cancelReason.trim()) {
      toast.error("Enter a cancel reason first");
      return;
    }
    setBusy(status);
    try {
      await updateBookingStatus(
        id,
        status,
        status === "CANCELLED" ? cancelReason.trim() : undefined,
      );
      toast.success(`Status updated to ${status}`);
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setBusy(null);
    }
  }

  async function onDocSelected(key: DocKey, file: File | undefined) {
    if (!file) return;
    const meta = DOC_META[key];
    setUploading(key);
    try {
      const uploaded = await uploadImage(file, meta.kind, meta.visibility);
      await updateHandoverDocs(id, { [meta.fileField]: uploaded.fileId });
      toast.success(`${meta.label} uploaded`);
      await qc.invalidateQueries({ queryKey: ["bookings", id] });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function downloadReceipt() {
    setDownloading(true);
    try {
      await bffDownload(
        `admin/bookings/${id}/receipt`,
        `vrentnow-receipt-${id}.pdf`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not download the receipt",
      );
    } finally {
      setDownloading(false);
    }
  }

  async function markPaid() {
    setMarkingPaid(true);
    try {
      await markBookingPaid(id);
      toast.success("Payment marked as paid");
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not mark as paid",
      );
    } finally {
      setMarkingPaid(false);
    }
  }

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) {
    return <p className="text-destructive">Could not load this booking.</p>;
  }

  const next = NEXT_STATUSES[data.status] ?? [];
  const canAttachDocs =
    data.status === "CONFIRMED" ||
    data.status === "HANDED_OVER" ||
    data.status === "COMPLETED";
  const missingIdDocs = !data.nicFileId || !data.licenceFileId;
  const canMarkPaid =
    canWrite &&
    data.payment?.status !== "PAID" &&
    data.status !== "CANCELLED";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Booking
            </h1>
            <StatusPill status={data.status} />
          </div>
          <p className="text-sm text-muted-foreground">ID {data.id}</p>
        </div>
        <div className="flex gap-2">
          {data?.payment?.status === "PAID" ? (
            <Button
              variant="outline"
              onClick={downloadReceipt}
              disabled={downloading}
            >
              {downloading ? "Preparing…" : "Download receipt"}
            </Button>
          ) : null}
          <Button render={<Link href="/bookings" />} variant="outline">
            Back to list
          </Button>
        </div>
      </div>

      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Customer</dt>
          <dd className="font-medium">
            {data.firstName} {data.lastName}
          </dd>
          <dd className="text-sm text-muted-foreground">{data.phone}</dd>
          <dd className="text-sm text-muted-foreground">{data.email}</dd>
          <dd className="text-sm text-muted-foreground">{data.user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Vehicle</dt>
          <dd className="font-medium">
            {data.vehicle.brand} {data.vehicle.model}
          </dd>
          <dd className="text-sm text-muted-foreground">{data.vehicle.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Pickup → return</dt>
          <dd className="font-medium">
            {formatDateOnly(data.pickupDate)} → {formatDateOnly(data.returnDate)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Pickup location</dt>
          <dd className="font-medium">{data.pickupLocation}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="text-xl font-semibold">{formatMoney(data.totalAmount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Payment</dt>
          <dd className="flex items-center gap-2 font-medium">
            {data.paymentMethod}
            <StatusPill
              status={data.payment?.status ?? "PENDING"}
              className={
                data.payment?.status === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : data.payment?.status === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : undefined
              }
            />
          </dd>
          {data.payment?.transactionId ? (
            <dd className="text-sm text-muted-foreground">
              {data.payment.transactionId}
            </dd>
          ) : null}
          {canMarkPaid ? (
            <dd className="mt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={markingPaid}
                onClick={() => setConfirmPaid(true)}
              >
                {markingPaid ? "Saving…" : "Mark as paid"}
              </Button>
            </dd>
          ) : null}
        </div>
        {data.notes ? (
          <div>
            <dt className="text-sm text-muted-foreground">Notes</dt>
            <dd className="font-medium">{data.notes}</dd>
          </div>
        ) : null}
        {data.cancelReason ? (
          <div>
            <dt className="text-sm text-muted-foreground">Cancel reason</dt>
            <dd className="font-medium">{data.cancelReason}</dd>
          </div>
        ) : null}
      </dl>

      <HandoverDocsSection
        booking={data}
        canWrite={canWrite && canAttachDocs}
        uploading={uploading}
        onSelect={onDocSelected}
      />

      {canWrite && next.length > 0 ? (
        <div className="space-y-4 border-t pt-6">
          <h2 className="font-heading text-lg font-semibold">Update status</h2>
          {next.includes("HANDED_OVER") && missingIdDocs ? (
            <p className="text-sm text-muted-foreground">
              Upload NIC and driving licence photos before marking handed over.
            </p>
          ) : null}
          {next.includes("CANCELLED") ? (
            <div className="max-w-md space-y-2">
              <Label htmlFor="cancelReason">Cancel reason</Label>
              <Input
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Required when cancelling"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {next.map((status) => (
              <Button
                key={status}
                variant={status === "CANCELLED" ? "destructive" : "default"}
                disabled={
                  busy !== null ||
                  (status === "HANDED_OVER" && missingIdDocs)
                }
                onClick={() => setStatus(status)}
              >
                {busy === status ? "Saving…" : (ACTION_LABELS[status] ?? status)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <AlertDialog open={confirmPaid} onOpenChange={setConfirmPaid}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this booking as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              Use this for offline payments (cash or bank transfer taken at
              the office). The payment is recorded as PAID with a manual
              transaction reference, and the customer receives a payment
              confirmation email. This cannot be undone from the admin
              console.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmPaid(false);
                void markPaid();
              }}
            >
              Mark as paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function HandoverDocsSection({
  booking,
  canWrite,
  uploading,
  onSelect,
}: {
  booking: Booking;
  canWrite: boolean;
  uploading: DocKey | null;
  onSelect: (key: DocKey, file: File | undefined) => void;
}) {
  const canShow =
    booking.status === "CONFIRMED" ||
    booking.status === "HANDED_OVER" ||
    booking.status === "COMPLETED" ||
    Boolean(booking.nicUrl || booking.licenceUrl || booking.agreementUrl);

  if (!canShow) return null;

  return (
    <div className="space-y-4 border-t pt-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Handover documents</h2>
        <p className="text-sm text-muted-foreground">
          Office-scanned NIC, licence, and agreement. Customers only see the agreement.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {(Object.keys(DOC_META) as DocKey[]).map((key) => {
          const meta = DOC_META[key];
          const url = booking[meta.urlField];
          const inputId = `handover-${key}`;
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={inputId}>{meta.label}</Label>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Open
                  </a>
                ) : null}
              </div>
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={meta.label}
                  className="aspect-[4/3] w-full rounded-md border object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  Not uploaded
                </div>
              )}
              {canWrite ? (
                <div>
                  <Input
                    id={inputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      onSelect(key, file);
                    }}
                  />
                  {uploading === key ? (
                    <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
