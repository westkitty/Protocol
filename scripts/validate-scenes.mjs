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
    }

    if (
      !d.aftercare ||
      !Array.isArray(d.aftercare.immediate) ||
      d.aftercare.immediate.length === 0
    ) {
      errors.push(`${rel}: aftercare.immediate must be non-empty`);
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const { count, errors } = validateAllScenes();
  if (errors.length > 0) {
    console.error(`Validation failed (${errors.length} errors across ${count} files):`);
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }
  console.log(`Validated ${count} scenes successfully (0 errors).`);
}
