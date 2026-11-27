import type { ResponseValue, SavedCustomScene } from "./types";

const STORAGE_KEYS = {
  discreetMode: "protocol_discreet_mode",
  accentTheme: "protocol_accent_theme",
  proUnlocked: "protocol_pro_unlocked",
  savedScenes: "protocol_saved_scenes",
  completedTracks: "protocol_completed_tracks",
} as const;

const DRAFT_PREFIX = "protocol_draft_";

export type AccentTheme = "crimson" | "burgundy";

export interface SceneDraft {
  partnerAName: string;
  partnerBName: string;
  customTitle: string;
  responses: Record<string, ResponseValue>;
  completedItems: Record<string, boolean>;
  notes: Record<string, string>;
  customLimits: string;
  updatedAt: number;
}

export interface LocalSettingsState {
  discreetMode: boolean;
  accentTheme: AccentTheme;
  proUnlocked: boolean;
  savedScenes: SavedCustomScene[];
  completedTracks: Record<string, boolean>;
}

const DEFAULT_STATE: LocalSettingsState = {
  discreetMode: false,
  accentTheme: "crimson",
  proUnlocked: false,
  savedScenes: [],
  completedTracks: {},
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors in restricted browsing contexts
  }
}

export function loadLocalState(): LocalSettingsState {
  const rawTheme = safeRead<string>(STORAGE_KEYS.accentTheme, DEFAULT_STATE.accentTheme);
  const accentTheme: AccentTheme = rawTheme === "burgundy" ? "burgundy" : "crimson";
  return {
    discreetMode: safeRead<boolean>(STORAGE_KEYS.discreetMode, DEFAULT_STATE.discreetMode),
    accentTheme,
    proUnlocked: safeRead<boolean>(STORAGE_KEYS.proUnlocked, DEFAULT_STATE.proUnlocked),
    savedScenes: safeRead<SavedCustomScene[]>(STORAGE_KEYS.savedScenes, DEFAULT_STATE.savedScenes),
    completedTracks: safeRead<Record<string, boolean>>(
      STORAGE_KEYS.completedTracks,
      DEFAULT_STATE.completedTracks
    ),
  };
}

export function saveDiscreetMode(val: boolean): void {
  safeWrite(STORAGE_KEYS.discreetMode, val);
}

export function saveAccentTheme(val: AccentTheme): void {
  safeWrite(STORAGE_KEYS.accentTheme, val);
}

export function saveProUnlocked(val: boolean): void {
  safeWrite(STORAGE_KEYS.proUnlocked, val);
}

export function savePersonalScenes(scenes: SavedCustomScene[]): void {
  safeWrite(STORAGE_KEYS.savedScenes, scenes);
}

export function saveCompletedTracks(tracks: Record<string, boolean>): void {
  safeWrite(STORAGE_KEYS.completedTracks, tracks);
}

export function loadSceneDraft(sceneId: string): SceneDraft | null {
  return safeRead<SceneDraft | null>(`${DRAFT_PREFIX}${sceneId}`, null);
}

export function saveSceneDraft(sceneId: string, draft: SceneDraft): void {
  safeWrite(`${DRAFT_PREFIX}${sceneId}`, draft);
}

export function clearSceneDraft(sceneId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${DRAFT_PREFIX}${sceneId}`);
}

export function wipeAllLocalData(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key);
  }
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(DRAFT_PREFIX)) {
      toRemove.push(k);
    }
  }
  for (const k of toRemove) {
    window.localStorage.removeItem(k);
  }
}
