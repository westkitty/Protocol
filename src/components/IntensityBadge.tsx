import React from "react";
import type { Intensity } from "@/lib/types";

const INTENSITY_STYLES: Record<Intensity, string> = {
  light: "border-[#4A7C59]/60 bg-[#4A7C59]/15 text-[#88B897]",
  medium: "border-[#C4A35A]/60 bg-[#C4A35A]/15 text-[#E0C37C]",
  heavy: "border-[#8B3A3A]/70 bg-[#8B3A3A]/20 text-[#D98282]",
  progressive: "border-[#8B4513]/70 bg-[#8B4513]/20 text-[#E09B6B]",
};

export function IntensityBadge({ intensity }: { intensity: Intensity }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border ${INTENSITY_STYLES[intensity]}`}
    >
      {intensity}
    </span>
  );
}
