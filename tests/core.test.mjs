import test from "node:test";
import assert from "node:assert/strict";
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
