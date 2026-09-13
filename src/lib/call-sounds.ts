"use client";

type BeepOpts = {
  freq: number;
  dur: number;
  start?: number;
  vol?: number;
  type?: OscillatorType;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

type Live = {
  osc: OscillatorNode;
  gain: GainNode;
  startedAt: number;
};

const live = new Set<Live>();

function silence(entry: Live): void {
  live.delete(entry);
  entry.osc.onended = null;
  const now = ctx ? ctx.currentTime : performance.now() / 1000;
  const param = entry.gain.gain;
  try {
    param.cancelAndHoldAtTime(now);
  } catch {
    try {
      param.cancelScheduledValues(now);
    } catch {
      /* never */
    }
  }
  try {
    param.setValueAtTime(0.0001, now + 0.005);
  } catch {
    /* never */
  }
  try {
    entry.gain.disconnect();
  } catch {
    /* never */
  }
  if (entry.startedAt < now) {
    try {
      entry.osc.stop();
    } catch {
      /* already stopped or not started */
    }
  }
}

function beep({ freq, dur, start = 0, vol = 0.15, type = "sine" }: BeepOpts): Live | null {
  const c = ensureCtx();
  if (!c || !master) return null;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.setValueAtTime(vol, t0 + Math.max(dur - 0.04, 0.01));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  const entry: Live = { osc, gain, startedAt: t0 };
  live.add(entry);
  osc.onended = () => live.delete(entry);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
  return entry;
}

type LoopOpts = { freq: number; onMS: number; offMS: number; vol?: number };

function loopTone({ freq, onMS, offMS, vol }: LoopOpts): { stop: () => void } {
  const c = ensureCtx();
  if (!c) return { stop: () => {} };
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let current: Live | null = null;

  const step = (offsetSec: number) => {
    if (stopped) return;
    current = beep({ freq, dur: onMS / 1000, start: offsetSec, vol, type: "sine" });
    timer = setTimeout(() => step(offsetSec + (onMS + offMS) / 1000), onMS + offMS);
  };

  step(0);

  const handle = {
    stop: () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (current) silence(current);
    },
  };
  running.push(handle);
  return handle;
}

export function playIncomingRing(): { stop: () => void } {
  return loopTone({ freq: 620, onMS: 800, offMS: 2400, vol: 0.2 });
}

export function playOutgoingRingback(): { stop: () => void } {
  return loopTone({ freq: 425, onMS: 800, offMS: 2400, vol: 0.08 });
}

export function playBusy(): { stop: () => void } {
  return loopTone({ freq: 480, onMS: 450, offMS: 500, vol: 0.14 });
}

export function playConnected(): void {
  beep({ freq: 800, dur: 0.14, vol: 0.16 });
  beep({ freq: 800, dur: 0.14, start: 0.18, vol: 0.16 });
}

export function playHangup(): void {
  beep({ freq: 740, dur: 0.12, vol: 0.16 });
  beep({ freq: 494, dur: 0.16, start: 0.16, vol: 0.16 });
}

const running: Array<{ stop: () => void }> = [];

export function stopAllSounds(): void {
  for (const handle of running.splice(0)) handle.stop();
  for (const entry of Array.from(live)) silence(entry);
}

export function unlockAudio(): void {
  ensureCtx();
}