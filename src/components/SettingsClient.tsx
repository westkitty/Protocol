"use client";

import React, { useState } from "react";
import { Shield, Download, Trash2, Check, Lock } from "lucide-react";
import { buildOfflineLibraryMarkdown } from "@/lib/export";
import { validateImportedBackup } from "@/lib/storage";
import type { ResourceDocument, Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function SettingsClient({
  scenes,
  resources = [],
}: {
  scenes: Scene[];
  resources?: ResourceDocument[];
}) {
  const {
    discreetMode,
    setDiscreetMode,
    accentTheme,
    setAccentTheme,
    proUnlocked,
    setProUnlocked,
    savedScenes,
    importSavedScenes,
    wipeAll,
  } = useApp();

  const [wipedNotice, setWipedNotice] = useState(false);
  const [confirmingWipe, setConfirmingWipe] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleDownloadOfflineLibrary = () => {
    const bundle = buildOfflineLibraryMarkdown(scenes, resources);
    const blob = new Blob([bundle], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protocol-offline-scene-library.md";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportJsonBackup = () => {
    const blob = new Blob([JSON.stringify(savedScenes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protocol-personal-library-backup.json";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportJsonBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const check = validateImportedBackup(parsed);
      if (!check.ok) {
        setImportError(check.error);
        return;
      }
      importSavedScenes(check.data);
      setImportSuccess(`Restored ${check.data.length} saved scene(s) from backup.`);
    } catch {
      setImportError(
        "Could not parse JSON syntax. Select a valid protocol-personal-library-backup.json export."
      );
    } finally {
      input.value = "";
    }
  };

  const handleConfirmWipe = () => {
    wipeAll();
    setConfirmingWipe(false);
    setWipedNotice(true);
    window.setTimeout(() => setWipedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="space-y-1.5">
        <h1 className="font-heading text-3xl font-bold uppercase text-[#F5F5F7]">
          Settings &amp; Local-First Export
        </h1>
        <p className="text-sm text-[#A6A6B2]">
          Configure discreet display, red accent glow, and offline Obsidian-compatible exports.
        </p>
      </header>

      {/* Privacy Guarantee */}
      <section className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#88B897]">
          <Shield className="w-4 h-4" />
          <span>Privacy-First Architecture</span>
        </div>
        <p className="text-xs text-[#A6A6B2] leading-relaxed">
          Protocol stores zero user-filled negotiation data on any server. Partner share links
          encode responses directly into the URL hash fragment (<code>#share=...</code>) and
          automatically expire after 72 hours. Personal Library notes and drafts stay exclusively
          in your browser&apos;s localStorage.
        </p>
      </section>

      {/* Appearance & Mode */}
      <section className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold uppercase text-[#F5F5F7]">
          Display &amp; Access
        </h2>

        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F27]">
          <div>
            <div className="text-sm font-medium text-[#F5F5F7]">Discreet Mode</div>
            <div className="text-xs text-[#A6A6B2]">
              Neutralizes scene titles, categories, and browser tab to &ldquo;Field Notes&rdquo;.
            </div>
          </div>
          <button
            type="button"
            aria-pressed={discreetMode}
            onClick={() => setDiscreetMode(!discreetMode)}
            className={`px-4 min-h-[44px] rounded text-xs font-semibold ${
              discreetMode ? "btn-red" : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
            }`}
          >
            {discreetMode ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F27]">
          <div>
            <div className="text-sm font-medium text-[#F5F5F7]">Red Glow Accent</div>
            <div className="text-xs text-[#A6A6B2]">
              Switch between Crimson Red (#C41E2E) and Deep Burgundy (#8B1A2B).
            </div>
          </div>
          <div className="flex items-center gap-2 glow-rail">
            <button
              type="button"
              aria-pressed={accentTheme === "crimson"}
              onClick={() => setAccentTheme("crimson")}
              className={`px-3.5 min-h-[44px] rounded text-xs font-semibold ${
                accentTheme === "crimson"
                  ? "btn-red"
                  : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
              }`}
            >
              Crimson
            </button>
            <button
              type="button"
              aria-pressed={accentTheme === "burgundy"}
              onClick={() => setAccentTheme("burgundy")}
              className={`px-3.5 min-h-[44px] rounded text-xs font-semibold ${
                accentTheme === "burgundy"
                  ? "btn-red"
                  : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
              }`}
            >
              Burgundy
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <div className="text-sm font-medium text-[#F5F5F7]">
              Full Library Access ({scenes.length} Scenes)
            </div>
            <div className="text-xs text-[#A6A6B2]">
              Toggle Pro Library unlock preview (free tier includes 8 core starter scenes).
            </div>
          </div>
          <button
            type="button"
            aria-pressed={proUnlocked}
            onClick={() => setProUnlocked(!proUnlocked)}
            className={`inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded text-xs font-semibold ${
              proUnlocked ? "btn-red" : "glow-neighbor text-[#F5F5F7]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{proUnlocked ? "All Unlocked" : "Unlock All"}</span>
          </button>
        </div>
      </section>

      {/* Offline Exports */}
      <section className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold uppercase text-[#F5F5F7]">
          Offline &amp; Obsidian Exports
        </h2>
        <p className="text-xs text-[#A6A6B2]">
          Download the entire {scenes.length}-scene library as plain Markdown with YAML frontmatter
          for offline use or import into Obsidian.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 glow-rail">
          <button
            type="button"
            onClick={handleDownloadOfflineLibrary}
            className="btn-red inline-flex items-center gap-2 px-4 min-h-[44px] rounded text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Library (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJsonBackup}
            className="glow-neighbor inline-flex items-center gap-2 px-4 min-h-[44px] rounded text-xs font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Backup Personal Library (.json)</span>
          </button>

          <label className="glow-neighbor inline-flex items-center gap-2 px-4 min-h-[44px] rounded text-xs font-medium cursor-pointer">
            <span>Restore Backup (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJsonBackup}
              className="sr-only"
            />
          </label>
        </div>

        {importSuccess && (
          <p role="status" aria-live="polite" className="text-xs text-[#88B897]">
            {importSuccess}
          </p>
        )}

        {importError && (
          <p role="alert" className="text-xs text-[#FCA5A5]">
            {importError}
          </p>
        )}
      </section>

      {/* Wipe Local Data (with 2-step confirmation) */}
      <section className="card-elevated rounded-lg border border-[#C41E2E]/60 bg-[#101014] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold uppercase text-[#FCA5A5]">
            Wipe All Local Data
          </h2>
          <p className="text-xs text-[#A6A6B2]">
            Clears saved scenes, drafts, journal notes, track progress, and preferences.
          </p>
        </div>

        {confirmingWipe ? (
          <div className="flex items-center gap-2 glow-rail">
            <button
              type="button"
              onClick={() => setConfirmingWipe(false)}
              className="glow-neighbor px-4 min-h-[44px] rounded text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmWipe}
              className="btn-red inline-flex items-center gap-2 px-4 min-h-[44px] rounded text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Yes, Erase Everything</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingWipe(true)}
            className="btn-red inline-flex items-center gap-2 px-4 min-h-[44px] rounded text-xs font-semibold"
          >
            {wipedNotice ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            <span>{wipedNotice ? "Local Data Cleared" : "Wipe Local Data"}</span>
          </button>
        )}
      </section>
    </div>
  );
}
