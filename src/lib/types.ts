export type Intensity = "light" | "medium" | "heavy" | "progressive";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type SceneTier = "free" | "pro";
export type ResponseValue = "yes" | "maybe" | "no";

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

export interface ChecklistSection {
  section: string;
  items: ChecklistItem[];
}

export interface ScriptItem {
  context: string;
  line: string;
}

export interface Beat {
  order: number;
  title: string;
  duration_min: number;
  description: string;
  check_in?: boolean;
}

export interface Variation {
  title: string;
  summary: string;
  adjustments: string[];
}

export interface Scene {
  id: string;
  title: string;
  discreet_title: string;
  category: string;
  category_slug: string;
  subcategory: string;
  duration_min: number;
  duration_max: number;
  intensity: Intensity;
  roles: string[];
  experience_level: ExperienceLevel;
  tier: SceneTier;
  materials: string[];
  prep_time_min: number;
  risk_notes: string[];
  negotiation: {
    checklist: ChecklistSection[];
    scripts: ScriptItem[];
  };
  pre_scene: {
    steps: string[];
    headspace: string;
  };
  beats: Beat[];
  variations: {
    lighter: Variation;
    heavier: Variation;
  };
  aftercare: {
    immediate: string[];
    physical: string[];
    emotional: string[];
    next_day: string[];
  };
  debrief: {
    prompts: string[];
    check_in_window: string;
  };
  tags: string[];
  body: string;
}

export interface CategoryMeta {
  slug: string;
  name: string;
  discreetName: string;
  description: string;
  icon: string;
}

export interface SharePayload {
  v: 1;
  sceneId: string;
  partnerAName: string;
  createdAt: number;
  expiresAt: number;
  responses: Record<string, ResponseValue>;
  notes: Record<string, string>;
  customLimits: string;
}

export interface SavedCustomScene {
  id: string;
  sceneId: string;
  customTitle: string;
  partnerAName: string;
  partnerBName: string;
  responses: Record<string, ResponseValue>;
  completedItems: Record<string, boolean>;
  notes: Record<string, string>;
  journalNotes: string;
  updatedAt: number;
}

export type ResourceKind = "language-pack" | "task-library";

export interface ResourceDocument {
  id: string;
  title: string;
  category: string;
  category_slug: string;
  tier: SceneTier;
  tags: string[];
  kind: ResourceKind;
  body: string;
}
