"use client";

type ToneOpts = {
  freq: number;
  dur: number;
  start?: number;
  vol?: number;
  type?: OscillatorType;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const running: Array<{ stop: () => void }> = [];

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

function beep({ freq, dur, start = 0, vol = 0.15, type = "sine" }: ToneOpts) {
  const c = ensureCtx();
  if (!c || !master) return;
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
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function loopTone(opts: { freq: number; onMS: number; offMS: number; vol?: number }): { stop: () => void } {
  const c = ensureCtx();
  if (!c) return { stop: () => {} };
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const step = (offsetSec: number) => {
    if (stopped) return;
    beep({ freq: opts.freq, dur: opts.onMS / 1000, start: offsetSec, vol: opts.vol, type: "sine" });
    timer = setTimeout(
      () => step(offsetSec + (opts.onMS + opts.offMS) / 1000),
      opts.onMS + opts.offMS
    );
  };

  step(0);
  const handle = { stop: () => { stopped = true; if (timer) clearTimeout(timer); } };
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

export function stopAllSounds(): void {
  for (const handle of running.splice(0)) handle.stop();
}

export function unlockAudio(): void {
  ensureCtx();
}