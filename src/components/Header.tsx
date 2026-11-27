"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, EyeOff, BookOpen, GitCompare, FolderHeart, Settings, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { BrandMark } from "./BrandMark";
import { CommandPalette, type SceneIndexItem } from "./CommandPalette";

export function Header({ scenes = [] }: { scenes?: SceneIndexItem[] }) {
  const pathname = usePathname();
  const { discreetMode, setDiscreetMode, savedScenes } = useApp();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navItems = [
    { href: "/", label: "Library", shortLabel: "Library", icon: BookOpen },
    { href: "/compare", label: "Partner Compare", shortLabel: "Compare", icon: GitCompare },
    {
      href: "/library",
      label: `My Library${savedScenes.length > 0 ? ` (${savedScenes.length})` : ""}`,
      shortLabel: `Saved${savedScenes.length > 0 ? ` (${savedScenes.length})` : ""}`,
      icon: FolderHeart,
    },
    { href: "/settings", label: "Settings & Export", shortLabel: "Settings", icon: Settings },
  ];

  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b border-[#27272F] bg-[#070709] shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 min-h-[44px]">
            <BrandMark discreet={discreetMode} />
            <div>
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-wider uppercase text-[#F5F5F7] block leading-none">
                {discreetMode ? "Field Notes" : "Protocol"}
              </span>
              <span className="text-[11px] text-[#A6A6B2] hidden sm:block leading-none mt-0.5">
                {discreetMode ? "Session Planner" : "Scene Library & Negotiation"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Rail */}
          <nav
            className="hidden md:flex items-center gap-1.5 glow-rail"
            aria-label="Primary"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/" || pathname?.startsWith("/scenes")
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-md text-sm font-medium whitespace-nowrap ${
                    active ? "btn-red" : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 glow-rail shrink-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette (Command+K)"
              title="Quick Jump (⌘K / Ctrl+K)"
              className="glow-neighbor flex items-center gap-1.5 px-3 min-h-[44px] rounded-md text-xs font-medium text-[#A6A6B2] hover:text-[#F5F5F7]"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Quick Jump</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] rounded bg-[#070709] border border-[#27272F] text-[#A6A6B2]">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setDiscreetMode(!discreetMode)}
              title="Toggle Discreet Mode (neutralizes titles and browser tab)"
              aria-pressed={discreetMode}
              className={`flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-md text-xs font-semibold shrink-0 ${
                discreetMode ? "btn-red" : "glow-neighbor text-[#A6A6B2] hover:text-[#F5F5F7]"
              }`}
            >
              {discreetMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{discreetMode ? "Discreet On" : "Discreet"}</span>
            </button>
          </div>
        </div>
      </header>

      <CommandPalette
        scenes={scenes}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      {/* Mobile Bottom Tab Navigation (zero horizontal clipping, 48px+ thumb targets) */}
      <nav
        aria-label="Mobile Primary"
        className="no-print md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#27272F] bg-[#070709] shadow-[0_-4px_20px_rgba(0,0,0,0.75)] grid grid-cols-4 gap-1 p-1.5 glow-rail"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/" || pathname?.startsWith("/scenes")
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[48px] rounded-md text-[11px] font-medium ${
                active ? "btn-red" : "glow-neighbor text-[#A6A6B2]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full px-1">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
