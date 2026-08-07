const STEPS = [
  {
    n: "1",
    title: "Reserve",
    body: "Pick dates and lock your vehicle online in minutes.",
  },
  {
    n: "2",
    title: "Verify",
    body: "We confirm your booking and prepare handover documents.",
  },
  {
    n: "3",
    title: "Deliver",
    body: "Collect at the branch and drive away with confidence.",
  },
] as const;

/** Visily “Seamless Rental Experience” — heading left, steps right on desktop. */
export function VehicleRentalSteps() {
  return (
    <section className="bg-[#F6F7F9] py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-md">
          <h2 className="font-heading text-3xl font-bold text-[#1D1F23] md:text-4xl">
            Seamless Rental Experience
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
            From reservation to keys in hand — a clear path with VRentNow so you can
            focus on the drive.
          </p>
        </div>

        <div className="relative flex flex-1 flex-col items-center gap-10 sm:flex-row sm:justify-end sm:gap-8">
          <div
            className="pointer-events-none absolute top-5 right-[12%] left-[12%] hidden h-px bg-[#DFE1E4] sm:block"
            aria-hidden
          />
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="relative z-10 flex max-w-[140px] flex-col items-center text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-full border border-[#E8A317] bg-white text-sm font-bold text-[#E8A317]">
                {step.n}
              </div>
              <p className="mt-4 text-[11px] font-bold tracking-[0.2em] text-[#1D1F23] uppercase">
                {step.title}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-[#6B7280]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
