"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { ExperienceLevel, Intensity, Scene } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { IntensityBadge } from "./IntensityBadge";

type DurationFilter = "all" | "short" | "medium" | "extended";
type TierFilter = "all" | "free";

export function LibraryClient({ scenes }: { scenes: Scene[] }) {
  const { discreetMode, proUnlocked, setProUnlocked } = useApp();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [intensityFilter, setIntensityFilter] = useState<Intensity | "all">("all");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel | "all">("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredScenes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scenes.filter((scene) => {
      if (categoryFilter !== "all" && scene.category_slug !== categoryFilter) return false;
      if (intensityFilter !== "all" && scene.intensity !== intensityFilter) return false;
      if (experienceFilter !== "all" && scene.experience_level !== experienceFilter) return false;
      if (tierFilter === "free" && scene.tier !== "free") return false;

      if (durationFilter === "short" && scene.duration_max > 45) return false;
      if (durationFilter === "medium" && (scene.duration_max <= 45 || scene.duration_min > 120))
        return false;
      if (durationFilter === "extended" && scene.duration_max <= 120) return false;

      if (q) {
        const haystack = [
          scene.title,
          scene.discreet_title,
          scene.category,
          scene.subcategory,
          ...scene.tags,
          ...scene.materials,
          ...scene.roles,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    scenes,
    query,
    categoryFilter,
    intensityFilter,
    experienceFilter,
    durationFilter,
    tierFilter,
  ]);

  const hasActiveFilters =
    query !== "" ||
    categoryFilter !== "all" ||
    intensityFilter !== "all" ||
    experienceFilter !== "all" ||
    durationFilter !== "all" ||
    tierFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setIntensityFilter("all");
    setExperienceFilter("all");
    setDurationFilter("all");
    setTierFilter("all");
  };

  const formatDuration = (min: number, max: number) => {
    if (min >= 1440) {
      const dMin = Math.round(min / 1440);
      const dMax = Math.round(max / 1440);
      return dMin === dMax ? `${dMin}d` : `${dMin}–${dMax}d`;
    }
    if (min >= 120) {
      return `${Math.round(min / 60)}–${Math.round(max / 60)} hr`;
    }
    return `${min}–${max} min`;
  };

  return (
    <div className="space-y-6">
      {/* Hero / Lead Magnet Banner */}
      <section className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#C4A35A] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Privacy-First • Local-First • {scenes.length} Structured Templates</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#F5F5F0]">
              {discreetMode
                ? "Structured Session & Planning Library"
                : "Gay Scene Library & Negotiation Templates"}
            </h1>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              {discreetMode
                ? "Pre-built session plans, alignment checklists, and offline Markdown templates. Zero server storage."
                : "Clear containers, negotiated limits, step-by-step beats, and built-in aftercare. Zero server storage—your responses stay in your browser or export cleanly to PDF & Markdown."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/scenes/full-scene-negotiation-framework"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-[#F5F5F0] transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <span>Start Free Negotiation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!proUnlocked && (
              <button
                type="button"
                onClick={() => setProUnlocked(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-[#3E3E3E] bg-[#242424] hover:bg-[#2D2D2D] text-[#F5F5F0] transition-colors"
              >
                <Lock className="w-4 h-4 text-[#C4A35A]" />
                <span>Unlock All {scenes.length} Scenes (Preview)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scenes, gear, tags, roles..."
              aria-label="Search scene library"
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#1A1A1A] border border-[#333333] text-sm text-[#F5F5F0] placeholder:text-[#777777] focus:outline-none focus:border-[#8B4513]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTierFilter(tierFilter === "all" ? "free" : "all")}
              className={`px-3 py-2.5 rounded-md text-xs font-medium border transition-colors ${
                tierFilter === "free"
                  ? "border-[#4A7C59] bg-[#4A7C59]/20 text-[#88B897]"
                  : "border-[#333333] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F5F5F0]"
              }`}
            >
              Free Starter Only
            </button>

            <div className="flex rounded-md border border-[#333333] bg-[#1A1A1A] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-[#242424] text-[#F5F5F0]" : "text-[#A0A0A0]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-[#242424] text-[#F5F5F0]" : "text-[#A0A0A0]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              categoryFilter === "all"
                ? "border-[#F5F5F0]/40 bg-[#242424] text-[#F5F5F0]"
                : "border-[#333333] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F5F5F0]"
            }`}
          >
            All Categories ({scenes.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = scenes.filter((s) => s.category_slug === cat.slug).length;
            const active = categoryFilter === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategoryFilter(active ? "all" : cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  active
                    ? "border-[#F5F5F0]/40 bg-[#242424] text-[#F5F5F0]"
                    : "border-[#333333] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F5F5F0]"
                }`}
              >
                {discreetMode ? cat.discreetName : cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Secondary Select Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <select
            aria-label="Filter by intensity"
            value={intensityFilter}
            onChange={(e) => setIntensityFilter(e.target.value as Intensity | "all")}
            className="px-3 py-2 rounded-md bg-[#1A1A1A] border border-[#333333] text-[#F5F5F0]"
          >
            <option value="all">Intensity: Any</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
            <option value="progressive">Progressive</option>
          </select>

          <select
            aria-label="Filter by experience level"
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value as ExperienceLevel | "all")}
            className="px-3 py-2 rounded-md bg-[#1A1A1A] border border-[#333333] text-[#F5F5F0]"
          >
            <option value="all">Experience: Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            aria-label="Filter by duration"
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
            className="px-3 py-2 rounded-md bg-[#1A1A1A] border border-[#333333] text-[#F5F5F0]"
          >
            <option value="all">Duration: Any</option>
            <option value="short">Quick (≤ 45 min)</option>
            <option value="medium">Standard (45–120 min)</option>
            <option value="extended">Extended / Weekend (2h+)</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-md text-[#C4A35A] hover:bg-[#1A1A1A]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <span className="ml-auto text-[#A0A0A0]">
            Showing <strong className="text-[#F5F5F0]">{filteredScenes.length}</strong> of{" "}
            {scenes.length}
          </span>
        </div>
      </section>

      {/* Results */}
      {filteredScenes.length === 0 ? (
        <div className="rounded-lg border border-[#333333] bg-[#1A1A1A] p-10 text-center space-y-3">
          <p className="text-[#F5F5F0] font-medium">No scenes match those filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#242424] border border-[#3E3E3E] text-[#F5F5F0]"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenes.map((scene) => {
            const catMeta = CATEGORIES.find((c) => c.slug === scene.category_slug);
            const displayTitle = discreetMode ? scene.discreet_title : scene.title;
            const displayCategory = discreetMode
              ? catMeta?.discreetName || scene.category
              : scene.category;
            const locked = scene.tier === "pro" && !proUnlocked;

            return (
              <Link
                key={scene.id}
                href={`/scenes/${scene.id}`}
                className="group rounded-lg border border-[#333333] bg-[#1A1A1A] hover:bg-[#242424] hover:border-[#4A4A4A] p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#A0A0A0] truncate">
                      {displayCategory}
                    </span>
                    {scene.tier === "free" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#4A7C59]/20 text-[#88B897] border border-[#4A7C59]/50">
                        Free
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#242424] text-[#C4A35A] border border-[#3E3E3E]">
                        <Lock className="w-2.5 h-2.5" /> Pro
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#242424] text-[#A0A0A0] border border-[#3E3E3E]">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading text-xl font-bold text-[#F5F5F0] group-hover:text-white leading-tight">
                    {displayTitle}
                  </h2>

                  <p className="text-xs text-[#A0A0A0] line-clamp-2 leading-relaxed">
                    {scene.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <IntensityBadge intensity={scene.intensity} />
                    <span className="inline-flex items-center gap-1 text-[#A0A0A0]">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(scene.duration_min, scene.duration_max)}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-[#A0A0A0]"
                    title={`${scene.risk_notes.length} risk awareness notes`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C4A35A]" />
                    {scene.risk_notes.length}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-[#2A2A2A] rounded-lg border border-[#333333] bg-[#1A1A1A]">
          {filteredScenes.map((scene) => {
            const catMeta = CATEGORIES.find((c) => c.slug === scene.category_slug);
            const displayTitle = discreetMode ? scene.discreet_title : scene.title;
            const displayCategory = discreetMode
              ? catMeta?.discreetName || scene.category
              : scene.category;
            const locked = scene.tier === "pro" && !proUnlocked;

            return (
              <Link
                key={scene.id}
                href={`/scenes/${scene.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[#242424] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#A0A0A0]">
                      {displayCategory}
                    </span>
                    <span className="text-[#444]">•</span>
                    <span className="text-[11px] capitalize text-[#A0A0A0]">
                      {scene.experience_level}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-[#F5F5F0]">
                    {displayTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <IntensityBadge intensity={scene.intensity} />
                  <span className="text-xs text-[#A0A0A0] w-20 text-right">
                    {formatDuration(scene.duration_min, scene.duration_max)}
                  </span>
                  {scene.tier === "free" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#4A7C59]/20 text-[#88B897] border border-[#4A7C59]/50">
                      Free
                    </span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#242424] text-[#C4A35A] border border-[#3E3E3E]">
                      <Lock className="w-2.5 h-2.5" /> Pro
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#242424] text-[#A0A0A0] border border-[#3E3E3E]">
                      Pro
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
