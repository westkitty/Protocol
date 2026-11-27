"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Eye, EyeOff } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useApp } from "@/context/AppContext";
import { CategoryEmblem } from "./CategoryEmblem";

export interface SceneIndexItem {
  id: string;
  title: string;
  discreet_title: string;
  category: string;
  category_slug: string;
  intensity: string;
  kind?: "scene" | "language-pack" | "task-library";
  href?: string;
}

export function CommandPalette({
  scenes,
  open,
  onClose,
}: {
  scenes: SceneIndexItem[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { discreetMode, setDiscreetMode } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setSelectedIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    } else if (!open && wasOpenRef.current) {
      prevFocusRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const quickActions = [
      {
        kind: "action" as const,
        id: "action-discreet",
        label: discreetMode ? "Disable Discreet Mode" : "Enable Discreet Mode",
        sub: "Toggle neutral titles and browser tab",
        categorySlug: "supporting-modules",
        run: () => {
          setDiscreetMode(!discreetMode);
          onClose();
        },
      },
      {
        kind: "action" as const,
        id: "action-compare",
        label: "Open Partner Compare",
        sub: "Load or compare a 72-hour share link",
        categorySlug: "negotiation-foundation",
        run: () => {
          router.push("/compare");
          onClose();
        },
      },
      {
        kind: "action" as const,
        id: "action-library",
        label: "Open Personal Library",
        sub: "Saved sessions, private notes & training tracks",
        categorySlug: "pup-play-training",
        run: () => {
          router.push("/library");
          onClose();
        },
      },
      {
        kind: "action" as const,
        id: "action-settings",
        label: "Open Settings & Offline Export",
        sub: "Download full Markdown bundle or wipe local data",
        categorySlug: "supporting-modules",
        run: () => {
          router.push("/settings");
          onClose();
        },
      },
    ];

    const matchedActions = q
      ? quickActions.filter((a) => `${a.label} ${a.sub}`.toLowerCase().includes(q))
      : quickActions.slice(0, 2);

    const matchedScenes = scenes
      .filter((s) => {
        if (!q) return true;
        return `${s.title} ${s.discreet_title} ${s.category} ${s.intensity}`
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 8)
      .map((s) => {
        const catMeta = CATEGORIES.find((c) => c.slug === s.category_slug);
        const displayCat = discreetMode ? catMeta?.discreetName || s.category : s.category;
        return {
          kind: "scene" as const,
          id: s.id,
          label: discreetMode ? s.discreet_title : s.title,
          sub: `${displayCat} • ${s.intensity}`,
          categorySlug: s.category_slug,
          run: () => {
            router.push(s.href || `/scenes/${s.id}`);
            onClose();
          },
        };
      });

    return [...matchedActions, ...matchedScenes];
  }, [query, scenes, discreetMode, setDiscreetMode, router, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, open]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (items.length > 0 ? (i + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (items.length > 0 ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      items[selectedIndex].run();
    }
  };

  const activeOptionId = items[selectedIndex]?.id ? `cmd-opt-${items[selectedIndex].id}` : undefined;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/75 flex items-start justify-center pt-16 sm:pt-24 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick Command Palette"
        onKeyDown={handleKeyDown}
        className="card-elevated w-full max-w-xl rounded-xl border border-[var(--accent)]/60 bg-[#101014] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-[#27272F] focus-within:border-[var(--accent)] transition-colors">
          <Search className="w-4 h-4 text-[#F87171] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="cmd-listbox"
            aria-activedescendant={activeOptionId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any scene, pack, task, or action (e.g. boot, pup, collar, discreet)..."
            aria-label="Search commands, scenes, language packs, and task libraries"
            className="flex-1 min-h-[50px] bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#9A9A9A] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[#A6A6B2] hover:text-[#F5F5F7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ul id="cmd-listbox" role="listbox" className="max-h-80 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-[#A6A6B2]">
              No matching scenes, packs, or actions.
            </li>
          ) : (
            items.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <li key={item.id} role="presentation">
                  <button
                    ref={(el) => {
                      optionRefs.current[idx] = el;
                    }}
                    id={`cmd-opt-${item.id}`}
                    role="option"
                    aria-selected={active}
                    type="button"
                    onClick={item.run}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 min-h-[44px] rounded-md text-left transition-colors ${
                      active ? "btn-red" : "text-[#F5F5F7] hover:bg-[#17171C]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.id === "action-discreet" ? (
                        discreetMode ? (
                          <EyeOff className="w-4 h-4 shrink-0" />
                        ) : (
                          <Eye className="w-4 h-4 shrink-0" />
                        )
                      ) : (
                        <CategoryEmblem
                          categorySlug={item.categorySlug}
                          className="w-4 h-4 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{item.label}</div>
                        <div
                          className={`text-[11px] truncate ${
                            active ? "text-white/80" : "text-[#A6A6B2]"
                          }`}
                        >
                          {item.sub}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="px-4 py-2 border-t border-[#27272F] bg-[#070709] flex items-center justify-between text-[11px] text-[#A6A6B2]">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
          <span>
            {scenes.filter((s) => !s.kind || s.kind === "scene").length} Scenes
            {scenes.some((s) => s.kind === "language-pack")
              ? ` • ${scenes.filter((s) => s.kind === "language-pack").length} Packs`
              : ""}
            {scenes.some((s) => s.kind === "task-library")
              ? ` • ${scenes.filter((s) => s.kind === "task-library").length} Task Libraries`
              : ""}{" "}
            Indexed
          </span>
        </div>
      </div>
    </div>
  );
}
