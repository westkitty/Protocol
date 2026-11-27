import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validateAllScenes } from "../scripts/validate-scenes.mjs";
import {
  comparePartnerResponses,
  createSharePayload,
  decodeSharePayload,
  encodeSharePayload,
  isShareExpired,
} from "../src/lib/share.ts";
import { MANDATORY_DISCLAIMERS, SHARE_EXPIRY_MS } from "../src/lib/constants.ts";
import { sceneToMarkdown } from "../src/lib/export.ts";
import { getAllScenes } from "../src/lib/scenes.ts";
import {
  computeActiveBeat,
  computeReadinessSummary,
  getBeatStartSec,
} from "../src/lib/conductor.ts";
import { validateImportedBackup } from "../src/lib/storage.ts";

test("all 49 scene markdown templates pass schema validation", () => {
  const { count, errors } = validateAllScenes();
  assert.equal(count, 49);
  assert.deepEqual(errors, []);
});

test("share payload round-trip encode/decode preserves fields", () => {
  const now = 1_700_000_000_000;
  const payload = createSharePayload({
    sceneId: "handler-inspection-gear-up-ritual",
    partnerAName: "Alex",
    responses: { "hi-gear-list": "yes", "hi-depth": "maybe" },
    notes: { "hi-depth": "Visual + clothed touch first" },
    customLimits: "No marks on neck",
    now,
  });

  const encoded = encodeSharePayload(payload);
  assert.ok(encoded.length > 10);

  const decoded = decodeSharePayload(`#share=${encoded}`);
  assert.ok(decoded);
  assert.equal(decoded.sceneId, "handler-inspection-gear-up-ritual");
  assert.equal(decoded.partnerAName, "Alex");
  assert.equal(decoded.responses["hi-gear-list"], "yes");
  assert.equal(decoded.responses["hi-depth"], "maybe");
  assert.equal(decoded.notes["hi-depth"], "Visual + clothed touch first");
  assert.equal(decoded.customLimits, "No marks on neck");
  assert.equal(decoded.expiresAt, now + SHARE_EXPIRY_MS);
});

test("share payload expiration enforces 72h boundary", () => {
  const now = 1_700_000_000_000;
  const payload = createSharePayload({
    sceneId: "full-scene-negotiation-framework",
    partnerAName: "Sam",
    responses: {},
    notes: {},
    now,
  });

  assert.equal(isShareExpired(payload, now + SHARE_EXPIRY_MS - 1), false);
  assert.equal(isShareExpired(payload, now + SHARE_EXPIRY_MS), false);
  assert.equal(isShareExpired(payload, now + SHARE_EXPIRY_MS + 1), true);
});

test("partner response comparison matrix handles mutual-yes, conditional, and hard-no", () => {
  assert.equal(comparePartnerResponses("yes", "yes"), "mutual-yes");
  assert.equal(comparePartnerResponses("yes", "maybe"), "conditional");
  assert.equal(comparePartnerResponses("maybe", "yes"), "conditional");
  assert.equal(comparePartnerResponses("maybe", "maybe"), "conditional");
  assert.equal(comparePartnerResponses("yes", undefined), "conditional");
  assert.equal(comparePartnerResponses("no", "yes"), "hard-no");
  assert.equal(comparePartnerResponses("yes", "no"), "hard-no");
  assert.equal(comparePartnerResponses("no", "maybe"), "hard-no");
  assert.equal(comparePartnerResponses("no", "no"), "hard-no");
});

test("markdown export includes YAML frontmatter and all 4 mandatory disclaimers", () => {
  const scenes = getAllScenes();
  assert.equal(scenes.length, 49);
  const sample = scenes[0];
  const md = sceneToMarkdown(sample, {
    partnerAName: "Jordan",
    partnerBName: "Taylor",
    responses: {},
    completedItems: {},
    notes: {},
    journalNotes: "Great calibration.",
  });

  assert.ok(md.startsWith("---\n"));
  assert.ok(md.includes(`id: ${sample.id}`));
  assert.ok(md.includes("Jordan & Taylor"));
  assert.ok(md.includes("Great calibration."));
  for (const disclaimer of MANDATORY_DISCLAIMERS) {
    assert.ok(md.includes(disclaimer), `Missing disclaimer: ${disclaimer}`);
  }
});

