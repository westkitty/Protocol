"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GitCompare, Clock, Printer, Download, AlertCircle } from "lucide-react";
import { comparePartnerResponses, decodeSharePayload, isShareExpired } from "@/lib/share";
import { sceneToMarkdown } from "@/lib/export";
import type { ResponseValue, Scene, SharePayload } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function CompareClient({ scenes }: { scenes: Scene[] }) {
  const { discreetMode } = useApp();
  const [rawInput, setRawInput] = useState("");
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [partnerBName, setPartnerBName] = useState("Partner B");
  const [partnerBResponses, setPartnerBResponses] = useState<Record<string, ResponseValue>>({});
  const [partnerBNotes, setPartnerBNotes] = useState<Record<string, string>>({});

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
        const aNote = payload.notes[item.id] ? `${payload.partnerAName}: ${payload.notes[item.id]}` : "";
        const bNote = partnerBNotes[item.id] ? `${partnerBName}: ${partnerBNotes[item.id]}` : "";
        mergedNotes[item.id] = [aNote, bNote].filter(Boolean).join(" | ");
      }
    }

    const md = sceneToMarkdown(scene, {
      partnerAName: payload.partnerAName,
      partnerBName,
      responses: mergedResponses,
      notes: mergedNotes,
      journalNotes: payload.customLimits ? `${payload.partnerAName} limits: ${payload.customLimits}` : "",
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
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C4A35A]">
          <GitCompare className="w-4 h-4" />
          <span>Client-Only Partner Comparison</span>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase text-[#F5F5F0]">
          Partner Negotiation Comparison
        </h1>
        <p className="text-sm text-[#A0A0A0]">
          Paste a 72-hour share link or open one directly to compare responses side-by-side.
          Nothing is sent to or stored on any server.
        </p>
      </header>

      {!payload && (
        <form
          onSubmit={handleLoadInput}
          className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-3"
        >
          <label className="text-xs font-medium text-[#F5F5F0] block">
            Paste Partner Share Link or Code
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="https://.../#share=..."
              className="flex-1 px-3 py-2.5 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded text-xs font-semibold text-[#F5F5F0]"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Load Share Link
            </button>
          </div>
          <p className="text-xs text-[#A0A0A0]">
            Need to start one? Open any scene in the{" "}
            <Link href="/" className="underline text-[#F5F5F0]">
              Library
            </Link>{" "}
            and click <strong>Share (72h)</strong>.
          </p>
        </form>
      )}

      {payload && expired && (
        <div className="rounded-lg border border-[#8B3A3A] bg-[#8B3A3A]/15 p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#D98282] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-[#F5F5F0]">
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
          <div className="print-card rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#A0A0A0]">
                  Comparing: {payload.partnerAName} &amp; {partnerBName}
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#F5F5F0]">
                  {discreetMode ? scene.discreet_title : scene.title}
                </h2>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportComparison}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border border-[#333333] bg-[#242424] text-[#F5F5F0]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Agreement .md</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border border-[#333333] bg-[#242424] text-[#F5F5F0]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-3">
              <label className="text-xs text-[#A0A0A0] flex items-center gap-2">
                <span>Your Name:</span>
                <input
                  type="text"
                  value={partnerBName}
                  onChange={(e) => setPartnerBName(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
                />
              </label>
              <span className="inline-flex items-center gap-1 text-xs text-[#A0A0A0] ml-auto">
                <Clock className="w-3.5 h-3.5" />
                Expires {new Date(payload.expiresAt).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#2A2A2A] text-center">
              <div className="rounded p-2.5 bg-[#4A7C59]/15 border border-[#4A7C59]/50">
                <div className="font-heading text-2xl font-bold text-[#88B897]">
                  {summaryCounts.yes}
                </div>
                <div className="text-[11px] uppercase text-[#88B897]">Mutual Yes</div>
              </div>
              <div className="rounded p-2.5 bg-[#C4A35A]/15 border border-[#C4A35A]/50">
                <div className="font-heading text-2xl font-bold text-[#E0C37C]">
                  {summaryCounts.conditional}
                </div>
                <div className="text-[11px] uppercase text-[#E0C37C]">Discuss / Maybe</div>
              </div>
              <div className="rounded p-2.5 bg-[#8B3A3A]/20 border border-[#8B3A3A]/60">
                <div className="font-heading text-2xl font-bold text-[#D98282]">
                  {summaryCounts.no}
                </div>
                <div className="text-[11px] uppercase text-[#D98282]">Hard No</div>
              </div>
            </div>

            {payload.customLimits && (
              <div className="rounded bg-[#242424] border border-[#333333] p-3 text-xs">
                <strong className="text-[#C4A35A]">{payload.partnerAName}&apos;s Extra Notes:</strong>{" "}
                <span className="text-[#F5F5F0]">{payload.customLimits}</span>
              </div>
            )}
          </div>

          {/* Checklist Comparison */}
          <div className="space-y-4">
            {scene.negotiation.checklist.map((sec) => (
              <section
                key={sec.section}
                className="print-card rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-3"
              >
                <h3 className="font-heading text-base uppercase tracking-wider text-[#C4A35A]">
                  {sec.section}
                </h3>
                <div className="space-y-2.5">
                  {sec.items.map((item) => {
                    const aVal = payload.responses[item.id];
                    const bVal = partnerBResponses[item.id];
                    const status = comparePartnerResponses(aVal, bVal);

                    const borderClass =
                      status === "mutual-yes"
                        ? "border-[#4A7C59]/70 bg-[#4A7C59]/10"
                        : status === "hard-no"
                          ? "border-[#8B3A3A]/80 bg-[#8B3A3A]/15"
                          : "border-[#C4A35A]/50 bg-[#242424]/70";

                    const statusLabel =
                      status === "mutual-yes"
                        ? "Mutual Yes"
                        : status === "hard-no"
                          ? "Hard No"
                          : "Discuss";

                    return (
                      <div key={item.id} className={`rounded-md border p-3 space-y-2 ${borderClass}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium text-[#F5F5F0]">{item.label}</div>
                            <div className="text-[11px] text-[#A0A0A0]">
                              {payload.partnerAName}:{" "}
                              <strong className="uppercase text-[#F5F5F0]">
                                {aVal || "Unanswered"}
                              </strong>
                              {payload.notes[item.id] ? ` — "${payload.notes[item.id]}"` : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#0F0F0F]/60 text-[#F5F5F0]">
                              {statusLabel}
                            </span>
                            <div className="no-print flex items-center gap-1">
                              {(["yes", "maybe", "no"] as ResponseValue[]).map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setPartnerBResponses((prev) => ({ ...prev, [item.id]: opt }))
                                  }
                                  className={`px-2 py-1 rounded text-[11px] font-semibold uppercase border ${
                                    bVal === opt
                                      ? opt === "yes"
                                        ? "bg-[#4A7C59] text-white border-[#4A7C59]"
                                        : opt === "maybe"
                                          ? "bg-[#C4A35A] text-[#0F0F0F] border-[#C4A35A]"
                                          : "bg-[#8B3A3A] text-white border-[#8B3A3A]"
                                      : "bg-[#1A1A1A] text-[#A0A0A0] border-[#333333]"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={partnerBNotes[item.id] || ""}
                          onChange={(e) =>
                            setPartnerBNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder={`${partnerBName}'s note or condition...`}
                          className="no-print w-full px-2.5 py-1.5 rounded bg-[#1A1A1A] border border-[#333333] text-xs text-[#F5F5F0]"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
