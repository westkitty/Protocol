"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Printer, Download, AlertCircle, X } from "lucide-react";
import {
  type ComparisonStatus,
  comparePartnerResponses,
  decodeSharePayload,
  isShareExpired,
} from "@/lib/share";
import { sceneToMarkdown } from "@/lib/export";
import type { ResponseValue, Scene, SharePayload } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function CompareClient({ scenes }: { scenes: Scene[] }) {
  const { discreetMode } = useApp();
  const [rawInput, setRawInput] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [partnerBName, setPartnerBName] = useState("Partner B");
  const [partnerBResponses, setPartnerBResponses] = useState<Record<string, ResponseValue>>({});
  const [partnerBNotes, setPartnerBNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | ComparisonStatus>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("share=")) {
      const decoded = decodeSharePayload(window.location.hash);
      if (decoded) {
        setPayload(decoded);
      }
    }
  }, []);

  const handleLoadInput = (e: React.FormEvent) => {
    e.preventDefault();
    const decoded = decodeSharePayload(rawInput);
    if (!decoded) {
      setLoadError(
        "That link or code is incomplete or invalid. Paste the full URL containing #share= from your partner."
      );
      setPayload(null);
      return;
    }
    setLoadError(null);
    setPayload(decoded);
  };

  const scene = useMemo(
    () => (payload ? scenes.find((s) => s.id === payload.sceneId) || null : null),
    [payload, scenes]
  );

  const expired = payload ? isShareExpired(payload) : false;

  const summaryCounts = useMemo(() => {
    if (!scene || !payload) return { yes: 0, conditional: 0, no: 0 };
    let yes = 0;
    let conditional = 0;
    let no = 0;
    for (const sec of scene.negotiation.checklist) {
      for (const item of sec.items) {
        const status = comparePartnerResponses(
          payload.responses[item.id],
          partnerBResponses[item.id]
        );
        if (status === "mutual-yes") yes++;
        else if (status === "hard-no") no++;
        else conditional++;
      }
    }
    return { yes, conditional, no };
  }, [scene, payload, partnerBResponses]);

  const handleExportComparison = () => {
    if (!scene || !payload) return;
    const mergedResponses: Record<string, ResponseValue> = {};
    const mergedNotes: Record<string, string> = {};
    for (const sec of scene.negotiation.checklist) {
      for (const item of sec.items) {
        const status = comparePartnerResponses(
          payload.responses[item.id],
          partnerBResponses[item.id]
        );
        mergedResponses[item.id] =
          status === "mutual-yes" ? "yes" : status === "hard-no" ? "no" : "maybe";
        const aNote = payload.notes[item.id]
          ? `${payload.partnerAName}: ${payload.notes[item.id]}`
          : "";
        const bNote = partnerBNotes[item.id]
          ? `${partnerBName}: ${partnerBNotes[item.id]}`
          : "";
        mergedNotes[item.id] = [aNote, bNote].filter(Boolean).join(" | ");
      }
    }

    const md = sceneToMarkdown(scene, {
      partnerAName: payload.partnerAName,
      partnerBName,
      responses: mergedResponses,
      notes: mergedNotes,
      journalNotes: payload.customLimits
        ? `${payload.partnerAName} limits: ${payload.customLimits}`
        : "",
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scene.id}-agreement.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-heading text-3xl font-bold uppercase text-[#F5F5F7]">
          Partner Negotiation Comparison
        </h1>
        <p className="text-sm text-[#A6A6B2]">
          Paste a 72-hour share link or open one directly to compare responses side-by-side.
          Nothing is sent to or stored on any server.
        </p>
      </header>

      {!payload && (
        <form
          onSubmit={handleLoadInput}
          className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-3"
        >
          <label htmlFor="share-link-input" className="text-xs font-medium text-[#F5F5F7] block">
            Paste Partner Share Link or Code
          </label>
          <div className="flex flex-col sm:flex-row gap-2 glow-rail">
            <input
              id="share-link-input"
              type="text"
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                if (loadError) setLoadError(null);
              }}
              placeholder="https://.../#share=..."
              className="flex-1 px-3 min-h-[44px] rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
            />
            <button
              type="submit"
              className="btn-red px-5 min-h-[44px] rounded text-xs font-semibold shrink-0"
            >
              Load Share Link
            </button>
          </div>
          {loadError && (
            <p role="alert" className="text-xs text-[#FCA5A5]">
              {loadError}
            </p>
          )}
          <p className="text-xs text-[#A6A6B2]">
            Need to start one? Open any scene in the{" "}
            <Link href="/" className="underline text-[#F5F5F7]">
              Library
            </Link>{" "}
            and click <strong>Share (72h)</strong>.
          </p>
        </form>
      )}

      {payload && expired && (
        <div
          role="alert"
          className="card-elevated rounded-lg border border-[#C41E2E] bg-[#C41E2E]/15 p-5 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-[#FCA5A5] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-[#F5F5F7]">
              This Share Link Has Expired (72-Hour Limit)
            </h2>
            <p className="text-xs text-[#D4D4CE]">
              For privacy, partner share links automatically expire after 72 hours. Ask{" "}
              {payload.partnerAName} to generate a fresh link.
            </p>
          </div>
        </div>
      )}

      {payload && !expired && scene && (
        <div className="space-y-5">
          {/* Summary Bar */}
          <div className="print-card card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#A6A6B2]">
                  Comparing: {payload.partnerAName} &amp; {partnerBName}
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#F5F5F7]">
                  {discreetMode ? scene.discreet_title : scene.title}
                </h2>
              </div>

              <div className="no-print flex items-center gap-2 glow-rail">
                <button
                  type="button"
                  onClick={handleExportComparison}
                  className="glow-neighbor inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Agreement .md</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-red inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-3">
              <label className="text-xs text-[#A6A6B2] flex items-center gap-2">
                <span>Your Name:</span>
                <input
                  type="text"
                  value={partnerBName}
                  onChange={(e) => setPartnerBName(e.target.value)}
                  className="px-2.5 min-h-[38px] rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7]"
                />
              </label>
              <span className="inline-flex items-center gap-1 text-xs text-[#A6A6B2] ml-auto">
                <Clock className="w-3.5 h-3.5" />
                Expires {new Date(payload.expiresAt).toLocaleString()}
              </span>
            </div>

            {/* Interactive Summary Filter Tiles */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#1F1F27] text-center glow-rail">
              <button
                type="button"
                aria-pressed={statusFilter === "mutual-yes"}
                onClick={() =>
                  setStatusFilter((f) => (f === "mutual-yes" ? "all" : "mutual-yes"))
                }
                className={`rounded p-3 border transition-all text-center ${
                  statusFilter === "mutual-yes"
                    ? "bg-[#4A7C59]/30 border-[#88B897]"
                    : "glow-neighbor bg-[#4A7C59]/10 border-[#4A7C59]/40"
                }`}
              >
                <div className="font-heading text-2xl font-bold text-[#88B897]">
                  {summaryCounts.yes}
                </div>
                <div className="text-[11px] uppercase text-[#88B897]">Mutual Yes</div>
              </button>

              <button
                type="button"
                aria-pressed={statusFilter === "conditional"}
                onClick={() =>
                  setStatusFilter((f) => (f === "conditional" ? "all" : "conditional"))
                }
                className={`rounded p-3 border transition-all text-center ${
                  statusFilter === "conditional"
                    ? "bg-[#C4A35A]/30 border-[#E0C37C]"
                    : "glow-neighbor bg-[#C4A35A]/10 border-[#C4A35A]/40"
                }`}
              >
                <div className="font-heading text-2xl font-bold text-[#E0C37C]">
                  {summaryCounts.conditional}
                </div>
                <div className="text-[11px] uppercase text-[#E0C37C]">Discuss / Maybe</div>
              </button>

              <button
                type="button"
                aria-pressed={statusFilter === "hard-no"}
                onClick={() =>
                  setStatusFilter((f) => (f === "hard-no" ? "all" : "hard-no"))
                }
                className={`rounded p-3 text-center ${
                  statusFilter === "hard-no"
                    ? "btn-red"
                    : "glow-neighbor bg-[#C41E2E]/10 border-[#C41E2E]/40"
                }`}
              >
                <div
                  className={`font-heading text-2xl font-bold ${
                    statusFilter === "hard-no" ? "text-white" : "text-[#FCA5A5]"
                  }`}
                >
                  {summaryCounts.no}
                </div>
                <div
                  className={`text-[11px] uppercase ${
                    statusFilter === "hard-no" ? "text-white" : "text-[#FCA5A5]"
                  }`}
                >
                  Hard No
                </div>
              </button>
            </div>

            {statusFilter !== "all" && (
              <div className="no-print flex items-center justify-between text-xs pt-1">
                <span className="text-[#A6A6B2]">
                  Filtering by:{" "}
                  <strong className="uppercase text-[#F5F5F7]">{statusFilter}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="inline-flex items-center gap-1 text-[#F87171] hover:underline"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Show All Items</span>
                </button>
              </div>
            )}

            {payload.customLimits && (
              <div className="rounded bg-[#17171C] border border-[#27272F] p-3 text-xs">
                <strong className="text-[#F87171]">
                  {payload.partnerAName}&apos;s Extra Notes:
                </strong>{" "}
                <span className="text-[#F5F5F7]">{payload.customLimits}</span>
              </div>
            )}
          </div>

          {/* Checklist Comparison */}
          <div className="space-y-4">
            {scene.negotiation.checklist.map((sec) => {
              const visibleItems = sec.items.filter((item) => {
                if (statusFilter === "all") return true;
                const status = comparePartnerResponses(
                  payload.responses[item.id],
                  partnerBResponses[item.id]
                );
                return status === statusFilter;
              });

              if (visibleItems.length === 0) return null;

              return (
                <section
                  key={sec.section}
                  className="print-card card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-3"
                >
                  <h3 className="font-heading text-base uppercase tracking-wider text-[#F87171]">
                    {sec.section}
                  </h3>
                  <div className="space-y-2.5">
                    {visibleItems.map((item) => {
                      const aVal = payload.responses[item.id];
                      const bVal = partnerBResponses[item.id];
                      const status = comparePartnerResponses(aVal, bVal);

                      const borderClass =
                        status === "mutual-yes"
                          ? "border-[#4A7C59]/70 bg-[#4A7C59]/10"
                          : status === "hard-no"
                            ? "border-[#C41E2E]/70 bg-[#C41E2E]/10"
                            : "border-[#C4A35A]/45 bg-[#17171C]/80";

                      const statusLabel =
                        status === "mutual-yes"
                          ? "Mutual Yes"
                          : status === "hard-no"
                            ? "Hard No"
                            : "Discuss";

                      return (
                        <div key={item.id} className={`rounded-md border p-3.5 space-y-2.5 ${borderClass}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium text-[#F5F5F7]">{item.label}</div>
                              <div className="text-[11px] text-[#A6A6B2]">
                                {payload.partnerAName}:{" "}
                                <strong className="uppercase text-[#F5F5F7]">
                                  {aVal || "Unanswered"}
                                </strong>
                                {payload.notes[item.id] ? ` — "${payload.notes[item.id]}"` : ""}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#070709]/80 text-[#F5F5F7]">
                                {statusLabel}
                              </span>
                              <div className="no-print flex items-center gap-1.5 glow-rail">
                                {(["yes", "maybe", "no"] as ResponseValue[]).map((opt) => {
                                  const active = bVal === opt;
                                  const activeClass =
                                    opt === "yes"
                                      ? "bg-[#4A7C59] text-white border-[#4A7C59]"
                                      : opt === "maybe"
                                        ? "bg-[#C4A35A] text-[#070709] border-[#C4A35A]"
                                        : "btn-red";
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      aria-pressed={active}
                                      onClick={() =>
                                        setPartnerBResponses((prev) => ({
                                          ...prev,
                                          [item.id]: opt,
                                        }))
                                      }
                                      className={`min-h-[44px] sm:min-h-[38px] min-w-[54px] px-2.5 rounded text-xs font-semibold uppercase border ${
                                        active
                                          ? activeClass
                                          : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={partnerBNotes[item.id] || ""}
                            onChange={(e) =>
                              setPartnerBNotes((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder={`${partnerBName}'s note or condition...`}
                            aria-label={`${partnerBName}'s note for ${item.label}`}
                            className="no-print w-full px-3 min-h-[38px] rounded bg-[#101014] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
