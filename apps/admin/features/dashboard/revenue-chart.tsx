"use client";

import type { MonthlyPoint } from "./api";

export function RevenueChart({ data }: { data: MonthlyPoint[] }) {
  const width = 640;
  const height = 240;
  const pad = { top: 16, right: 16, bottom: 36, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const revenues = data.map((d) => Number(d.revenue) || 0);
  const bookings = data.map((d) => d.bookings);
  const maxRevenue = Math.max(...revenues, 1);
  const maxBookings = Math.max(...bookings, 1);

  const xAt = (i: number) =>
    pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yRevenue = (v: number) =>
    pad.top + innerH - (v / maxRevenue) * innerH;
  const yBookings = (v: number) =>
    pad.top + innerH - (v / maxBookings) * innerH;

  const revenueLine = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yRevenue(Number(d.revenue) || 0)}`)
    .join(" ");
  const areaPath = `${revenueLine} L ${xAt(data.length - 1)} ${pad.top + innerH} L ${xAt(0)} ${pad.top + innerH} Z`;
  const bookingsLine = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yBookings(d.bookings)}`)
    .join(" ");

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
    const value = (maxRevenue / ticks) * (ticks - i);
    return { y: yRevenue(value), label: formatAxis(value) };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label="Revenue and bookings over the last 6 months"
      >
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8A317" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E8A317" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t.label}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={t.y}
              y2={t.y}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
            />
            <text
              x={pad.left - 8}
              y={t.y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize="11"
            >
              {t.label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#revenueFill)" />
        <path
          d={revenueLine}
          fill="none"
          stroke="#E8A317"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={bookingsLine}
          fill="none"
          stroke="#1D1F23"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 4"
          opacity="0.55"
        />

        {data.map((d, i) => (
          <g key={d.month}>
            <circle
              cx={xAt(i)}
              cy={yRevenue(Number(d.revenue) || 0)}
              r="3.5"
              fill="#E8A317"
            />
            <text
              x={xAt(i)}
              y={height - 12}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="11"
            >
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-primary" />
          Revenue
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-foreground/70" />
          Bookings
        </span>
      </div>
    </div>
  );
}

function formatAxis(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}
