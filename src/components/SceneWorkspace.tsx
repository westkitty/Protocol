"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  RotateCcw,
  Share2,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { computeReadinessSummary } from "@/lib/conductor";
import { sceneToMarkdown } from "@/lib/export";
import { createSharePayload, encodeSharePayload } from "@/lib/share";
import { clearSceneDraft, loadSceneDraft, saveSceneDraft } from "@/lib/storage";
import type { ResponseValue, Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { IntensityBadge } from "./IntensityBadge";
import { SceneTimer } from "./SceneTimer";
import { SafetyBanner } from "./SafetyBanner";
import { CategoryEmblem } from "./CategoryEmblem";
import { SafetyZoneDiagram } from "./SafetyZoneDiagram";

function CollapsibleSection({
  title,
  defaultOpen = true,
  badge,
  progressPct,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  progressPct?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="print-card card-elevated rounded-lg border border-[#27272F] bg-[#101014] overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 min-h-[48px] py-3.5 flex items-center justify-between gap-3 text-left bg-[#101014] hover:bg-[#17171C] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ChevronRight
            className={`no-print w-4 h-4 text-[#A6A6B2] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "rotate-90" : ""
            }`}
          />
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-[#F5F5F7]">
            {title}
          </h2>
        </div>
        {badge && <span className="text-xs text-[#A6A6B2] print-muted">{badge}</span>}
      </button>

      {typeof progressPct === "number" && (
        <div className="no-print h-[3px] w-full bg-[#17171C]">
          <div
            className="h-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_var(--accent-glow)]"
            style={{ width: `${progressPct}%`, backgroundColor: "var(--accent)" }}
          />
        </div>
      )}

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-3 border-t border-[#1F1F27]">{children}</div>
        </div>
      </div>
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
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [referenceCardMode, setReferenceCardMode] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [jumpSignal, setJumpSignal] = useState<{ index: number; seq: number } | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Load saved draft on mount
  useEffect(() => {
    const draft = loadSceneDraft(scene.id);
    if (draft) {
      setPartnerAName(draft.partnerAName || "Partner A");
      setPartnerBName(draft.partnerBName || "Partner B");
      setCustomTitle(draft.customTitle || "");
      setResponses(draft.responses || {});
      setCompletedItems(draft.completedItems || {});
      setNotes(draft.notes || {});
      setCustomLimits(draft.customLimits || "");
    }
    setDraftLoaded(true);
  }, [scene.id]);

  // Auto-persist draft to localStorage
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = window.setTimeout(() => {
      saveSceneDraft(scene.id, {
        partnerAName,
        partnerBName,
        customTitle,
        responses,
        completedItems,
        notes,
        customLimits,
        updatedAt: Date.now(),
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [
    draftLoaded,
    scene.id,
    partnerAName,
    partnerBName,
    customTitle,
    responses,
    completedItems,
    notes,
    customLimits,
  ]);

  // Close Export & Print menu on Escape or outside click
  useEffect(() => {
    if (!exportMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExportMenuOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [exportMenuOpen]);

  const catMeta = CATEGORIES.find((c) => c.slug === scene.category_slug);
  const displayTitle = customTitle.trim() || (discreetMode ? scene.discreet_title : scene.title);
  const displayCategory = discreetMode ? catMeta?.discreetName || scene.category : scene.category;
  const isLocked = scene.tier === "pro" && !proUnlocked;

  const totalChecklistItems = useMemo(
    () => scene.negotiation.checklist.reduce((sum, sec) => sum + sec.items.length, 0),
    [scene]
  );
  const ratedCount = useMemo(() => Object.keys(responses).length, [responses]);
  const completedCount = useMemo(
    () => Object.values(completedItems).filter(Boolean).length,
    [completedItems]
  );
  const progressPct =
    totalChecklistItems > 0 ? Math.round((ratedCount / totalChecklistItems) * 100) : 0;

  const readiness = useMemo(
    () => computeReadinessSummary(scene, responses),
    [scene, responses]
  );

  const handleMarkSectionYes = (items: { id: string }[]) => {
    setResponses((prev) => {
      const next = { ...prev };
      for (const item of items) {
        next[item.id] = "yes";
      }
      return next;
    });
    setCompletedItems((prev) => {
      const next = { ...prev };
      for (const item of items) {
        next[item.id] = true;
      }
      return next;
    });
  };

  const hasDraftEdits =
    ratedCount > 0 ||
    completedCount > 0 ||
    Object.values(notes).some((n) => n.trim().length > 0) ||
    customLimits.trim().length > 0 ||
    customTitle.trim().length > 0;

  const handleResetDraft = () => {
    clearSceneDraft(scene.id);
    setPartnerAName("Partner A");
    setPartnerBName("Partner B");
    setCustomTitle("");
    setResponses({});
    setCompletedItems({});
    setNotes({});
    setCustomLimits("");
    setShareUrl(null);
  };

  const handleExportMarkdown = () => {
    setExportMenuOpen(false);
    const md = sceneToMarkdown(scene, {
      partnerAName,
      partnerBName,
      responses,
      completedItems,
      notes,
      journalNotes: customLimits,
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
      {/* Top Breadcrumb & Regrouped Action Bar (<= 3 primary controls) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-xs font-medium text-[#A6A6B2] hover:text-[#F5F5F7]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 glow-rail">
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              aria-expanded={exportMenuOpen}
              aria-haspopup="menu"
              onClick={() => setExportMenuOpen((v) => !v)}
              className="glow-neighbor inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-md text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export &amp; Print</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {exportMenuOpen && (
              <div
                role="menu"
                className="card-elevated absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 rounded-lg border border-[#27272F] bg-[#101014] p-1.5 z-50 space-y-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setReferenceCardMode((v) => !v);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 min-h-[40px] rounded text-xs text-left text-[#F5F5F7] hover:bg-[#17171C]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#F87171]" />
                  <span>{referenceCardMode ? "Full Workspace View" : "1-Page Reference Card"}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2 px-3 min-h-[40px] rounded text-xs text-left text-[#F5F5F7] hover:bg-[#17171C]"
                >
                  <Download className="w-3.5 h-3.5 text-[#F87171]" />
                  <span>Export Markdown (.md)</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setExportMenuOpen(false);
                    window.print();
                  }}
                  className="w-full flex items-center gap-2 px-3 min-h-[40px] rounded text-xs text-left text-[#F5F5F7] hover:bg-[#17171C]"
                >
                  <Printer className="w-3.5 h-3.5 text-[#F87171]" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveToLibrary}
            className="glow-neighbor inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-md text-xs font-medium"
          >
            {savedNotice ? (
              <Check className="w-3.5 h-3.5 text-[#4A7C59]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{savedNotice ? "Saved to Library" : "Save to Library"}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateShareLink}
            className="btn-red inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-md text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share (72h)</span>
          </button>
        </div>
      </div>

      {/* Share Link Box */}
      {shareUrl && (
        <div
          role="status"
          aria-live="polite"
          className="no-print card-elevated rounded-lg border border-[#4A7C59]/70 bg-[#101014] p-4 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#88B897]">
              Partner Share Link Ready (Client-Only URL Fragment • Expires in 72 Hours)
            </span>
            <button
              type="button"
              onClick={() => setShareUrl(null)}
              className="text-xs text-[#A6A6B2] hover:text-[#F5F5F7] min-h-[32px] px-2"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-2 glow-rail">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Shareable partner URL"
              className="flex-1 px-3 min-h-[44px] rounded bg-[#070709] border border-[#27272F] text-xs text-[#F5F5F7] font-mono"
            />
            <button
              type="button"
              onClick={handleCopyShare}
              className="btn-red inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded text-xs font-semibold shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Scene Header */}
      <header className="print-card card-elevated rounded-xl border border-[#27272F] bg-[#101014] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#A6A6B2] print-muted">
          <span className="uppercase tracking-wider">
            {displayCategory} • {scene.subcategory}
          </span>
          <div className="flex items-center gap-2">
            <IntensityBadge intensity={scene.intensity} />
            <span className="capitalize px-2 py-0.5 rounded bg-[#17171C] border border-[#27272F] text-[#F5F5F7]">
              {scene.experience_level}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg border border-[#C41E2E]/45 bg-[#17171C] flex items-center justify-center text-[#F87171] shrink-0 shadow-[0_0_16px_var(--accent-glow-soft)]">
            <CategoryEmblem categorySlug={scene.category_slug} className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#F5F5F7]">
            {displayTitle}
          </h1>
        </div>

        <p className="text-sm text-[#A6A6B2] print-muted leading-relaxed max-w-3xl">
          {scene.body}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#A6A6B2] print-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#F87171]" />
            {scene.duration_min}–{scene.duration_max} min (Prep ~{scene.prep_time_min}m)
          </span>
          <span>Roles: {scene.roles.join(" • ")}</span>
          {hasDraftEdits && (
            <span className="no-print ml-auto inline-flex items-center gap-2 text-[#88B897]">
              <span>Draft saved locally</span>
              <button
                type="button"
                onClick={handleResetDraft}
                className="inline-flex items-center gap-1 text-[#A6A6B2] hover:text-[#F87171] underline"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </span>
          )}
        </div>
      </header>

      {/* Pro Gating Preview Banner */}
      {isLocked ? (
        <div className="card-elevated rounded-xl border border-[#C41E2E]/50 bg-[#101014] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F7]">
                Pro Library Scene
              </h2>
              <p className="text-sm text-[#A6A6B2] leading-relaxed">
                You can preview the overview and risk notes below. Unlock the full library to
                access the complete interactive negotiation checklist, scripts, timed beats,
                variations, and Markdown/PDF exports.
              </p>
              <button
                type="button"
                onClick={() => setProUnlocked(true)}
                className="btn-red inline-flex items-center gap-2 px-4 min-h-[44px] rounded-md text-xs font-semibold"
              >
                Unlock All 49 Scenes (Preview Mode)
              </button>
            </div>
          </div>
          <div className="pt-4 border-t border-[#1F1F27] space-y-2">
            <h3 className="font-heading text-sm uppercase tracking-wider text-[#F87171]">
              Risk Awareness Preview
            </h3>
            <ul className="space-y-1 text-xs text-[#A6A6B2]">
              {scene.risk_notes.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : referenceCardMode ? (
        /* Condensed One-Page Reference Card */
        <div className="print-card card-elevated rounded-xl border border-[#27272F] bg-[#101014] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1F1F27] pb-3">
            <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F7]">
              One-Page In-Scene Reference Card
            </h2>
            <span className="text-xs text-[#A6A6B2] print-muted">
              {partnerAName} &amp; {partnerBName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2">
              <h3 className="font-heading text-sm uppercase text-[#C4A35A]">Materials</h3>
              <ul className="space-y-1 text-[#F5F5F7]">
                {scene.materials.map((m) => (
                  <li key={m}>[ ] {m}</li>
                ))}
              </ul>
              <h3 className="font-heading text-sm uppercase text-[#F87171] pt-2">
                Risk &amp; Limits
              </h3>
              <ul className="space-y-1 text-[#A6A6B2] print-muted">
                {scene.risk_notes.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-sm uppercase text-[#88B897]">Sequence Beats</h3>
              <ol className="space-y-1.5 text-[#F5F5F7]">
                {scene.beats.map((b) => (
                  <li key={b.order}>
                    <strong>
                      {b.order}. {b.title} ({b.duration_min}m):
                    </strong>{" "}
                    <span className="text-[#A6A6B2] print-muted">{b.description}</span>
                  </li>
                ))}
              </ol>
              <h3 className="font-heading text-sm uppercase text-[#C4A35A] pt-2">
                Safewords &amp; Aftercare
              </h3>
              <p className="text-[#A6A6B2] print-muted">
                GREEN (Good) • YELLOW (Slow/Check) • RED / 3 Taps (Stop).
              </p>
              <ul className="space-y-1 text-[#A6A6B2] print-muted">
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
          {/* Sticky Mini-Conductor when timer is actively running */}
          {timerRunning && scene.beats[activeBeatIndex] && (
            <div
              role="status"
              aria-live="polite"
              className="no-print sticky top-[68px] z-30 card-elevated rounded-lg border border-[var(--accent)] bg-[#070709]/95 px-4 py-2.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_var(--accent-glow)]"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <span className="font-semibold text-[#F5F5F7] truncate">
                  Live Beat {activeBeatIndex + 1}/{scene.beats.length}:{" "}
                  {scene.beats[activeBeatIndex].title}
                </span>
              </div>
              <a
                href="#scene-conductor"
                className="glow-neighbor px-3 min-h-[36px] inline-flex items-center rounded text-[11px] font-medium shrink-0"
              >
                Conductor ↑
              </a>
            </div>
          )}

          {/* Timer + Partner Customization */}
          <div id="scene-conductor" className="grid grid-cols-1 lg:grid-cols-2 gap-4 no-print">
            <SceneTimer
              defaultMinutes={scene.duration_min}
              beats={scene.beats}
              jumpSignal={jumpSignal}
              onActiveBeatChange={(idx, isRun) => {
                setActiveBeatIndex(idx);
                setTimerRunning(isRun);
              }}
            />

            <div className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-4 space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-[#A6A6B2] block">
                Customize Partners &amp; Title
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={partnerAName}
                  onChange={(e) => setPartnerAName(e.target.value)}
                  placeholder="Partner A"
                  aria-label="Partner A name"
                  className="px-3 min-h-[42px] rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
                />
                <input
                  type="text"
                  value={partnerBName}
                  onChange={(e) => setPartnerBName(e.target.value)}
                  placeholder="Partner B"
                  aria-label="Partner B name"
                  className="px-3 min-h-[42px] rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
                />
              </div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Optional custom title for Personal Library / PDF"
                aria-label="Custom scene title"
                className="w-full px-3 min-h-[42px] rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
              />
            </div>
          </div>

          {/* Risk Awareness */}
          <CollapsibleSection title="Risk Awareness" badge={`${scene.risk_notes.length} notes`}>
            <div className="space-y-4">
              <ul className="space-y-2 text-sm text-[#F5F5F7]">
                {scene.risk_notes.map((note) => (
                  <li key={note} className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
                    <span className="text-[#D4D4CE] print-muted">{note}</span>
                  </li>
                ))}
              </ul>
              {!discreetMode &&
                (scene.category_slug === "impact-bondage-sensation" ||
                  scene.id === "risk-matrix-quick-reference") && <SafetyZoneDiagram />}
            </div>
          </CollapsibleSection>

          {/* Materials */}
          <CollapsibleSection title="Materials & Prep" badge={`~${scene.prep_time_min}m prep`}>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {scene.materials.map((mat) => (
                <li key={mat} className="flex items-center gap-2 text-[#D4D4CE] print-muted">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                  <span>{mat}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Interactive Negotiation Checklist */}
          <CollapsibleSection
            title="Interactive Negotiation Checklist"
            badge={`${ratedCount}/${totalChecklistItems} rated • ${completedCount} checked`}
            progressPct={progressPct}
          >
            <div className="space-y-6">
              {/* Pre-Flight Readiness Summary Strip */}
              <div className="no-print rounded-md border border-[#27272F] bg-[#070709] p-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[#F5F5F7]">
                    Pre-Flight Readiness:{" "}
                    <span
                      className={
                        readiness.status === "ready"
                          ? "text-[#88B897]"
                          : readiness.status === "has-hard-no"
                            ? "text-[#FCA5A5]"
                            : "text-[#E0C37C]"
                      }
                    >
                      {readiness.status === "ready"
                        ? "All Clear — Ready"
                        : readiness.status === "has-hard-no"
                          ? `${readiness.noCount} Hard Limit(s) Set`
                          : `${readiness.unansweredCount} Unanswered • ${readiness.maybeCount} Maybe`}
                    </span>
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-[#88B897]">{readiness.yesCount} Yes</span>
                    <span className="text-[#E0C37C]">{readiness.maybeCount} Maybe</span>
                    <span className="text-[#FCA5A5]">{readiness.noCount} No</span>
                  </div>
                </div>
                {readiness.hardNoLabels.length > 0 && (
                  <div className="pt-2 border-t border-[#1F1F27] text-[11px] text-[#FCA5A5]">
                    <strong>Off-limits:</strong> {readiness.hardNoLabels.join(" • ")}
                  </div>
                )}
              </div>

              {scene.negotiation.checklist.map((sec) => (
                <div key={sec.section} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-sm uppercase tracking-wider text-[#F87171]">
                      {sec.section}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleMarkSectionYes(sec.items)}
                      className="no-print glow-neighbor px-3 min-h-[44px] sm:min-h-[34px] rounded text-[11px] font-medium text-[#A6A6B2] hover:text-[#F5F5F7]"
                    >
                      Mark Section Yes
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {sec.items.map((item) => {
                      const val = responses[item.id];
                      const done = Boolean(completedItems[item.id]);
                      return (
                        <div
                          key={item.id}
                          className="rounded-md border border-[#27272F] bg-[#17171C]/80 p-3.5 space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <label className="flex items-start gap-3 cursor-pointer text-sm text-[#F5F5F7]">
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={(e) =>
                                  setCompletedItems((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.checked,
                                  }))
                                }
                                style={{ accentColor: "var(--accent)" }}
                                className="mt-0.5 w-4 h-4 shrink-0"
                              />
                              <span className={done ? "line-through text-[#A6A6B2]" : ""}>
                                {item.label}
                              </span>
                            </label>

                            <div className="no-print flex items-center gap-1.5 shrink-0 glow-rail">
                              {(["yes", "maybe", "no"] as ResponseValue[]).map((opt) => {
                                const active = val === opt;
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
                                    onClick={() => {
                                      setResponses((prev) => ({ ...prev, [item.id]: opt }));
                                      setCompletedItems((prev) => ({ ...prev, [item.id]: true }));
                                    }}
                                    className={`min-h-[44px] sm:min-h-[38px] min-w-[56px] px-3 rounded text-xs font-semibold uppercase border ${
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

                          <input
                            type="text"
                            value={notes[item.id] || ""}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            placeholder="Add condition, limit, or note..."
                            aria-label={`Note for ${item.label}`}
                            className="w-full px-3 min-h-[38px] rounded bg-[#101014] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label htmlFor="additional-hard-limits" className="text-xs font-medium text-[#A6A6B2] block">
                  Additional Hard Limits / Notes
                </label>
                <textarea
                  id="additional-hard-limits"
                  rows={2}
                  value={customLimits}
                  onChange={(e) => setCustomLimits(e.target.value)}
                  placeholder="Write any extra hard limits, safeword tweaks, or post-scene notes..."
                  className="w-full px-3 py-2 rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
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
                  className="rounded-md border border-[#27272F] bg-[#17171C]/70 p-3.5 space-y-1"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F87171]">
                    {s.context}
                  </span>
                  <p className="text-sm text-[#F5F5F7] italic">&ldquo;{s.line}&rdquo;</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Pre-Scene & Headspace */}
          <CollapsibleSection title="Pre-Scene & Headspace" defaultOpen={false}>
            <p className="text-sm text-[#F87171] mb-3">
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
              {scene.beats.map((beat, idx) => {
                const isLive = idx === activeBeatIndex && (timerRunning || activeBeatIndex > 0);
                return (
                  <li
                    key={beat.order}
                    className={`rounded-md border p-3.5 space-y-1 transition-all ${
                      isLive
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_18px_var(--accent-glow-soft)]"
                        : "border-[#27272F] bg-[#17171C]/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-base font-bold text-[#F5F5F7]">
                        {beat.order}. {beat.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        {isLive && (
                          <span
                            className="no-print px-2 py-0.5 rounded text-white font-semibold uppercase text-[10px]"
                            style={{ backgroundColor: "var(--accent)" }}
                          >
                            {timerRunning ? "Live Now" : "Selected"}
                          </span>
                        )}
                        {beat.check_in && (
                          <span className="px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[#FCA5A5] border border-[var(--accent)]/50">
                            Check-in
                          </span>
                        )}
                        <span className="text-[#A6A6B2]">{beat.duration_min} min</span>
                        <button
                          type="button"
                          aria-label={`Jump conductor to beat ${beat.order}: ${beat.title}`}
                          onClick={() =>
                            setJumpSignal((prev) => ({ index: idx, seq: (prev?.seq ?? 0) + 1 }))
                          }
                          className="no-print glow-neighbor px-3 min-h-[44px] sm:min-h-[32px] rounded text-[11px] font-medium text-[#A6A6B2] hover:text-[#F5F5F7]"
                        >
                          Jump
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#A6A6B2] print-muted">{beat.description}</p>
                  </li>
                );
              })}
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
                <ul className="space-y-1 text-xs text-[#A6A6B2]">
                  {scene.variations.lighter.adjustments.map((adj) => (
                    <li key={adj}>• {adj}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-[#C41E2E]/60 bg-[#C41E2E]/10 p-4 space-y-2">
                <h3 className="font-heading text-base font-bold text-[#FCA5A5]">
                  Heavier: {scene.variations.heavier.title}
                </h3>
                <p className="text-xs text-[#D4D4CE]">{scene.variations.heavier.summary}</p>
                <ul className="space-y-1 text-xs text-[#A6A6B2]">
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
                <h3 className="font-heading text-sm uppercase text-[#F87171]">Aftercare Plan</h3>
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
                <h3 className="font-heading text-sm uppercase text-[#F87171]">
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
