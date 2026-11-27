import LZString from "lz-string";
import { SHARE_EXPIRY_MS } from "./constants.ts";
import type { ResponseValue, SharePayload } from "./types.ts";

export type ComparisonStatus = "mutual-yes" | "conditional" | "hard-no";

export function createSharePayload(input: {
  sceneId: string;
  partnerAName: string;
  responses: Record<string, ResponseValue>;
  notes: Record<string, string>;
  customLimits?: string;
  now?: number;
}): SharePayload {
  const createdAt = input.now ?? Date.now();
  return {
    v: 1,
    sceneId: input.sceneId,
    partnerAName: input.partnerAName.trim() || "Partner A",
    createdAt,
    expiresAt: createdAt + SHARE_EXPIRY_MS,
    responses: input.responses,
    notes: input.notes,
    customLimits: input.customLimits?.trim() || "",
  };
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const clean = encoded.replace(/^#?share=/, "").trim();
    if (!clean) return null;
    const json = LZString.decompressFromEncodedURIComponent(clean);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharePayload;
    if (parsed.v !== 1 || !parsed.sceneId || typeof parsed.expiresAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isShareExpired(payload: SharePayload, now: number = Date.now()): boolean {
  return now > payload.expiresAt;
}

export function comparePartnerResponses(
  a: ResponseValue | undefined,
  b: ResponseValue | undefined
): ComparisonStatus {
  if (a === "no" || b === "no") {
    return "hard-no";
  }
  if (a === "yes" && b === "yes") {
    return "mutual-yes";
  }
  return "conditional";
}
