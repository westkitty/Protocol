import React from "react";

export function CategoryEmblem({
  categorySlug,
  className = "w-4 h-4 shrink-0",
}: {
  categorySlug: string;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className,
  };

  switch (categorySlug) {
    case "negotiation-foundation":
      // Twin-check consent shield
      return (
        <svg {...common}>
          <path d="M12 2.5L4.5 5.5V11.5C4.5 16.2 7.7 20.3 12 21.5C16.3 20.3 19.5 16.2 19.5 11.5V5.5L12 2.5Z" />
          <path d="M8.5 12L11 14.5L16 9.5" />
        </svg>
      );
    case "pup-play-training":
      // Geometric collar tag + directional chevron
      return (
        <svg {...common}>
          <circle cx="12" cy="6" r="2.2" />
          <path d="M6.5 10.5L12 8.5L17.5 10.5L19 16.5L12 21L5 16.5L6.5 10.5Z" />
          <path d="M9.5 14.5L12 12L14.5 14.5" />
        </svg>
      );
    case "ownership-collar-protocol":
      // Interlocked D-ring & collar clasp
      return (
        <svg {...common}>
          <rect x="3.5" y="7" width="17" height="5" rx="2.5" />
          <path d="M8 12V15.5C8 17.7 9.8 19.5 12 19.5C14.2 19.5 16 17.7 16 15.5V12" />
          <circle cx="12" cy="9.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "leather-gear":
      // Forged harness buckle & cross-strap
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M9 5V19M4 12H13" />
          <circle cx="16.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "service-structured-time":
      // Segmented tactical time-block dial
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7V12L15.5 14" />
          <path d="M12 3.5V5M20.5 12H19M12 20.5V19M3.5 12H5" />
        </svg>
      );
    case "denial-control-challenge":
      // Heavy geometric vault padlock
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="10" rx="2" />
          <path d="M8 10.5V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10.5" />
          <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "impact-bondage-sensation":
      // Kinetic diamond + tension arcs
      return (
        <svg {...common}>
          <path d="M12 3L19 12L12 21L5 12L12 3Z" />
          <path d="M9 12H15M12 9V15" />
        </svg>
      );
    case "supporting-modules":
    default:
      // Stacked reference card + signal bars
      return (
        <svg {...common}>
          <rect x="4" y="4" width="14" height="16" rx="2" />
          <path d="M8 9H14M8 13H14M8 17H11.5" />
          <path d="M18 7H20V19C20 20.1 19.1 21 18 21H7" />
        </svg>
      );
  }
}
