/** Flat 2D side-view car — no photo background. Full-width friendly. */
export function Car2DIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="2D rental car illustration"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Shadow */}
      <ellipse cx="320" cy="248" rx="220" ry="14" fill="#E5E2DB" />

      {/* Body lower */}
      <path
        d="M78 178c12-38 48-70 98-82l42-38c18-16 42-24 66-24h92c28 0 54 10 74 28l38 34c22 8 48 14 78 18 36 4 68 22 82 52v22H78v-10z"
        fill="#1D1F23"
      />
      {/* Cabin glass */}
      <path
        d="M232 96h88c18 0 34 6 46 18l28 28H208l24-46z"
        fill="#BDC0C6"
      />
      <path
        d="M336 96h48c16 0 30 8 40 20l22 26H360l-24-46z"
        fill="#9DA1A7"
      />
      {/* Accent stripe */}
      <path d="M120 168h400" stroke="#E8A317" strokeWidth="6" strokeLinecap="round" />
      {/* Headlight */}
      <rect x="548" y="168" width="28" height="14" rx="4" fill="#F6F7F9" />
      {/* Taillight */}
      <rect x="78" y="168" width="18" height="12" rx="3" fill="#E8A317" />

      {/* Wheels */}
      <circle cx="180" cy="210" r="38" fill="#121417" />
      <circle cx="180" cy="210" r="22" fill="#6B7280" />
      <circle cx="180" cy="210" r="8" fill="#DFE1E4" />
      <circle cx="460" cy="210" r="38" fill="#121417" />
      <circle cx="460" cy="210" r="22" fill="#6B7280" />
      <circle cx="460" cy="210" r="8" fill="#DFE1E4" />
    </svg>
  );
}
