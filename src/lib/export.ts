import { MANDATORY_DISCLAIMERS } from "./constants.ts";
import type { ResponseValue, Scene } from "./types.ts";

export interface ExportCustomState {
  customTitle?: string;
  partnerAName?: string;
  partnerBName?: string;
  responses?: Record<string, ResponseValue>;
  completedItems?: Record<string, boolean>;
  notes?: Record<string, string>;
  journalNotes?: string;
}

export function sceneToMarkdown(scene: Scene, custom?: ExportCustomState): string {
  const lines: string[] = [];
  const effectiveTitle = custom?.customTitle?.trim() || scene.title;

  lines.push("---");
  lines.push(`id: ${scene.id}`);
  lines.push(`title: "${effectiveTitle.replace(/"/g, '\\"')}"`);
  lines.push(`category: "${scene.category}"`);
  lines.push(`intensity: ${scene.intensity}`);
  lines.push(`experience_level: ${scene.experience_level}`);
  lines.push(`duration_min: ${scene.duration_min}`);
  lines.push(`duration_max: ${scene.duration_max}`);
  lines.push(`tags: [${scene.tags.join(", ")}]`);
  lines.push("---");
  lines.push("");
  lines.push(`# ${effectiveTitle}`);
  lines.push("");
  lines.push(
    `**Category:** ${scene.category} | **Duration:** ${scene.duration_min}–${scene.duration_max} min | **Intensity:** ${scene.intensity} | **Level:** ${scene.experience_level}`
  );
  lines.push("");

  if (custom?.partnerAName || custom?.partnerBName) {
    lines.push(
      `**Partners:** ${custom.partnerAName || "Partner A"} & ${custom.partnerBName || "Partner B"}`
    );
    lines.push("");
  }

  if (scene.body) {
    lines.push(scene.body);
    lines.push("");
  }

  lines.push("## Materials & Prep");
  lines.push(`- Prep time: ~${scene.prep_time_min} min`);
  for (const mat of scene.materials) {
    lines.push(`- [ ] ${mat}`);
  }
  lines.push("");

  lines.push("## Risk Awareness");
  for (const note of scene.risk_notes) {
    lines.push(`- **Risk Note:** ${note}`);
  }
  lines.push("");

  lines.push("## Negotiation Checklist");
  for (const sec of scene.negotiation.checklist) {
    lines.push(`### ${sec.section}`);
    for (const item of sec.items) {
      const checked = custom?.completedItems?.[item.id] ? "x" : " ";
      const resp = custom?.responses?.[item.id];
      const respBadge = resp ? ` [${resp.toUpperCase()}]` : "";
      const note = custom?.notes?.[item.id]?.trim();
      const noteSuffix = note ? ` — _Note: ${note}_` : "";
      lines.push(`- [${checked}] ${item.label}${respBadge}${noteSuffix}`);
    }
    lines.push("");
  }

  lines.push("## Negotiation Scripts");
  for (const s of scene.negotiation.scripts) {
    lines.push(`- **${s.context}:** "${s.line}"`);
  }
  lines.push("");

  lines.push("## Pre-Scene & Headspace");
  lines.push(`- **Headspace:** ${scene.pre_scene.headspace}`);
  for (const step of scene.pre_scene.steps) {
    lines.push(`- ${step}`);
  }
  lines.push("");

  lines.push("## Beats");
  for (const beat of scene.beats) {
    const ci = beat.check_in ? " *(Check-in)*" : "";
    lines.push(`${beat.order}. **${beat.title}** (${beat.duration_min} min)${ci} — ${beat.description}`);
  }
  lines.push("");

  lines.push("## Variations");
  lines.push(`- **Lighter — ${scene.variations.lighter.title}:** ${scene.variations.lighter.summary}`);
  lines.push(`- **Heavier — ${scene.variations.heavier.title}:** ${scene.variations.heavier.summary}`);
  lines.push("");

  lines.push("## Aftercare");
  for (const item of scene.aftercare.immediate) {
    lines.push(`- **Immediate:** ${item}`);
  }
  for (const item of scene.aftercare.physical) {
    lines.push(`- **Physical:** ${item}`);
  }
  for (const item of scene.aftercare.emotional) {
    lines.push(`- **Emotional:** ${item}`);
  }
  for (const item of scene.aftercare.next_day) {
    lines.push(`- **Next Day:** ${item}`);
  }
  lines.push("");

  lines.push("## Debrief");
  lines.push(`- **Window:** ${scene.debrief.check_in_window}`);
  for (const prompt of scene.debrief.prompts) {
    lines.push(`- ${prompt}`);
  }
  lines.push("");

  if (custom?.journalNotes?.trim()) {
    lines.push("## Private Post-Scene Notes");
    lines.push(custom.journalNotes.trim());
    lines.push("");
  }

  lines.push("---");
  lines.push("## Safety, Consent & Legal Framing");
  for (const line of MANDATORY_DISCLAIMERS) {
    lines.push(`- ${line}`);
  }
  lines.push("");

  return lines.join("\n");
}

export function buildOfflineLibraryMarkdown(scenes: Scene[]): string {
  const header = [
    "# Protocol — Complete Offline Scene Library",
    `Exported ${scenes.length} structured scenes (Obsidian & Markdown compatible).`,
    "",
    "---",
    "",
  ].join("\n");

  return header + scenes.map((s) => sceneToMarkdown(s)).join("\n\n========================================\n\n");
}
