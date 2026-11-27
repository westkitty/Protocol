"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Download, CheckCircle2, Circle, ArrowRight, RotateCcw } from "lucide-react";
import { PROGRESSIVE_TRACKS } from "@/lib/constants";
import { sceneToMarkdown } from "@/lib/export";
import { saveSceneDraft } from "@/lib/storage";
import type { SavedCustomScene, Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function PersonalLibraryClient({ scenes }: { scenes: Scene[] }) {
  const router = useRouter();
  const {
    discreetMode,
    savedScenes,
    upsertSavedScene,
    deleteSavedScene,
    completedTracks,
    toggleTrackScene,
  } = useApp();

  const [lastDeleted, setLastDeleted] = useState<SavedCustomScene | null>(null);

  useEffect(() => {
    if (!lastDeleted) return;
    const timer = window.setTimeout(() => setLastDeleted(null), 5000);
    return () => window.clearTimeout(timer);
  }, [lastDeleted]);

  const handleDeleteWithUndo = (saved: SavedCustomScene) => {
    setLastDeleted(saved);
    deleteSavedScene(saved.id);
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    upsertSavedScene(lastDeleted);
    setLastDeleted(null);
  };

  const handleOpenSavedInWorkspace = (saved: SavedCustomScene) => {
    saveSceneDraft(saved.sceneId, {
      partnerAName: saved.partnerAName,
      partnerBName: saved.partnerBName,
      customTitle: saved.customTitle,
      responses: saved.responses,
      completedItems: saved.completedItems,
      notes: saved.notes,
      customLimits: saved.journalNotes,
      updatedAt: Date.now(),
    });
    router.push(`/scenes/${saved.sceneId}`);
  };

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
      <header className="space-y-1.5">
        <h1 className="font-heading text-3xl font-bold uppercase text-[#F5F5F7]">
          Personal Library &amp; Training Tracks
        </h1>
        <p className="text-sm text-[#A6A6B2]">
          Your saved customizations, private post-scene journal notes, and progressive tracks.
          Stored strictly in your browser&apos;s localStorage.
        </p>
      </header>

      {/* Saved Custom Scenes */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F7]">
          Saved Scenes &amp; Private Notes ({savedScenes.length})
        </h2>

        {lastDeleted && (
          <div
            role="status"
            aria-live="polite"
            className="card-elevated rounded-lg border border-[#C41E2E]/60 bg-[#101014] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <span className="text-[#F5F5F7]">
              Removed <strong>{lastDeleted.customTitle}</strong> from Personal Library.
            </span>
            <button
              type="button"
              onClick={handleUndoDelete}
              className="btn-red inline-flex items-center gap-1.5 px-3.5 min-h-[36px] rounded font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Delete</span>
            </button>
          </div>
        )}

        {savedScenes.length === 0 ? (
          <div className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-8 text-center space-y-4">
            <p className="text-sm text-[#A6A6B2]">
              No customized scenes saved yet. Open any template and click{" "}
              <strong className="text-[#F5F5F7]">Save to Library</strong>.
            </p>
            <Link
              href="/"
              className="btn-red inline-flex items-center gap-2 px-4 min-h-[44px] rounded text-xs font-semibold"
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
                className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#F5F5F7]">
                      {saved.customTitle}
                    </h3>
                    <p className="text-xs text-[#A6A6B2]">
                      {saved.partnerAName} &amp; {saved.partnerBName} • Updated{" "}
                      {new Date(saved.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 glow-rail">
                    <button
                      type="button"
                      onClick={() => handleOpenSavedInWorkspace(saved)}
                      className="btn-red inline-flex items-center px-3.5 min-h-[44px] rounded text-xs font-semibold"
                    >
                      Open in Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSaved(saved.id)}
                      className="glow-neighbor inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWithUndo(saved)}
                      aria-label={`Delete ${saved.customTitle}`}
                      className="glow-neighbor min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[#F87171] hover:bg-[#C41E2E]/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A6A6B2] block">
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
                    className="w-full px-3 py-2 rounded bg-[#17171C] border border-[#27272F] text-xs text-[#F5F5F7] placeholder:text-[#9A9A9A]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Progressive Training Tracks */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold uppercase text-[#F5F5F7]">
          Progressive Training Tracks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROGRESSIVE_TRACKS.map((track) => {
            const doneCount = track.sceneIds.filter((id) => completedTracks[id]).length;
            return (
              <div
                key={track.id}
                className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-5 space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-lg font-bold text-[#F5F5F7]">
                      {discreetMode ? track.discreetTitle : track.title}
                    </h3>
                    <span className="text-xs text-[#F87171] font-semibold">
                      {doneCount}/{track.sceneIds.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#A6A6B2] leading-relaxed">{track.description}</p>
                </div>

                <ul className="space-y-1">
                  {track.sceneIds.map((sceneId, idx) => {
                    const scene = scenes.find((s) => s.id === sceneId);
                    const done = Boolean(completedTracks[sceneId]);
                    return (
                      <li key={sceneId} className="flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => toggleTrackScene(sceneId)}
                          aria-pressed={done}
                          aria-label={`Mark ${scene?.title || sceneId} complete`}
                          className="min-h-[44px] min-w-[44px] -ml-2.5 flex items-center justify-center text-[#A6A6B2] hover:text-[#F5F5F7] shrink-0"
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/scenes/${sceneId}`}
                          className={`py-2 hover:underline ${
                            done ? "text-[#A6A6B2] line-through" : "text-[#F5F5F7]"
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
