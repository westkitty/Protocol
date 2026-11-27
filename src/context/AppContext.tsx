"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type AccentTheme,
  loadLocalState,
  saveAccentTheme,
  saveCompletedTracks,
  saveDiscreetMode,
  savePersonalScenes,
  saveProUnlocked,
  wipeAllLocalData,
} from "@/lib/storage";
import type { SavedCustomScene } from "@/lib/types";

interface AppContextValue {
  hydrated: boolean;
  discreetMode: boolean;
  setDiscreetMode: (val: boolean) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (val: AccentTheme) => void;
  proUnlocked: boolean;
  setProUnlocked: (val: boolean) => void;
  savedScenes: SavedCustomScene[];
  upsertSavedScene: (scene: SavedCustomScene) => void;
  deleteSavedScene: (id: string) => void;
  importSavedScenes: (scenes: SavedCustomScene[]) => void;
  completedTracks: Record<string, boolean>;
  toggleTrackScene: (sceneId: string) => void;
  wipeAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [discreetMode, setDiscreetModeState] = useState(false);
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>("crimson");
  const [proUnlocked, setProUnlockedState] = useState(false);
  const [savedScenes, setSavedScenes] = useState<SavedCustomScene[]>([]);
  const [completedTracks, setCompletedTracks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loaded = loadLocalState();
    setDiscreetModeState(loaded.discreetMode);
    setAccentThemeState(loaded.accentTheme);
    setProUnlockedState(loaded.proUnlocked);
    setSavedScenes(loaded.savedScenes);
    setCompletedTracks(loaded.completedTracks);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.title = discreetMode
      ? "Field Notes — Session Planner"
      : "Protocol — Scene Library & Negotiation Templates";
  }, [discreetMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const isBurgundy = accentTheme === "burgundy";
    const accent = isBurgundy ? "#8B1A2B" : "#C41E2E";
    const accentHover = isBurgundy ? "#A32135" : "#DC2626";
    const glow = isBurgundy ? "rgba(163, 33, 53, 0.48)" : "rgba(220, 38, 38, 0.48)";
    const glowSoft = isBurgundy ? "rgba(163, 33, 53, 0.24)" : "rgba(220, 38, 38, 0.22)";
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-hover", accentHover);
    document.documentElement.style.setProperty("--accent-glow", glow);
    document.documentElement.style.setProperty("--accent-glow-soft", glowSoft);
  }, [accentTheme, hydrated]);

  const setDiscreetMode = (val: boolean) => {
    setDiscreetModeState(val);
    saveDiscreetMode(val);
  };

  const setAccentTheme = (val: AccentTheme) => {
    setAccentThemeState(val);
    saveAccentTheme(val);
  };

  const setProUnlocked = (val: boolean) => {
    setProUnlockedState(val);
    saveProUnlocked(val);
  };

  const upsertSavedScene = (scene: SavedCustomScene) => {
    setSavedScenes((prev) => {
      const idx = prev.findIndex((s) => s.id === scene.id);
      const next =
        idx >= 0
          ? prev.map((s) => (s.id === scene.id ? scene : s))
          : [scene, ...prev];
      savePersonalScenes(next);
      return next;
    });
  };

  const deleteSavedScene = (id: string) => {
    setSavedScenes((prev) => {
      const next = prev.filter((s) => s.id !== id);
      savePersonalScenes(next);
      return next;
    });
  };

  const importSavedScenes = (scenes: SavedCustomScene[]) => {
    setSavedScenes(scenes);
    savePersonalScenes(scenes);
  };

  const toggleTrackScene = (sceneId: string) => {
    setCompletedTracks((prev) => {
      const next = { ...prev, [sceneId]: !prev[sceneId] };
      saveCompletedTracks(next);
      return next;
    });
  };

  const wipeAll = () => {
    wipeAllLocalData();
    setDiscreetModeState(false);
    setAccentThemeState("crimson");
    setProUnlockedState(false);
    setSavedScenes([]);
    setCompletedTracks({});
  };

  return (
    <AppContext.Provider
      value={{
        hydrated,
        discreetMode,
        setDiscreetMode,
        accentTheme,
        setAccentTheme,
        proUnlocked,
        setProUnlocked,
        savedScenes,
        upsertSavedScene,
        deleteSavedScene,
        importSavedScenes,
        completedTracks,
        toggleTrackScene,
        wipeAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
