import React from "react";
import type { Intensity } from "@/lib/types";

export function IntensityMeter({ intensity }: { intensity: Intensity }) {
  const config: Record<Intensity, { levels: number[]; activeColor: string }> = {
    light: { levels: [1, 0, 0, 0], activeColor: "#4A7C59" },
    medium: { levels: [1, 1, 0, 0], activeColor: "#C4A35A" },
    heavy: { levels: [1, 1, 1, 1], activeColor: "var(--accent)" },
    progressive: { levels: [1, 1, 1, 1], activeColor: "var(--accent)" },
  };

  const { levels, activeColor } = config[intensity];
  const heights = [6, 9, 12, 14];

  return (
    <span className="inline-flex items-end gap-[2px] h-3.5" aria-hidden="true">
      {levels.map((on, idx) => (
        <span
          key={idx}
          className="w-[3px] rounded-[1px] transition-colors"
          style={{
            height: `${intensity === "progressive" ? heights[idx] : 11}px`,
            backgroundColor: on ? activeColor : "#27272F",
            boxShadow:
              on && (intensity === "heavy" || intensity === "progressive")
                ? "0 0 6px var(--accent-glow)"
                : undefined,
          }}
        />
      ))}
    </span>
  );
}
