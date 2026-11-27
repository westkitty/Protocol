import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "scenes");

const VALID_INTENSITIES = new Set(["light", "medium", "heavy", "progressive"]);
const VALID_EXPERIENCE = new Set(["beginner", "intermediate", "advanced"]);
const VALID_TIERS = new Set(["free", "pro"]);

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results.sort();
}

export function validateAllScenes() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Missing content directory: ${CONTENT_DIR}`);
  }
  const files = walk(CONTENT_DIR);
  const errors = [];
  const seenIds = new Set();

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const d = parsed.data;

    const reqStrings = [
      "id",
      "title",
      "discreet_title",
      "category",
      "category_slug",
      "subcategory",
    ];
    for (const key of reqStrings) {
      if (typeof d[key] !== "string" || d[key].trim().length === 0) {
        errors.push(`${rel}: missing or empty string field '${key}'`);
      }
    }

    if (d.id) {
      if (seenIds.has(d.id)) {
        errors.push(`${rel}: duplicate id '${d.id}'`);
      }
      seenIds.add(d.id);
    }

    if (!VALID_INTENSITIES.has(d.intensity)) {
      errors.push(`${rel}: invalid intensity '${d.intensity}'`);
    }
    if (!VALID_EXPERIENCE.has(d.experience_level)) {
      errors.push(`${rel}: invalid experience_level '${d.experience_level}'`);
    }
    if (!VALID_TIERS.has(d.tier)) {
      errors.push(`${rel}: invalid tier '${d.tier}'`);
    }
    if (typeof d.duration_min !== "number" || typeof d.duration_max !== "number") {
      errors.push(`${rel}: duration_min and duration_max must be numbers`);
    }
    if (typeof d.prep_time_min !== "number") {
      errors.push(`${rel}: prep_time_min must be a number`);
    }
    for (const arrField of ["roles", "materials", "risk_notes", "tags"]) {
      if (!Array.isArray(d[arrField]) || d[arrField].length === 0) {
        errors.push(`${rel}: '${arrField}' must be a non-empty array`);
      } else if (d[arrField].some((item) => typeof item !== "string")) {
        errors.push(`${rel}: '${arrField}' must contain only strings`);
      }
    }

    if (
      !d.negotiation ||
      !Array.isArray(d.negotiation.checklist) ||
      d.negotiation.checklist.length === 0
    ) {
      errors.push(`${rel}: negotiation.checklist must be non-empty`);
    } else {
      for (const sec of d.negotiation.checklist) {
        if (!sec.section || !Array.isArray(sec.items) || sec.items.length === 0) {
          errors.push(`${rel}: checklist section '${sec.section}' must have items`);
        }
      }
    }

    if (!d.negotiation || !Array.isArray(d.negotiation.scripts) || d.negotiation.scripts.length === 0) {
      errors.push(`${rel}: negotiation.scripts must be non-empty`);
    }

    if (!d.pre_scene || !Array.isArray(d.pre_scene.steps) || d.pre_scene.steps.length === 0 || !d.pre_scene.headspace) {
      errors.push(`${rel}: pre_scene must include steps and headspace`);
    }

    if (!Array.isArray(d.beats) || d.beats.length === 0) {
      errors.push(`${rel}: beats must be non-empty`);
    }

    if (!d.variations || !d.variations.lighter || !d.variations.heavier) {
      errors.push(`${rel}: variations.lighter and variations.heavier are required`);
    } else {
      for (const key of ["lighter", "heavier"]) {
        const variation = d.variations[key];
        if (typeof variation.title !== "string" || !variation.title.trim()) {
          errors.push(`${rel}: variations.${key}.title is required`);
        }
        if (typeof variation.summary !== "string" || !variation.summary.trim()) {
          errors.push(`${rel}: variations.${key}.summary is required`);
        }
        if (!Array.isArray(variation.adjustments) || variation.adjustments.length === 0) {
          errors.push(`${rel}: variations.${key}.adjustments must be a non-empty array`);
        }
      }
    }

    if (!d.aftercare) {
      errors.push(`${rel}: aftercare is required`);
    } else {
      for (const key of ["immediate", "physical", "emotional", "next_day"]) {
        if (!Array.isArray(d.aftercare[key]) || d.aftercare[key].length === 0) {
          errors.push(`${rel}: aftercare.${key} must be a non-empty array`);
        }
      }
    }

    if (
      !d.debrief ||
      !Array.isArray(d.debrief.prompts) ||
      d.debrief.prompts.length === 0 ||
      !d.debrief.check_in_window
    ) {
      errors.push(`${rel}: debrief must include prompts and check_in_window`);
    }

    if (!parsed.content || parsed.content.trim().length < 20) {
      errors.push(`${rel}: markdown body must be at least 20 characters`);
    }
  }

  return { count: files.length, errors };
}

const PACK_DIR = path.join(process.cwd(), "content", "language-packs");
const TASK_DIR = path.join(process.cwd(), "content", "task-libraries");

function validateResourceDir(dir, kindLabel) {
  const errors = [];
  const items = [];
  if (!fs.existsSync(dir)) {
    errors.push(`Missing content directory: ${dir}`);
    return { count: 0, errors, items };
  }
  const files = walk(dir);
  const seenIds = new Set();

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const d = parsed.data;

    for (const key of ["id", "title", "category", "category_slug"]) {
      if (typeof d[key] !== "string" || d[key].trim().length === 0) {
        errors.push(`${rel}: missing or empty string field '${key}'`);
      }
    }
    if (!VALID_TIERS.has(d.tier)) {
      errors.push(`${rel}: invalid tier '${d.tier}'`);
    }
    if (!Array.isArray(d.tags) || d.tags.length === 0) {
      errors.push(`${rel}: 'tags' must be a non-empty array`);
    } else if (d.tags.some((item) => typeof item !== "string")) {
      errors.push(`${rel}: 'tags' must contain only strings`);
    }
    if (d.id) {
      if (seenIds.has(d.id)) {
        errors.push(`${rel}: duplicate id '${d.id}'`);
      }
      seenIds.add(d.id);
    }
    if (!parsed.content || parsed.content.trim().length < 20) {
      errors.push(`${rel}: markdown body must be at least 20 characters`);
    }
    items.push({ id: d.id, rel, kind: kindLabel });
  }

  return { count: files.length, errors, items };
}

export function validateAllLanguagePacks() {
  return validateResourceDir(PACK_DIR, "language-pack");
}

export function validateAllTaskLibraries() {
  return validateResourceDir(TASK_DIR, "task-library");
}

export function validateAllContent() {
  const scenes = validateAllScenes();
  const packs = validateAllLanguagePacks();
  const tasks = validateAllTaskLibraries();
  const errors = [...scenes.errors, ...packs.errors, ...tasks.errors];

  const seen = new Map();
  const collectIds = (files, dirLabel) => {
    if (!fs.existsSync(dirLabel === "scenes" ? CONTENT_DIR : dirLabel === "language-packs" ? PACK_DIR : TASK_DIR)) {
      return;
    }
    const dir = dirLabel === "scenes" ? CONTENT_DIR : dirLabel === "language-packs" ? PACK_DIR : TASK_DIR;
    for (const file of walk(dir)) {
      const rel = path.relative(process.cwd(), file);
      const parsed = matter(fs.readFileSync(file, "utf8"));
      const id = parsed.data.id;
      if (!id) continue;
      if (seen.has(id)) {
        errors.push(`${rel}: duplicate id '${id}' (also in ${seen.get(id)})`);
      } else {
        seen.set(id, rel);
      }
    }
  };
  collectIds(null, "scenes");
  collectIds(null, "language-packs");
  collectIds(null, "task-libraries");

  return {
    scenes: scenes.count,
    languagePacks: packs.count,
    taskLibraries: tasks.count,
    errors,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateAllContent();
  const total = result.scenes + result.languagePacks + result.taskLibraries;
  if (result.errors.length > 0) {
    console.error(`Validation failed (${result.errors.length} errors across ${total} files):`);
    for (const err of result.errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }
  console.log(
    `Validated ${result.scenes} scenes, ${result.languagePacks} language packs, and ${result.taskLibraries} task libraries successfully (0 errors).`
  );
}

