"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, EyeOff, BookOpen, GitCompare, FolderHeart, Settings } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Header() {
  const pathname = usePathname();
  const { discreetMode, setDiscreetMode, savedScenes } = useApp();

  const navItems = [
    { href: "/", label: "Library", icon: BookOpen },
    { href: "/compare", label: "Partner Compare", icon: GitCompare },
    {
      href: "/library",
      label: `My Library${savedScenes.length > 0 ? ` (${savedScenes.length})` : ""}`,
      icon: FolderHeart,
    },
    { href: "/settings", label: "Settings & Export", icon: Settings },
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#333333] bg-[#0F0F0F]/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="w-2.5 h-7 rounded-sm"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden="true"
          />
          <div>
            <span className="font-heading text-xl sm:text-2xl font-bold tracking-wider uppercase text-[#F5F5F0] block leading-none">
              {discreetMode ? "Field Notes" : "Protocol"}
            </span>
            <span className="text-[11px] text-[#A0A0A0] hidden sm:block leading-none mt-0.5">
              {discreetMode ? "Session Planner" : "Scene Library & Negotiation"}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto" aria-label="Primary">
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
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#242424] text-[#F5F5F0] border border-[#3E3E3E]"
                    : "text-[#A0A0A0] hover:text-[#F5F5F0] hover:bg-[#1A1A1A]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setDiscreetMode(!discreetMode)}
          title="Toggle Discreet Mode (neutralizes titles and browser tab)"
          aria-pressed={discreetMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors shrink-0 ${
            discreetMode
              ? "bg-[#242424] border-[#C4A35A] text-[#C4A35A]"
              : "bg-[#1A1A1A] border-[#333333] text-[#A0A0A0] hover:text-[#F5F5F0]"
          }`}
        >
          {discreetMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{discreetMode ? "Discreet On" : "Discreet"}</span>
        </button>
      </div>
    </header>
  );
}
