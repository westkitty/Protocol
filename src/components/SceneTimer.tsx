"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { computeActiveBeat, getBeatStartSec } from "@/lib/conductor";
import type { Beat } from "@/lib/types";

function playGentleChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.18);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.46);
    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 600);
  } catch {
    // Ignore audio context restrictions
  }
}

export function SceneTimer({
  defaultMinutes,
  beats = [],
  onActiveBeatChange,
}: {
  defaultMinutes: number;
  beats?: Beat[];
  onActiveBeatChange?: (beatIndex: number, isRunning: boolean) => void;
}) {
  const [running, setRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checkInEveryMin, setCheckInEveryMin] = useState(15);
  const [lastCheckInAck, setLastCheckInAck] = useState(0);
  const [chimeEnabled, setChimeEnabled] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const beatState = useMemo(() => computeActiveBeat(beats, elapsedSec), [beats, elapsedSec]);
  const prevBeatIdxRef = useRef<number>(beatState.activeIndex);
  const prevCheckInRef = useRef<boolean>(false);

  useEffect(() => {
    onActiveBeatChange?.(beatState.activeIndex, running);
  }, [beatState.activeIndex, running, onActiveBeatChange]);

  useEffect(() => {
    if (running && chimeEnabled && beatState.activeIndex !== prevBeatIdxRef.current) {
      playGentleChime();
    }
    prevBeatIdxRef.current = beatState.activeIndex;
  }, [beatState.activeIndex, running, chimeEnabled]);

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const remMins = Math.floor(beatState.beatRemainingSec / 60);
  const remSecs = beatState.beatRemainingSec % 60;
  const beatRemainingFormatted = `${String(remMins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;

  const currentIntervalIndex =
    checkInEveryMin > 0 ? Math.floor(mins / checkInEveryMin) : 0;
  const checkInDue =
    checkInEveryMin > 0 &&
    currentIntervalIndex > 0 &&
    currentIntervalIndex > lastCheckInAck;

  useEffect(() => {
    if (running && chimeEnabled && checkInDue && !prevCheckInRef.current) {
      playGentleChime();
    }
    prevCheckInRef.current = checkInDue;
  }, [checkInDue, running, chimeEnabled]);

  const handleJumpBeat = (delta: number) => {
    if (beats.length === 0) return;
    const target = Math.max(0, Math.min(beats.length - 1, beatState.activeIndex + delta));
    setElapsedSec(getBeatStartSec(beats, target));
  };

  return (
    <div className="no-print card-elevated rounded-lg border border-[#27272F] bg-[#101014] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#A6A6B2] block">
            Scene Conductor (Target ~{defaultMinutes}m)
          </span>
          <span className="font-heading text-3xl font-bold tracking-wider text-[#F5F5F7]">
            {formatted}
          </span>
        </div>

        <div className="flex items-center gap-1.5 glow-rail">
          {beats.length > 1 && (
            <button
              type="button"
              onClick={() => handleJumpBeat(-1)}
              disabled={beatState.activeIndex <= 0}
              aria-label="Previous beat"
              title="Previous beat"
              className="glow-neighbor min-h-[44px] min-w-[40px] flex items-center justify-center rounded-md text-[#A6A6B2] hover:text-[#F5F5F7] disabled:opacity-40"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="btn-red inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-md text-xs font-semibold"
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? "Pause" : "Start"}</span>
          </button>
          {beats.length > 1 && (
            <button
              type="button"
              onClick={() => handleJumpBeat(1)}
              disabled={beatState.activeIndex >= beats.length - 1}
              aria-label="Next beat"
              title="Next beat"
              className="glow-neighbor min-h-[44px] min-w-[40px] flex items-center justify-center rounded-md text-[#A6A6B2] hover:text-[#F5F5F7] disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setElapsedSec(0);
              setLastCheckInAck(0);
            }}
            aria-label="Reset timer"
            title="Reset timer"
            className="glow-neighbor min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-[#A6A6B2] hover:text-[#F5F5F7]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Beat-Synced Conductor Strip */}
      {beatState.currentBeat && (
        <div className="rounded-md border border-[#27272F] bg-[#17171C] p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#F5F5F7] truncate">
              Beat {beatState.activeIndex + 1}/{beats.length}: {beatState.currentBeat.title}
            </span>
            <span className="text-[#F87171] font-mono shrink-0">
              {beatState.completed ? "Complete" : `-${beatRemainingFormatted}`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#070709] overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_var(--accent-glow)]"
              style={{
                width: `${beatState.beatProgressPct}%`,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>
          {beatState.nextBeat && (
            <div className="text-[11px] text-[#A6A6B2] truncate">
              Next: {beatState.nextBeat.title} ({beatState.nextBeat.duration_min}m)
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1F1F27] text-xs">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[#A6A6B2]">
            <Bell className="w-3.5 h-3.5 text-[#C4A35A]" />
            <span>Check-in:</span>
            <select
              value={checkInEveryMin}
              onChange={(e) => setCheckInEveryMin(Number(e.target.value))}
              className="px-2 py-1 min-h-[34px] rounded bg-[#17171C] border border-[#27272F] text-[#F5F5F7]"
            >
              <option value={15}>15m</option>
              <option value={30}>30m</option>
              <option value={60}>60m</option>
              <option value={0}>Off</option>
            </select>
          </label>

          <button
            type="button"
            aria-pressed={chimeEnabled}
            onClick={() => setChimeEnabled((c) => !c)}
            title="Toggle gentle audio chime on beat transitions and check-ins"
            className={`inline-flex items-center gap-1 px-2.5 min-h-[34px] rounded border text-[11px] ${
              chimeEnabled
                ? "border-[#C41E2E]/70 bg-[#C41E2E]/20 text-[#FCA5A5]"
                : "border-[#27272F] bg-[#17171C] text-[#A6A6B2]"
            }`}
          >
            {chimeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Chime</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="text-[#88B897]">GREEN</span>
          <span className="text-[#E0C37C]">YELLOW</span>
          <span className="text-[#F87171]">RED / 3 Taps</span>
        </div>
      </div>

      {checkInDue && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 rounded-md border border-[#C4A35A] bg-[#C4A35A]/15 px-3 py-2 text-xs text-[#E0C37C]"
        >
          <span className="font-medium">
            Check-in window ({mins}m): confirm color, hydration, and comfort.
          </span>
          <button
            type="button"
            onClick={() => setLastCheckInAck(currentIntervalIndex)}
            className="glow-neighbor inline-flex items-center gap-1 px-3 min-h-[36px] rounded text-[#F5F5F7] shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>Checked</span>
          </button>
        </div>
      )}
    </div>
  );
}
