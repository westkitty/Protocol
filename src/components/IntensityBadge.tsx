import React from "react";
import type { Intensity } from "@/lib/types";
import { IntensityMeter } from "./IntensityMeter";

const INTENSITY_STYLES: Record<Intensity, string> = {
  light: "border-[#4A7C59]/60 bg-[#4A7C59]/15 text-[#88B897]",
  medium: "border-[#C4A35A]/60 bg-[#C4A35A]/15 text-[#E0C37C]",
  heavy: "border-[#C41E2E]/70 bg-[#C41E2E]/20 text-[#FCA5A5]",
  progressive: "border-[#C41E2E]/55 bg-[#C41E2E]/15 text-[#F87171]",
};

export function IntensityBadge({ intensity }: { intensity: Intensity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border ${INTENSITY_STYLES[intensity]}`}
    >
      <IntensityMeter intensity={intensity} />
      <span>{intensity}</span>
    </span>
  );
}
