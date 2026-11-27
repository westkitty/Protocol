import React from "react";
import { ShieldAlert } from "lucide-react";
import { MANDATORY_DISCLAIMERS } from "@/lib/constants";

export function SafetyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Safety and Consent Framing"
      className={`print-card card-elevated rounded-lg border border-[#27272F] bg-[#101014] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h3 className="font-heading text-sm uppercase tracking-wider text-[#F5F5F7]">
            Safety, Consent &amp; Legal Framing
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#A6A6B2] print-muted">
            {MANDATORY_DISCLAIMERS.map((line) => (
              <li key={line} className="leading-relaxed">
                • {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
