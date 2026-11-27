"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { ExperienceLevel, Intensity, ResourceDocument, Scene } from "@/lib/types";
import { resourceHref, resourceKindLabel } from "@/lib/resource-meta";
import { useApp } from "@/context/AppContext";
import { IntensityBadge } from "./IntensityBadge";
import { CategoryEmblem } from "./CategoryEmblem";

type DurationFilter = "all" | "short" | "medium" | "extended";
type TierFilter = "all" | "free";

export function LibraryClient({
  scenes,
  languagePacks = [],
  taskLibraries = [],
}: {
  scenes: Scene[];
  languagePacks?: ResourceDocument[];
  taskLibraries?: ResourceDocument[];
}) {
  const { discreetMode, proUnlocked, setProUnlocked } = useApp();
  const resources = useMemo(
    () => [...languagePacks, ...taskLibraries],
    [languagePacks, taskLibraries]
  );

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [intensityFilter, setIntensityFilter] = useState<Intensity | "all">("all");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel | "all">("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredScenes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scenes.filter((scene) => {
      if (categoryFilter !== "all" && scene.category_slug !== categoryFilter) return false;
      if (intensityFilter !== "all" && scene.intensity !== intensityFilter) return false;
      if (experienceFilter !== "all" && scene.experience_level !== experienceFilter) return false;
      if (tierFilter === "free" && scene.tier !== "free") return false;

      if (durationFilter === "short" && scene.duration_max > 45) return false;
      if (durationFilter === "medium" && (scene.duration_max <= 45 || scene.duration_max > 120))
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

  const filteredResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (categoryFilter !== "all" && resource.category_slug !== categoryFilter) return false;
      if (tierFilter === "free" && resource.tier !== "free") return false;
      // Intensity, experience, and duration filters apply only to scenes.
      if (intensityFilter !== "all" || experienceFilter !== "all" || durationFilter !== "all") {
        return false;
      }
      if (q) {
        const haystack = [resource.title, resource.category, resourceKindLabel(resource.kind), ...resource.tags]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q) && !resource.body.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [resources, query, categoryFilter, intensityFilter, experienceFilter, durationFilter, tierFilter]);

  const secondaryFilterCount =
    (intensityFilter !== "all" ? 1 : 0) +
    (experienceFilter !== "all" ? 1 : 0) +
    (durationFilter !== "all" ? 1 : 0);

  const hasActiveFilters =
    query !== "" ||
    categoryFilter !== "all" ||
    secondaryFilterCount > 0 ||
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
      <section className="card-elevated relative overflow-hidden rounded-xl border border-[#27272F] bg-[#101014] p-4 sm:p-6">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/hero-leather-grid.svg`}
          alt=""
          fill
          priority
          aria-hidden="true"
          className="pointer-events-none select-none object-cover opacity-80"
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#F5F5F7]">
              {discreetMode
                ? "Structured Session & Planning Library"
                : "Gay Scene Library & Negotiation Templates"}
            </h1>
            <p className="text-sm text-[#A6A6B2] leading-relaxed">
              {discreetMode
                ? "Pre-built session plans, alignment checklists, and offline Markdown templates. Zero server storage."
                : `${scenes.length} structured templates with clear containers, limits, beats, and aftercare. Zero server storage—your responses stay local or export cleanly to PDF & Markdown.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 glow-rail">
            <Link
              href="/scenes/full-scene-negotiation-framework"
              className="btn-red inline-flex items-center gap-2 px-4 min-h-[44px] rounded-md text-sm font-semibold"
            >
              <span>Start Free Negotiation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!proUnlocked && (
              <button
                type="button"
                onClick={() => setProUnlocked(true)}
                className="glow-neighbor inline-flex items-center gap-2 px-4 min-h-[44px] rounded-md text-sm font-medium"
              >
                <Lock className="w-4 h-4 text-[#F87171]" />
                <span>Unlock All {scenes.length} Scenes</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A6A6B2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scenes, packs, tasks, gear, tags, roles..."
              aria-label="Search scene library, language packs, and task libraries"
              className="w-full pl-10 pr-4 min-h-[44px] rounded-md bg-[#101014] border border-[#27272F] text-sm text-[#F5F5F7] placeholder:text-[#9A9A9A] focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-2 glow-rail">
            <button
              type="button"
              onClick={() => setTierFilter(tierFilter === "all" ? "free" : "all")}
              aria-pressed={tierFilter === "free"}
              className={`px-3.5 min-h-[44px] rounded-md text-xs font-semibold ${
                tierFilter === "free" ? "btn-red" : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
              }`}
            >
              Free Starter Only
            </button>

            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              aria-expanded={showMobileFilters}
              className={`sm:hidden inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-md text-xs font-medium ${
                secondaryFilterCount > 0 || showMobileFilters
                  ? "btn-red"
                  : "glow-neighbor text-[#A6A6B2]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters{secondaryFilterCount > 0 ? ` (${secondaryFilterCount})` : ""}</span>
            </button>

            <div className="flex rounded-md border border-[#27272F] bg-[#101014] p-0.5 glow-rail">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`min-h-[38px] min-w-[38px] flex items-center justify-center rounded ${
                  viewMode === "grid" ? "btn-red" : "glow-neighbor text-[#A6A6B2]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`min-h-[38px] min-w-[38px] flex items-center justify-center rounded ${
                  viewMode === "list" ? "btn-red" : "glow-neighbor text-[#A6A6B2]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 glow-rail">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            aria-pressed={categoryFilter === "all"}
            className={`px-3.5 min-h-[38px] rounded-full text-xs font-semibold whitespace-nowrap ${
              categoryFilter === "all"
                ? "btn-red"
                : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
            }`}
          >
            All ({scenes.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = scenes.filter((s) => s.category_slug === cat.slug).length;
            const active = categoryFilter === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategoryFilter(active ? "all" : cat.slug)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3.5 min-h-[38px] rounded-full text-xs font-medium whitespace-nowrap ${
                  active ? "btn-red" : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
                }`}
              >
                <CategoryEmblem categorySlug={cat.slug} className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {discreetMode ? cat.discreetName : cat.name} ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Select Filters (collapsible on mobile, always shown on sm+) */}
        <div
          className={`${
            showMobileFilters ? "flex" : "hidden sm:flex"
          } flex-wrap items-center gap-2.5 text-xs`}
        >
          <select
            aria-label="Filter by intensity"
            value={intensityFilter}
            onChange={(e) => setIntensityFilter(e.target.value as Intensity | "all")}
            className="px-3 min-h-[40px] rounded-md bg-[#101014] border border-[#27272F] text-[#F5F5F7]"
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
            className="px-3 min-h-[40px] rounded-md bg-[#101014] border border-[#27272F] text-[#F5F5F7]"
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
            className="px-3 min-h-[40px] rounded-md bg-[#101014] border border-[#27272F] text-[#F5F5F7]"
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
              className="inline-flex items-center gap-1 px-3 min-h-[40px] rounded-md text-[#F87171] hover:bg-[#17171C]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <span className="ml-auto text-[#A6A6B2]">
            Showing <strong className="text-[#F5F5F7]">{filteredScenes.length}</strong> of{" "}
            {scenes.length}
          </span>
        </div>
      </section>

      {/* Results */}
      {filteredScenes.length === 0 ? (
        <div className="card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-10 text-center space-y-3">
          <p className="text-[#F5F5F7] font-medium">No scenes match those filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-red px-4 min-h-[44px] rounded-md text-xs font-semibold"
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
                className="card-elevated group rounded-lg border border-[#27272F] bg-[#101014] hover:bg-[#17171C] hover:border-[#C41E2E]/60 hover:shadow-[0_0_24px_rgba(220,38,38,0.16)] p-5 flex flex-col justify-between gap-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#A6A6B2] truncate">
                      <CategoryEmblem
                        categorySlug={scene.category_slug}
                        className="w-3.5 h-3.5 text-[#F87171] shrink-0"
                      />
                      <span className="truncate">{displayCategory}</span>
                    </span>
                    {scene.tier === "free" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#4A7C59]/20 text-[#88B897] border border-[#4A7C59]/50">
                        Free
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#17171C] text-[#F87171] border border-[#C41E2E]/40">
                        <Lock className="w-2.5 h-2.5" /> Pro
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#17171C] text-[#A6A6B2] border border-[#27272F]">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading text-xl font-bold text-[#F5F5F7] group-hover:text-white leading-tight">
                    {displayTitle}
                  </h2>

                  <p className="text-xs text-[#A6A6B2] line-clamp-2 leading-relaxed">
                    {scene.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1F1F27] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <IntensityBadge intensity={scene.intensity} />
                    <span className="inline-flex items-center gap-1 text-[#A6A6B2]">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(scene.duration_min, scene.duration_max)}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-[#A6A6B2]"
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
        <div className="card-elevated divide-y divide-[#1F1F27] rounded-lg border border-[#27272F] bg-[#101014]">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[#17171C] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#A6A6B2]">
                      {displayCategory}
                    </span>
                    <span className="text-[#444]">•</span>
                    <span className="text-[11px] capitalize text-[#A6A6B2]">
                      {scene.experience_level}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-[#F5F5F7]">
                    {displayTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <IntensityBadge intensity={scene.intensity} />
                  <span className="text-xs text-[#A6A6B2] w-20 text-right">
                    {formatDuration(scene.duration_min, scene.duration_max)}
                  </span>
                  {scene.tier === "free" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#4A7C59]/20 text-[#88B897] border border-[#4A7C59]/50">
                      Free
                    </span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#17171C] text-[#F87171] border border-[#C41E2E]/40">
                      <Lock className="w-2.5 h-2.5" /> Pro
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#17171C] text-[#A6A6B2] border border-[#27272F]">
                      Pro
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filteredResources.length > 0 && (
        <section id="library-resources" className="space-y-3 pt-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-[#F5F5F7]">
                Language Packs & Task Libraries
              </h2>
              <p className="text-xs text-[#A6A6B2] mt-1">
                Modular phrases and reusable tasks you can drop into any compatible scene.
              </p>
            </div>
            <span className="text-xs text-[#A6A6B2] shrink-0">
              {filteredResources.length} of {resources.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((resource) => {
              const catMeta = CATEGORIES.find((c) => c.slug === resource.category_slug);
              const displayCategory = discreetMode
                ? catMeta?.discreetName || resource.category
                : resource.category;
              return (
                <Link
                  key={resource.id}
                  href={resourceHref(resource)}
                  className="card-elevated group rounded-lg border border-[#27272F] bg-[#101014] hover:bg-[#17171C] hover:border-[#C41E2E]/60 hover:shadow-[0_0_24px_rgba(220,38,38,0.16)] p-5 flex flex-col justify-between gap-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#A6A6B2] truncate">
                        <CategoryEmblem
                          categorySlug={resource.category_slug}
                          className="w-3.5 h-3.5 text-[#F87171] shrink-0"
                        />
                        <span className="truncate">{displayCategory}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#17171C] text-[#F5F5F7] border border-[#27272F]">
                        {resourceKindLabel(resource.kind)}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-[#F5F5F7] group-hover:text-white leading-tight">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-[#A6A6B2] line-clamp-2 leading-relaxed">
                      {resource.body}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
