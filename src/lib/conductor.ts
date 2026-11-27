import type { Beat, ResponseValue, Scene } from "./types.ts";

export interface ActiveBeatState {
  activeIndex: number;
  currentBeat: Beat | null;
  nextBeat: Beat | null;
  beatStartSec: number;
  beatElapsedSec: number;
  beatRemainingSec: number;
  beatProgressPct: number;
  totalDurationSec: number;
  overallProgressPct: number;
  completed: boolean;
}

export interface ReadinessSummary {
  total: number;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  unansweredCount: number;
  status: "ready" | "needs-alignment" | "has-hard-no";
  hardNoLabels: string[];
}

export function computeActiveBeat(beats: Beat[], elapsedSec: number): ActiveBeatState {
  if (!beats || beats.length === 0) {
    return {
      activeIndex: -1,
      currentBeat: null,
      nextBeat: null,
      beatStartSec: 0,
      beatElapsedSec: 0,
      beatRemainingSec: 0,
      beatProgressPct: 0,
      totalDurationSec: 0,
      overallProgressPct: 0,
      completed: false,
    };
  }

  const clampedElapsed = Math.max(0, elapsedSec);
  const totalDurationSec = beats.reduce((sum, b) => sum + Math.max(1, b.duration_min) * 60, 0);

  let cursor = 0;
  for (let i = 0; i < beats.length; i++) {
    const beatDurSec = Math.max(1, beats[i].duration_min) * 60;
    const beatEnd = cursor + beatDurSec;
    if (clampedElapsed < beatEnd) {
      const beatElapsedSec = clampedElapsed - cursor;
      const beatRemainingSec = beatEnd - clampedElapsed;
      return {
        activeIndex: i,
        currentBeat: beats[i],
        nextBeat: i + 1 < beats.length ? beats[i + 1] : null,
        beatStartSec: cursor,
        beatElapsedSec,
        beatRemainingSec,
        beatProgressPct: Math.min(100, Math.round((beatElapsedSec / beatDurSec) * 100)),
        totalDurationSec,
        overallProgressPct: Math.min(100, Math.round((clampedElapsed / totalDurationSec) * 100)),
        completed: false,
      };
    }
    cursor = beatEnd;
  }

  const lastIdx = beats.length - 1;
  const lastDurSec = Math.max(1, beats[lastIdx].duration_min) * 60;
  return {
    activeIndex: lastIdx,
    currentBeat: beats[lastIdx],
    nextBeat: null,
    beatStartSec: totalDurationSec - lastDurSec,
    beatElapsedSec: lastDurSec,
    beatRemainingSec: 0,
    beatProgressPct: 100,
    totalDurationSec,
    overallProgressPct: 100,
    completed: true,
  };
}

export function getBeatStartSec(beats: Beat[], targetIndex: number): number {
  let acc = 0;
  const limit = Math.max(0, Math.min(targetIndex, beats.length - 1));
  for (let i = 0; i < limit; i++) {
    acc += Math.max(1, beats[i].duration_min) * 60;
  }
  return acc;
}

export function computeReadinessSummary(
  scene: Scene,
  responses: Record<string, ResponseValue>
): ReadinessSummary {
  let total = 0;
  let yesCount = 0;
  let maybeCount = 0;
  let noCount = 0;
  let unansweredCount = 0;
  const hardNoLabels: string[] = [];

  for (const sec of scene.negotiation.checklist) {
    for (const item of sec.items) {
      total++;
      const val = responses[item.id];
      if (val === "yes") yesCount++;
      else if (val === "maybe") maybeCount++;
      else if (val === "no") {
        noCount++;
        hardNoLabels.push(item.label);
      } else {
        unansweredCount++;
      }
    }
  }

  const status: ReadinessSummary["status"] =
    noCount > 0 ? "has-hard-no" : unansweredCount === 0 && maybeCount === 0 ? "ready" : "needs-alignment";

  return {
    total,
    yesCount,
    maybeCount,
    noCount,
    unansweredCount,
    status,
    hardNoLabels,
  };
}
