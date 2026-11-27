"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Bell, ShieldCheck } from "lucide-react";

export function SceneTimer({ defaultMinutes }: { defaultMinutes: number }) {
  const [running, setRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checkInEveryMin, setCheckInEveryMin] = useState(15);
  const [lastCheckInAck, setLastCheckInAck] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const currentIntervalIndex =
    checkInEveryMin > 0 ? Math.floor(mins / checkInEveryMin) : 0;
  const checkInDue =
    checkInEveryMin > 0 &&
    currentIntervalIndex > 0 &&
    currentIntervalIndex > lastCheckInAck;

  return (
    <div className="no-print rounded-lg border border-[#333333] bg-[#1A1A1A] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#A0A0A0] block">
            In-Scene Timer (Target ~{defaultMinutes}m)
          </span>
          <span className="font-heading text-3xl font-bold tracking-wider text-[#F5F5F0]">
            {formatted}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-[#F5F5F0]"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? "Pause" : "Start"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setElapsedSec(0);
              setLastCheckInAck(0);
            }}
            aria-label="Reset timer"
            className="p-2 rounded-md border border-[#333333] bg-[#242424] text-[#A0A0A0] hover:text-[#F5F5F0]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2A2A2A] text-xs">
        <label className="flex items-center gap-2 text-[#A0A0A0]">
          <Bell className="w-3.5 h-3.5 text-[#C4A35A]" />
          <span>Check-in prompt every:</span>
          <select
            value={checkInEveryMin}
            onChange={(e) => setCheckInEveryMin(Number(e.target.value))}
            className="px-2 py-1 rounded bg-[#242424] border border-[#333333] text-[#F5F5F0]"
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
            <option value={0}>Off</option>
          </select>
        </label>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#88B897]">GREEN: Good</span>
          <span className="text-[#E0C37C]">YELLOW: Adjust</span>
          <span className="text-[#D98282]">RED / 3 Taps: Stop</span>
        </div>
      </div>

      {checkInDue && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-[#C4A35A] bg-[#C4A35A]/15 px-3 py-2 text-xs text-[#E0C37C]">
          <span className="font-medium">
            Check-in window ({mins}m): confirm color, hydration, and comfort.
          </span>
          <button
            type="button"
            onClick={() => setLastCheckInAck(currentIntervalIndex)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#242424] text-[#F5F5F0] border border-[#3E3E3E] shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>Checked</span>
          </button>
        </div>
      )}
    </div>
  );
}
