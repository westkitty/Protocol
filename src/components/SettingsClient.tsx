"use client";

import React, { useState } from "react";
import { Settings, Shield, Download, Trash2, Check, Lock } from "lucide-react";
import { buildOfflineLibraryMarkdown } from "@/lib/export";
import type { SavedCustomScene, Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function SettingsClient({ scenes }: { scenes: Scene[] }) {
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
  const [importError, setImportError] = useState<string | null>(null);

  const handleDownloadOfflineLibrary = () => {
    const bundle = buildOfflineLibraryMarkdown(scenes);
    const blob = new Blob([bundle], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "protocol-offline-scene-library.md";
    a.click();
    URL.revokeObjectURL(url);
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
    URL.revokeObjectURL(url);
  };

  const handleImportJsonBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SavedCustomScene[];
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid backup format");
      }
      importSavedScenes(parsed);
    } catch {
      setImportError("Could not parse backup JSON file.");
    }
  };

  const handleWipe = () => {
    wipeAll();
    setWipedNotice(true);
    window.setTimeout(() => setWipedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C4A35A]">
          <Settings className="w-4 h-4" />
          <span>Preferences, Privacy &amp; Offline Exports</span>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase text-[#F5F5F0]">
          Settings &amp; Local-First Export
        </h1>
      </header>

      {/* Privacy Guarantee */}
      <section className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#88B897]">
          <Shield className="w-4 h-4" />
          <span>Privacy-First Architecture</span>
        </div>
        <p className="text-xs text-[#A0A0A0] leading-relaxed">
          Protocol stores zero user-filled negotiation data on any server. Partner share links
          encode responses directly into the URL hash fragment (<code>#share=...</code>) and
          automatically expire after 72 hours. Personal Library notes stay exclusively in your
          browser&apos;s localStorage.
        </p>
      </section>

      {/* Appearance & Mode */}
      <section className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold uppercase text-[#F5F5F0]">
          Display &amp; Access
        </h2>

        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#2A2A2A]">
          <div>
            <div className="text-sm font-medium text-[#F5F5F0]">Discreet Mode</div>
            <div className="text-xs text-[#A0A0A0]">
              Neutralizes scene titles, categories, and browser tab to &ldquo;Field Notes&rdquo;.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDiscreetMode(!discreetMode)}
            className={`px-3.5 py-2 rounded text-xs font-semibold border ${
              discreetMode
                ? "border-[#C4A35A] bg-[#C4A35A]/20 text-[#E0C37C]"
                : "border-[#333333] bg-[#242424] text-[#A0A0A0]"
            }`}
          >
            {discreetMode ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#2A2A2A]">
          <div>
            <div className="text-sm font-medium text-[#F5F5F0]">Accent Palette</div>
            <div className="text-xs text-[#A0A0A0]">
              Switch between Leather Brown (#8B4513) and Deep Burgundy (#6B2D3C).
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAccentTheme("leather")}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                accentTheme === "leather"
                  ? "border-[#8B4513] bg-[#8B4513] text-white"
                  : "border-[#333333] bg-[#242424] text-[#A0A0A0]"
              }`}
            >
              Leather
            </button>
            <button
              type="button"
              onClick={() => setAccentTheme("burgundy")}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                accentTheme === "burgundy"
                  ? "border-[#6B2D3C] bg-[#6B2D3C] text-white"
                  : "border-[#333333] bg-[#242424] text-[#A0A0A0]"
              }`}
            >
              Burgundy
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <div className="text-sm font-medium text-[#F5F5F0]">
              Full Library Access ({scenes.length} Scenes)
            </div>
            <div className="text-xs text-[#A0A0A0]">
              Toggle Pro Library unlock preview (free tier includes 8 core starter scenes).
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProUnlocked(!proUnlocked)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold border ${
              proUnlocked
                ? "border-[#4A7C59] bg-[#4A7C59]/20 text-[#88B897]"
                : "border-[#333333] bg-[#242424] text-[#F5F5F0]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{proUnlocked ? "All Unlocked" : "Unlock All"}</span>
          </button>
        </div>
      </section>

      {/* Offline Exports */}
      <section className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold uppercase text-[#F5F5F0]">
          Offline &amp; Obsidian Exports
        </h2>
        <p className="text-xs text-[#A0A0A0]">
          Download the entire {scenes.length}-scene library as plain Markdown with YAML frontmatter
          for offline use or import into Obsidian.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadOfflineLibrary}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold text-[#F5F5F0]"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Download className="w-4 h-4" />
            <span>Download Full Library (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJsonBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-xs font-medium border border-[#333333] bg-[#242424] text-[#F5F5F0]"
          >
            <Download className="w-4 h-4" />
            <span>Backup Personal Library (.json)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-xs font-medium border border-[#333333] bg-[#242424] text-[#F5F5F0] cursor-pointer">
            <span>Restore Backup (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJsonBackup}
              className="hidden"
            />
          </label>
        </div>

        {importError && <p className="text-xs text-[#D98282]">{importError}</p>}
      </section>

      {/* Wipe Local Data */}
      <section className="rounded-lg border border-[#8B3A3A]/60 bg-[#1A1A1A] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold uppercase text-[#D98282]">
            Wipe All Local Data
          </h2>
          <p className="text-xs text-[#A0A0A0]">
            Immediately clears saved scenes, journal notes, track progress, and preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={handleWipe}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold bg-[#8B3A3A] hover:bg-[#9E4545] text-white"
        >
          {wipedNotice ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          <span>{wipedNotice ? "Local Data Cleared" : "Wipe Local Data"}</span>
        </button>
      </section>
    </div>
  );
}
