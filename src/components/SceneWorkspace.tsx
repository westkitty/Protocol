"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Lock,
  Printer,
  Share2,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { sceneToMarkdown } from "@/lib/export";
import { createSharePayload, encodeSharePayload } from "@/lib/share";
import type { ResponseValue, Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { IntensityBadge } from "./IntensityBadge";
import { SceneTimer } from "./SceneTimer";
import { SafetyBanner } from "./SafetyBanner";

function CollapsibleSection({
  title,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="print-card rounded-lg border border-[#333333] bg-[#1A1A1A] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left bg-[#1A1A1A] hover:bg-[#222222] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="no-print text-[#A0A0A0]">
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-[#F5F5F0]">
            {title}
          </h2>
        </div>
        {badge && (
          <span className="text-xs text-[#A0A0A0] print-muted">{badge}</span>
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-2 border-t border-[#2A2A2A]">{children}</div>}
    </section>
  );
}

export function SceneWorkspace({ scene }: { scene: Scene }) {
  const { discreetMode, proUnlocked, setProUnlocked, upsertSavedScene } = useApp();

  const [partnerAName, setPartnerAName] = useState("Partner A");
  const [partnerBName, setPartnerBName] = useState("Partner B");
  const [customTitle, setCustomTitle] = useState("");
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [customLimits, setCustomLimits] = useState("");
  const [referenceCardMode, setReferenceCardMode] = useState(false);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const catMeta = CATEGORIES.find((c) => c.slug === scene.category_slug);
  const displayTitle = customTitle.trim() || (discreetMode ? scene.discreet_title : scene.title);
  const displayCategory = discreetMode ? catMeta?.discreetName || scene.category : scene.category;
  const isLocked = scene.tier === "pro" && !proUnlocked;

  const totalChecklistItems = useMemo(
    () => scene.negotiation.checklist.reduce((sum, sec) => sum + sec.items.length, 0),
    [scene]
  );
  const completedCount = useMemo(
    () => Object.values(completedItems).filter(Boolean).length,
    [completedItems]
  );

  const handleExportMarkdown = () => {
    const md = sceneToMarkdown(scene, {
      partnerAName,
      partnerBName,
      responses,
      completedItems,
      notes,
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scene.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToLibrary = () => {
    upsertSavedScene({
      id: `${scene.id}-${Date.now()}`,
      sceneId: scene.id,
      customTitle: displayTitle,
      partnerAName,
      partnerBName,
      responses,
      completedItems,
      notes,
      journalNotes: customLimits,
      updatedAt: Date.now(),
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleGenerateShareLink = () => {
    const payload = createSharePayload({
      sceneId: scene.id,
      partnerAName,
      responses,
      notes,
      customLimits,
    });
    const encoded = encodeSharePayload(payload);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/compare/#share=${encoded}`;
    setShareUrl(url);
    setCopied(false);
  };

  const handleCopyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback handled via visible input
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A0A0A0] hover:text-[#F5F5F0]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReferenceCardMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
              referenceCardMode
                ? "border-[#C4A35A] bg-[#C4A35A]/15 text-[#E0C37C]"
                : "border-[#333333] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F5F5F0]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{referenceCardMode ? "Full Workspace" : "1-Page Card"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToLibrary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-[#333333] bg-[#1A1A1A] hover:bg-[#242424] text-[#F5F5F0]"
          >
            {savedNotice ? (
              <Check className="w-3.5 h-3.5 text-[#4A7C59]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{savedNotice ? "Saved!" : "Save to Library"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-[#333333] bg-[#1A1A1A] hover:bg-[#242424] text-[#F5F5F0]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-[#333333] bg-[#1A1A1A] hover:bg-[#242424] text-[#F5F5F0]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-[#F5F5F0]"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share (72h)</span>
          </button>
        </div>
      </div>

      {/* Share Link Box */}
      {shareUrl && (
        <div className="no-print rounded-lg border border-[#4A7C59]/70 bg-[#4A7C59]/10 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#88B897]">
              Partner Share Link Ready (Client-Only URL Fragment • Expires in 72 Hours)
            </span>
            <button
              type="button"
              onClick={() => setShareUrl(null)}
              className="text-xs text-[#A0A0A0] hover:text-[#F5F5F0]"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Shareable partner URL"
              className="flex-1 px-3 py-2 rounded bg-[#0F0F0F] border border-[#333333] text-xs text-[#F5F5F0] font-mono"
            />
            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#242424] border border-[#3E3E3E] text-xs font-medium text-[#F5F5F0]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Scene Header */}
      <header className="print-card rounded-xl border border-[#333333] bg-[#1A1A1A] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#A0A0A0] print-muted">
          <span className="uppercase tracking-wider">{displayCategory} • {scene.subcategory}</span>
          <div className="flex items-center gap-2">
            <IntensityBadge intensity={scene.intensity} />
            <span className="capitalize px-2 py-0.5 rounded bg-[#242424] border border-[#333333] text-[#F5F5F0]">
              {scene.experience_level}
            </span>
          </div>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#F5F5F0]">
          {displayTitle}
        </h1>

        <p className="text-sm text-[#A0A0A0] print-muted leading-relaxed">{scene.body}</p>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#A0A0A0] print-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C4A35A]" />
            {scene.duration_min}–{scene.duration_max} min (Prep ~{scene.prep_time_min}m)
          </span>
          <span>Roles: {scene.roles.join(" • ")}</span>
        </div>
      </header>

      {/* Pro Gating Preview Banner */}
      {isLocked ? (
        <div className="rounded-xl border border-[#C4A35A]/60 bg-[#1A1A1A] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#C4A35A] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F0]">
                Pro Library Scene
              </h2>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                You can preview the overview and risk notes below. Unlock the full library to
                access the complete interactive negotiation checklist, scripts, timed beats,
                variations, and Markdown/PDF exports.
              </p>
              <button
                type="button"
                onClick={() => setProUnlocked(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold text-[#F5F5F0]"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Unlock All 49 Scenes (Preview Mode)
              </button>
            </div>
          </div>
          <div className="pt-4 border-t border-[#2A2A2A] space-y-2">
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#E0C37C]">
              Risk Awareness Preview
            </h3>
            <ul className="space-y-1 text-xs text-[#A0A0A0]">
              {scene.risk_notes.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : referenceCardMode ? (
        /* Condensed One-Page Reference Card */
        <div className="print-card rounded-xl border border-[#333333] bg-[#1A1A1A] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F0]">
              One-Page In-Scene Reference Card
            </h2>
            <span className="text-xs text-[#A0A0A0] print-muted">
              {partnerAName} &amp; {partnerBName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2">
              <h3 className="font-heading text-sm uppercase text-[#C4A35A]">Materials</h3>
              <ul className="space-y-1 text-[#F5F5F0]">
                {scene.materials.map((m) => (
                  <li key={m}>[ ] {m}</li>
                ))}
              </ul>
              <h3 className="font-heading text-sm uppercase text-[#D98282] pt-2">
                Risk &amp; Limits
              </h3>
              <ul className="space-y-1 text-[#A0A0A0] print-muted">
                {scene.risk_notes.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-sm uppercase text-[#88B897]">Sequence Beats</h3>
              <ol className="space-y-1.5 text-[#F5F5F0]">
                {scene.beats.map((b) => (
                  <li key={b.order}>
                    <strong>
                      {b.order}. {b.title} ({b.duration_min}m):
                    </strong>{" "}
                    <span className="text-[#A0A0A0] print-muted">{b.description}</span>
                  </li>
                ))}
              </ol>
              <h3 className="font-heading text-sm uppercase text-[#C4A35A] pt-2">
                Safewords &amp; Aftercare
              </h3>
              <p className="text-[#A0A0A0] print-muted">
                GREEN (Good) • YELLOW (Slow/Check) • RED / 3 Taps (Stop).
              </p>
              <ul className="space-y-1 text-[#A0A0A0] print-muted">
                {scene.aftercare.immediate.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
          </div>
          <SafetyBanner compact />
        </div>
      ) : (
        /* Full Interactive Workspace */
        <div className="space-y-5">
          {/* Timer + Partner Customization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 no-print">
            <SceneTimer defaultMinutes={scene.duration_min} />

            <div className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-4 space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-[#A0A0A0] block">
                Customize Partners &amp; Title
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={partnerAName}
                  onChange={(e) => setPartnerAName(e.target.value)}
                  placeholder="Partner A"
                  aria-label="Partner A name"
                  className="px-3 py-2 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
                />
                <input
                  type="text"
                  value={partnerBName}
                  onChange={(e) => setPartnerBName(e.target.value)}
                  placeholder="Partner B"
                  aria-label="Partner B name"
                  className="px-3 py-2 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
                />
              </div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Optional custom title for Personal Library / PDF"
                aria-label="Custom scene title"
                className="w-full px-3 py-2 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
              />
            </div>
          </div>

          {/* Risk Awareness */}
          <CollapsibleSection title="Risk Awareness" badge={`${scene.risk_notes.length} notes`}>
            <ul className="space-y-2 text-sm text-[#F5F5F0]">
              {scene.risk_notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#C4A35A] shrink-0 mt-0.5" />
                  <span className="text-[#D4D4CE] print-muted">{note}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Materials */}
          <CollapsibleSection title="Materials & Prep" badge={`~${scene.prep_time_min}m prep`}>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {scene.materials.map((mat) => (
                <li key={mat} className="flex items-center gap-2 text-[#D4D4CE] print-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B4513]" />
                  <span>{mat}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Interactive Negotiation Checklist */}
          <CollapsibleSection
            title="Interactive Negotiation Checklist"
            badge={`${completedCount} / ${totalChecklistItems} checked`}
          >
            <div className="space-y-6">
              {scene.negotiation.checklist.map((sec) => (
                <div key={sec.section} className="space-y-3">
                  <h3 className="font-heading text-sm uppercase tracking-wider text-[#C4A35A]">
                    {sec.section}
                  </h3>
                  <div className="space-y-2.5">
                    {sec.items.map((item) => {
                      const val = responses[item.id];
                      const done = Boolean(completedItems[item.id]);
                      return (
                        <div
                          key={item.id}
                          className="rounded-md border border-[#2D2D2D] bg-[#242424]/70 p-3 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="flex items-start gap-2.5 cursor-pointer text-sm text-[#F5F5F0]">
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={(e) =>
                                  setCompletedItems((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.checked,
                                  }))
                                }
                                className="mt-1 accent-[#8B4513] w-4 h-4"
                              />
                              <span className={done ? "line-through text-[#A0A0A0]" : ""}>
                                {item.label}
                              </span>
                            </label>

                            <div className="no-print flex items-center gap-1 shrink-0">
                              {(["yes", "maybe", "no"] as ResponseValue[]).map((opt) => {
                                const active = val === opt;
                                const activeStyle =
                                  opt === "yes"
                                    ? "bg-[#4A7C59] text-white border-[#4A7C59]"
                                    : opt === "maybe"
                                      ? "bg-[#C4A35A] text-[#0F0F0F] border-[#C4A35A]"
                                      : "bg-[#8B3A3A] text-white border-[#8B3A3A]";
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                      setResponses((prev) => ({ ...prev, [item.id]: opt }))
                                    }
                                    className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase border transition-colors ${
                                      active
                                        ? activeStyle
                                        : "bg-[#1A1A1A] text-[#A0A0A0] border-[#333333] hover:text-[#F5F5F0]"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <input
                            type="text"
                            value={notes[item.id] || ""}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            placeholder="Add condition, limit, or note..."
                            aria-label={`Note for ${item.label}`}
                            className="w-full px-2.5 py-1.5 rounded bg-[#1A1A1A] border border-[#333333] text-xs text-[#F5F5F0] placeholder:text-[#666666]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A0A0A0] block">
                  Additional Hard Limits / Notes
                </label>
                <textarea
                  rows={2}
                  value={customLimits}
                  onChange={(e) => setCustomLimits(e.target.value)}
                  placeholder="Write any extra hard limits, safeword tweaks, or post-scene notes..."
                  className="w-full px-3 py-2 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Scripts */}
          <CollapsibleSection title="Adaptable Scripts" defaultOpen={false}>
            <div className="space-y-3">
              {scene.negotiation.scripts.map((s) => (
                <div
                  key={s.context}
                  className="rounded-md border border-[#2D2D2D] bg-[#242424]/60 p-3 space-y-1"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C4A35A]">
                    {s.context}
                  </span>
                  <p className="text-sm text-[#F5F5F0] italic">&ldquo;{s.line}&rdquo;</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Pre-Scene & Headspace */}
          <CollapsibleSection title="Pre-Scene & Headspace" defaultOpen={false}>
            <p className="text-sm text-[#E0C37C] mb-3">
              <strong>Headspace:</strong> {scene.pre_scene.headspace}
            </p>
            <ul className="space-y-1.5 text-sm text-[#D4D4CE] print-muted">
              {scene.pre_scene.steps.map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Sequential Beats */}
          <CollapsibleSection title="Scene Beats" badge={`${scene.beats.length} beats`}>
            <ol className="space-y-3">
              {scene.beats.map((beat) => (
                <li
                  key={beat.order}
                  className="rounded-md border border-[#2D2D2D] bg-[#242424]/60 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-base font-bold text-[#F5F5F0]">
                      {beat.order}. {beat.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      {beat.check_in && (
                        <span className="px-2 py-0.5 rounded bg-[#C4A35A]/20 text-[#E0C37C] border border-[#C4A35A]/40">
                          Check-in
                        </span>
                      )}
                      <span className="text-[#A0A0A0]">{beat.duration_min} min</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#A0A0A0] print-muted">{beat.description}</p>
                </li>
              ))}
            </ol>
          </CollapsibleSection>

          {/* Variations */}
          <CollapsibleSection title="Lighter & Heavier Variations" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border border-[#4A7C59]/50 bg-[#4A7C59]/10 p-4 space-y-2">
                <h3 className="font-heading text-base font-bold text-[#88B897]">
                  Lighter: {scene.variations.lighter.title}
                </h3>
                <p className="text-xs text-[#D4D4CE]">{scene.variations.lighter.summary}</p>
                <ul className="space-y-1 text-xs text-[#A0A0A0]">
                  {scene.variations.lighter.adjustments.map((adj) => (
                    <li key={adj}>• {adj}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-[#8B3A3A]/60 bg-[#8B3A3A]/10 p-4 space-y-2">
                <h3 className="font-heading text-base font-bold text-[#D98282]">
                  Heavier: {scene.variations.heavier.title}
                </h3>
                <p className="text-xs text-[#D4D4CE]">{scene.variations.heavier.summary}</p>
                <ul className="space-y-1 text-xs text-[#A0A0A0]">
                  {scene.variations.heavier.adjustments.map((adj) => (
                    <li key={adj}>• {adj}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Aftercare & Debrief */}
          <CollapsibleSection title="Aftercare & Debrief" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-heading text-sm uppercase text-[#C4A35A]">Aftercare Plan</h3>
                <ul className="space-y-1 text-xs text-[#D4D4CE]">
                  {scene.aftercare.immediate.map((x) => (
                    <li key={x}>
                      <strong>Immediate:</strong> {x}
                    </li>
                  ))}
                  {scene.aftercare.physical.map((x) => (
                    <li key={x}>
                      <strong>Physical:</strong> {x}
                    </li>
                  ))}
                  {scene.aftercare.emotional.map((x) => (
                    <li key={x}>
                      <strong>Emotional:</strong> {x}
                    </li>
                  ))}
                  {scene.aftercare.next_day.map((x) => (
                    <li key={x}>
                      <strong>Next Day:</strong> {x}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-sm uppercase text-[#C4A35A]">
                  Debrief ({scene.debrief.check_in_window})
                </h3>
                <ul className="space-y-1 text-xs text-[#D4D4CE]">
                  {scene.debrief.prompts.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