test("physical visual assets and manifest exist and are valid", () => {
  const iconPath = path.join(process.cwd(), "src", "app", "icon.svg");
  const heroPath = path.join(process.cwd(), "public", "assets", "hero-leather-grid.svg");
  const manifestPath = path.join(process.cwd(), "public", "assets", "manifest.json");

  const iconSvg = fs.readFileSync(iconPath, "utf8");
  const heroSvg = fs.readFileSync(heroPath, "utf8");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.ok(iconSvg.includes("<svg") && iconSvg.includes("#C41E2E"));
  assert.ok(heroSvg.includes("<svg") && heroSvg.includes("stitchedGrid"));
  assert.equal(manifest.physicalAssets.length, 2);
  assert.equal(manifest.componentAssets.length, 4);
});

test("computeActiveBeat tracks beat transitions, boundaries, and overtime accurately", () => {
  const beats = [
    { order: 1, title: "Warm-Up", duration_min: 10, description: "Start slow" },
    { order: 2, title: "Peak", duration_min: 15, description: "Build intensity", check_in: true },
    { order: 3, title: "Cool-Down", duration_min: 5, description: "Ground" },
  ];

  const start = computeActiveBeat(beats, 0);
  assert.equal(start.activeIndex, 0);
  assert.equal(start.currentBeat?.title, "Warm-Up");
  assert.equal(start.nextBeat?.title, "Peak");
  assert.equal(start.beatRemainingSec, 600);
  assert.equal(start.completed, false);

  const exactBoundary = computeActiveBeat(beats, 600);
  assert.equal(exactBoundary.activeIndex, 1);
  assert.equal(exactBoundary.currentBeat?.title, "Peak");
  assert.equal(exactBoundary.beatRemainingSec, 900);

  const jumpStart = getBeatStartSec(beats, 2);
  assert.equal(jumpStart, 1500);

  const done = computeActiveBeat(beats, 1900);
  assert.equal(done.completed, true);
  assert.equal(done.activeIndex, 2);
  assert.equal(done.overallProgressPct, 100);
});

test("computeReadinessSummary distinguishes ready, needs-alignment, and hard-no states", () => {
  const scene = getAllScenes().find((s) => s.id === "full-scene-negotiation-framework");
  assert.ok(scene);

  const empty = computeReadinessSummary(scene, {});
  assert.equal(empty.status, "needs-alignment");
  assert.equal(empty.unansweredCount, empty.total);

  const allYesMap = {};
  for (const sec of scene.negotiation.checklist) {
    for (const item of sec.items) {
      allYesMap[item.id] = "yes";
    }
  }
  const ready = computeReadinessSummary(scene, allYesMap);
  assert.equal(ready.status, "ready");
  assert.equal(ready.yesCount, ready.total);

  const firstId = scene.negotiation.checklist[0].items[0].id;
  const withNo = computeReadinessSummary(scene, { ...allYesMap, [firstId]: "no" });
  assert.equal(withNo.status, "has-hard-no");
  assert.equal(withNo.noCount, 1);
  assert.equal(withNo.hardNoLabels.length, 1);
});

test("validateImportedBackup rejects malformed payloads with field-level errors", () => {
  assert.equal(validateImportedBackup({ not: "array" }).ok, false);
  assert.equal(validateImportedBackup([{ id: "x" }]).ok, false);

  const valid = validateImportedBackup([
    {
      id: "saved-1",
      sceneId: "full-scene-negotiation-framework",
      customTitle: "Friday Session",
      partnerAName: "Alex",
      partnerBName: "Sam",
      responses: {},
      completedItems: {},
      notes: {},
      journalNotes: "",
      updatedAt: 1700000000000,
    },
  ]);
  assert.equal(valid.ok, true);
});
