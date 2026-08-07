"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Calendar } from "@workspace/ui/components/calendar";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  createBooking,
  estimateDays,
  formatMoney,
  PAYMENT_OPTIONS,
  toDateInput,
  type PaymentProvider,
} from "@/lib/api/bookings";
import { formatPricePerDay } from "@/lib/api/vehicles";

const fieldClass =
  "h-11 rounded-lg border-[#DFE1E4] bg-[#F6F7F9] text-[#1D1F23] shadow-none focus-visible:border-[#E8A317] focus-visible:ring-[#E8A317]/25";

type Props = {
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  pricePerDay: string | number;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultEmail?: string;
};

export function BookingForm({
  vehicleId,
  vehicleName,
  vehicleSlug,
  pricePerDay,
  defaultFirstName = "",
  defaultLastName = "",
  defaultEmail = "",
}: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [range, setRange] = useState<DateRange | undefined>();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("KOKOPAY");
  const [busy, setBusy] = useState(false);

  const pickupDate = range?.from ? toDateInput(range.from) : "";
  const returnDate = range?.to
    ? toDateInput(range.to)
    : range?.from
      ? toDateInput(range.from)
      : "";

  const days = estimateDays(pickupDate, returnDate);
  const unit = typeof pricePerDay === "string" ? Number(pricePerDay) : pricePerDay;
  const estimate = useMemo(
    () => (days > 0 && !Number.isNaN(unit) ? unit * days : 0),
    [days, unit],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dateHint = range?.from
    ? `${format(range.from, "MMM d, yyyy")}${
        range.to ? ` → ${format(range.to, "MMM d, yyyy")}` : " → pick return"
      }`
    : "Select start and end dates…";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Enter your first and last name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Enter your phone number");
      return;
    }
    if (!email.trim()) {
      toast.error("Enter your email address");
      return;
    }
    if (!pickupDate || !returnDate) {
      toast.error("Select pickup and return dates on the calendar");
      return;
    }
    setBusy(true);
    try {
      const booking = await createBooking({
        vehicleId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        pickupDate,
        returnDate,
        pickupLocation: "Main branch",
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      toast.success("Booking created — complete payment next");
      router.push(`/bookings/${booking.id}/pay`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create booking");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#DFE1E4] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#9CA3AF] uppercase">
              Vehicle
            </p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-bold text-[#1D1F23]">{vehicleName}</p>
              <p className="text-sm font-semibold text-[#E8A317]">
                {formatPricePerDay(pricePerDay)}{" "}
                <span className="font-normal text-[#6B7280]">/ day</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#DFE1E4] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#1D1F23] uppercase">
              Your details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs text-[#6B7280]">
                  First name
                </Label>
                <Input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs text-[#6B7280]">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-[#6B7280]">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-[#6B7280]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#DFE1E4] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[11px] font-bold tracking-[0.16em] text-[#1D1F23] uppercase">
                Booking calendar
              </h2>
              <p className="text-xs text-[#9CA3AF]">{dateHint}</p>
            </div>
            <div className="overflow-x-auto">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                disabled={{ before: today }}
                className="mx-auto w-full [--cell-size:--spacing(9)]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#DFE1E4] bg-white p-5 shadow-sm sm:p-6">
            <Label
              htmlFor="notes"
              className="mb-3 block text-[11px] font-bold tracking-[0.16em] text-[#1D1F23] uppercase"
            >
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="min-h-28 rounded-lg border-[#DFE1E4] bg-[#F6F7F9] shadow-none focus-visible:border-[#E8A317] focus-visible:ring-[#E8A317]/25"
            />
          </div>

          <p className="pt-1 text-center text-sm text-[#6B7280]">
            <Link
              href={`/vehicles/${vehicleSlug}`}
              className="underline-offset-4 hover:text-[#1D1F23] hover:underline"
            >
              Back to vehicle details
            </Link>
          </p>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-xl border border-[#DFE1E4] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#1D1F23] uppercase">
              Payment method
            </h2>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const selected = paymentMethod === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition ${
                      selected
                        ? "border-[#E8A317] bg-[#E8A317]/8 ring-1 ring-[#E8A317]/40"
                        : "border-[#DFE1E4] bg-white hover:border-[#E8A317]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="mt-1 accent-[#E8A317]"
                      checked={selected}
                      onChange={() => setPaymentMethod(opt.value)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[#1D1F23]">
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7280]">
                        {opt.blurb}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-[#1D1F23] p-5 text-white sm:p-6">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#E8A317] uppercase">
              Total price
            </p>
            {estimate > 0 ? (
              <>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatMoney(estimate)}
                </p>
                <p className="mt-1 text-sm text-white/55">
                  {days} day{days === 1 ? "" : "s"} × {formatPricePerDay(pricePerDay)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-base text-white/80">Select dates to calculate</p>
            )}
            <button
              type="submit"
              disabled={busy || estimate <= 0}
              className="mt-6 w-full rounded-lg bg-[#E8A317] py-3.5 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#d19215] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Creating…" : "Continue to payment"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
