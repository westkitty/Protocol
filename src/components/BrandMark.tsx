import React from "react";

export function BrandMark({ discreet = false }: { discreet?: boolean }) {
  if (discreet) {
    return (
      <svg
        viewBox="0 0 36 36"
        width="36"
        height="36"
        fill="none"
        aria-hidden="true"
        className="w-8 h-8 shrink-0"
      >
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="7"
          fill="#101014"
          stroke="#27272F"
          strokeWidth="1.5"
        />
        <path
          d="M11 11H25M11 18H21M11 25H17"
          stroke="#A6A6B2"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="2.5" fill="var(--accent)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 36"
      width="36"
      height="36"
      fill="none"
      aria-hidden="true"
      className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_var(--accent-glow)]"
    >
      <rect
        x="1.5"
        y="1.5"
        width="33"
        height="33"
        rx="7"
        fill="#101014"
        stroke="var(--accent)"
        strokeOpacity="0.65"
        strokeWidth="1.5"
      />
      <rect
        x="4.5"
        y="4.5"
        width="27"
        height="27"
        rx="5"
        fill="#070709"
        stroke="#27272F"
        strokeWidth="1"
      />
      {/* Forged D-ring / P Lock Motif */}
      <path
        d="M12 10V26M12 10H19.5C22.8 10 25 12.2 25 15.2C25 18.2 22.8 20.5 19.5 20.5H12"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10H19.5C22.8 10 25 12.2 25 15.2C25 18.2 22.8 20.5 19.5 20.5H12"
        stroke="#F87171"
        strokeOpacity="0.55"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="26" r="1.5" fill="#F5F5F7" />
    </svg>
  );
}
