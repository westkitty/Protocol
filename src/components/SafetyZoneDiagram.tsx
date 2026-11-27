import React from "react";

export function SafetyZoneDiagram() {
  return (
    <div className="print-card rounded-lg border border-[#27272F] bg-[#070709] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading text-xs uppercase tracking-wider text-[#F5F5F7]">
          Anatomical Impact &amp; Restraint Zone Reference (Posterior View)
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-[#88B897]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#4A7C59]" />
            Safe Muscular Zones
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#FCA5A5]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C41E2E]" />
            Avoid / High-Risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <svg
          viewBox="0 0 260 220"
          className="w-full max-w-[240px] mx-auto"
          role="img"
          aria-label="Anatomical posterior body diagram showing green safe muscular zones on upper back, buttocks, and thighs, and red avoid zones on neck, spine, kidneys, and knees"
        >
          {/* Silhouette outline */}
          <circle cx="130" cy="24" r="14" fill="#17171C" stroke="#3A3A46" strokeWidth="1.5" />
          <path
            d="M114 42L90 50L78 104L90 107L100 68L102 122L92 204H110L125 142H135L150 204H168L158 122L160 68L170 107L182 104L170 50L146 42H114Z"
            fill="#17171C"
            stroke="#3A3A46"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Safe Muscular Zones (Green) */}
          {/* Upper back / shoulders */}
          <path
            d="M100 50H160L155 78H105L100 50Z"
            fill="#4A7C59"
            fillOpacity="0.42"
            stroke="#4A7C59"
            strokeWidth="1.2"
          />
          {/* Buttocks */}
          <rect
            x="101"
            y="114"
            width="26"
            height="24"
            rx="8"
            fill="#4A7C59"
            fillOpacity="0.45"
            stroke="#4A7C59"
            strokeWidth="1.2"
          />
          <rect
            x="133"
            y="114"
            width="26"
            height="24"
            rx="8"
            fill="#4A7C59"
            fillOpacity="0.45"
            stroke="#4A7C59"
            strokeWidth="1.2"
          />
          {/* Meaty thighs */}
          <rect
            x="98"
            y="143"
            width="20"
            height="26"
            rx="6"
            fill="#4A7C59"
            fillOpacity="0.38"
            stroke="#4A7C59"
            strokeWidth="1.2"
          />
          <rect
            x="142"
            y="143"
            width="20"
            height="26"
            rx="6"
            fill="#4A7C59"
            fillOpacity="0.38"
            stroke="#4A7C59"
            strokeWidth="1.2"
          />

          {/* Caution / Avoid Zones (Crimson) */}
          {/* Neck / airway */}
          <rect
            x="122"
            y="36"
            width="16"
            height="10"
            rx="3"
            fill="#C41E2E"
            fillOpacity="0.65"
            stroke="#F87171"
            strokeWidth="1"
          />
          {/* Spine line */}
          <line
            x1="130"
            y1="48"
            x2="130"
            y2="114"
            stroke="#F87171"
            strokeWidth="3"
            strokeDasharray="4 3"
          />
          {/* Kidneys (lower back) */}
          <ellipse
            cx="113"
            cy="96"
            rx="9"
            ry="11"
            fill="#C41E2E"
            fillOpacity="0.55"
            stroke="#F87171"
            strokeWidth="1"
          />
          <ellipse
            cx="147"
            cy="96"
            rx="9"
            ry="11"
            fill="#C41E2E"
            fillOpacity="0.55"
            stroke="#F87171"
            strokeWidth="1"
          />
          {/* Knees / joints */}
          <circle cx="104" cy="176" r="5" fill="#C41E2E" fillOpacity="0.6" stroke="#F87171" strokeWidth="1" />
          <circle cx="156" cy="176" r="5" fill="#C41E2E" fillOpacity="0.6" stroke="#F87171" strokeWidth="1" />
        </svg>

        <div className="space-y-2 text-xs">
          <div className="rounded border border-[#4A7C59]/45 bg-[#4A7C59]/10 p-2.5">
            <strong className="text-[#88B897] block">Target (Green):</strong>
            <span className="text-[#D4D4CE] print-muted">
              Upper back/shoulders, buttocks, and meaty outer/back thighs.
            </span>
          </div>
          <div className="rounded border border-[#C41E2E]/50 bg-[#C41E2E]/10 p-2.5">
            <strong className="text-[#FCA5A5] block">Avoid (Red):</strong>
            <span className="text-[#D4D4CE] print-muted">
              Neck/airway, spine, kidneys (lower back below ribs), tailbone, and joints.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
