"use client";

import React from "react";
import Link from "next/link";
import { FolderHeart, Trash2, Download, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { PROGRESSIVE_TRACKS } from "@/lib/constants";
import { sceneToMarkdown } from "@/lib/export";
import type { Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function PersonalLibraryClient({ scenes }: { scenes: Scene[] }) {
  const {
    discreetMode,
    savedScenes,
    upsertSavedScene,
    deleteSavedScene,
    completedTracks,
    toggleTrackScene,
  } = useApp();

  const handleExportSaved = (savedId: string) => {
    const saved = savedScenes.find((s) => s.id === savedId);
    if (!saved) return;
    const baseScene = scenes.find((s) => s.id === saved.sceneId);
    if (!baseScene) return;

    const md = sceneToMarkdown(baseScene, {
      partnerAName: saved.partnerAName,
      partnerBName: saved.partnerBName,
      responses: saved.responses,
      completedItems: saved.completedItems,
      notes: saved.notes,
      journalNotes: saved.journalNotes,
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${saved.sceneId}-custom.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C4A35A]">
          <FolderHeart className="w-4 h-4" />
          <span>Local Browser Storage Only</span>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase text-[#F5F5F0]">
          Personal Library &amp; Training Tracks
        </h1>
        <p className="text-sm text-[#A0A0A0]">
          Your saved customizations, private post-scene journal notes, and progressive tracks.
          Stored strictly in your browser&apos;s localStorage.
        </p>
      </header>

      {/* Saved Custom Scenes */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F0]">
          Saved Scenes &amp; Private Notes ({savedScenes.length})
        </h2>

        {savedScenes.length === 0 ? (
          <div className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-8 text-center space-y-3">
            <p className="text-sm text-[#A0A0A0]">
              No customized scenes saved yet. Open any template and click{" "}
              <strong className="text-[#F5F5F0]">Save to Library</strong>.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold text-[#F5F5F0]"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <span>Browse Scene Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedScenes.map((saved) => (
              <div
                key={saved.id}
                className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#F5F5F0]">
                      {saved.customTitle}
                    </h3>
                    <p className="text-xs text-[#A0A0A0]">
                      {saved.partnerAName} &amp; {saved.partnerBName} • Updated{" "}
                      {new Date(saved.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/scenes/${saved.sceneId}`}
                      className="px-3 py-1.5 rounded text-xs font-medium bg-[#242424] border border-[#333333] text-[#F5F5F0]"
                    >
                      Open Template
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleExportSaved(saved.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-[#242424] border border-[#333333] text-[#F5F5F0]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedScene(saved.id)}
                      aria-label={`Delete ${saved.customTitle}`}
                      className="p-1.5 rounded bg-[#242424] border border-[#333333] text-[#D98282] hover:bg-[#8B3A3A]/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A0A0A0] block">
                    Private Post-Scene Journal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={saved.journalNotes}
                    onChange={(e) =>
                      upsertSavedScene({
                        ...saved,
                        journalNotes: e.target.value,
                        updatedAt: Date.now(),
                      })
                    }
                    placeholder="Record what worked, tweaks for next time, or aftercare notes..."
                    className="w-full px-3 py-2 rounded bg-[#242424] border border-[#333333] text-xs text-[#F5F5F0]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Progressive Training Tracks */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F0]">
          Progressive Training Tracks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROGRESSIVE_TRACKS.map((track) => {
            const doneCount = track.sceneIds.filter((id) => completedTracks[id]).length;
            return (
              <div
                key={track.id}
                className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-5 space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-lg font-bold text-[#F5F5F0]">
                      {discreetMode ? track.discreetTitle : track.title}
                    </h3>
                    <span className="text-xs text-[#C4A35A] font-medium">
                      {doneCount}/{track.sceneIds.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed">{track.description}</p>
                </div>

                <ul className="space-y-2">
                  {track.sceneIds.map((sceneId, idx) => {
                    const scene = scenes.find((s) => s.id === sceneId);
                    const done = Boolean(completedTracks[sceneId]);
                    return (
                      <li key={sceneId} className="flex items-start gap-2.5 text-xs">
                        <button
                          type="button"
                          onClick={() => toggleTrackScene(sceneId)}
                          aria-label={`Mark ${scene?.title || sceneId} complete`}
                          className="mt-0.5 text-[#A0A0A0] hover:text-[#F5F5F0]"
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/scenes/${sceneId}`}
                          className={`hover:underline ${
                            done ? "text-[#A0A0A0] line-through" : "text-[#F5F5F0]"
                          }`}
                        >
                          {idx + 1}.{" "}
                          {scene
                            ? discreetMode
                              ? scene.discreet_title
                              : scene.title
                            : sceneId}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
