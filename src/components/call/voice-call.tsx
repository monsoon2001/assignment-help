"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  playIncomingRing,
  playOutgoingRingback,
  playBusy,
  playConnected,
  playHangup,
  stopAllSounds,
  unlockAudio,
} from "@/lib/call-sounds";
import { Phone, PhoneOff, Mic, MicOff, Loader2, Minimize2, Maximize2 } from "lucide-react";
import Avatar from "@/components/ui/avatar";

export type CallPeer = { id: string; name: string; avatarUrl?: string | null };

export type CallPhase =
  | "idle"
  | "outgoing"
  | "incoming"
  | "active"
  | "declined"
  | "busy"
  | "no-answer"
  | "ended"
  | "failed";

type Signal =
  | {
      kind: "call";
      call: string;
      to: string;
      from: string;
      fromName?: string;
      fromAvatar?: string | null;
      sdp: string;
    }
  | { kind: "answer"; call: string; to: string; from: string; sdp: string }
  | { kind: "ice"; call: string; to: string; from: string; candidate: RTCIceCandidateInit }
  | { kind: "end"; call: string; to: string; from: string }
  | { kind: "decline"; call: string; to: string; from: string }
  | { kind: "no-answer"; call: string; to: string; from: string }
  | { kind: "busy"; call: string; to: string; from: string }
  | { kind: "mute"; call: string; to: string; from: string; muted: boolean };

type VoiceCallApi = {
  phase: CallPhase;
  peer: CallPeer | null;
  seconds: number;
  muted: boolean;
  peerMuted: boolean;
  error: string | null;
  adminPeer: CallPeer | null;
  minimized: boolean;
  startCall: (peer: CallPeer) => Promise<void>;
  accept: () => Promise<void>;
  decline: () => void;
  end: () => void;
  toggleMute: () => void;
  minimize: () => void;
  restore: () => void;
};

const VoiceCallContext = createContext<VoiceCallApi | null>(null);

export function useVoiceCall(): VoiceCallApi {
  const ctx = useContext(VoiceCallContext);
  if (!ctx) throw new Error("useVoiceCall must be used within a VoiceCallProvider");
  return ctx;
}

const CALL_CHANNEL = "admin-support-call";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceCallProvider({
  role,
  children,
}: {
  role: "admin" | "helper";
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [peerMuted, setPeerMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminPeer, setAdminPeer] = useState<CallPeer | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [windowPos, setWindowPos] = useState<{ x: number; y: number } | null>(null);

  const supabase = createClient();
  const phaseRef = useRef<CallPhase>("idle");
  const prevPhaseRef = useRef<CallPhase>("idle");
  const soundStopRef = useRef<{ stop: () => void } | null>(null);
  const callIdRef = useRef<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingOfferRef = useRef<string | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const meRef = useRef<string | null>(null);
  const myNameRef = useRef<string>("Support");
  const myAvatarRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const noAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logIdRef = useRef<string | null>(null);
  const answeredAtRef = useRef<number | null>(null);

  const setPhaseBoth = useCallback((p: CallPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const recordLog = useCallback(
    async (row: {
      caller_id: string;
      callee_id: string;
      direction: "outgoing" | "incoming";
      status: string;
    }): Promise<string | null> => {
      try {
        const { data, error } = await supabase
          .from("call_logs")
          .insert(row)
          .select("id")
          .single();
        if (error) throw error;
        logIdRef.current = data?.id ?? null;
        return data?.id ?? null;
      } catch {
        logIdRef.current = null;
        return null;
      }
    },
    [supabase]
  );

  const patchLog = useCallback(
    (patch: {
      status?: string;
      answered_at?: string | null;
      ended_at?: string | null;
      duration_seconds?: number;
    }) => {
      const id = logIdRef.current;
      if (!id) return;
      void (async () => {
        try {
          await supabase.from("call_logs").update(patch).eq("id", id);
        } catch {
          /* non-fatal */
        }
      })();
    },
    [supabase]
  );

  const clearLog = useCallback(() => {
    logIdRef.current = null;
    answeredAtRef.current = null;
  }, []);

  const durationSinceAnswer = useCallback(() => {
    const a = answeredAtRef.current;
    if (!a) return 0;
    return Math.max(0, Math.round((Date.now() - a) / 1000));
  }, []);

  const send = useCallback((signal: Signal) => {
    void channelRef.current?.send({ type: "broadcast", event: "call-signal", payload: signal });
  }, []);

  const cleanup = useCallback(() => {
    if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
    if (autoIdleTimerRef.current) clearTimeout(autoIdleTimerRef.current);
    noAnswerTimerRef.current = null;
    autoIdleTimerRef.current = null;
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    pendingOfferRef.current = null;
    callIdRef.current = null;
    peerRef.current = null;
    clearLog();
    setSeconds(0);
    setMuted(false);
    setPeerMuted(false);
    setMinimized(false);
    if (soundStopRef.current) {
      soundStopRef.current.stop();
      soundStopRef.current = null;
    }
    stopAllSounds();
  }, [clearLog]);

  const autoIdle = useCallback(
    (p: "declined" | "busy" | "no-answer" | "ended" | "failed") => {
      setPhaseBoth(p);
      autoIdleTimerRef.current = setTimeout(() => setPhaseBoth("idle"), 3000);
    },
    [setPhaseBoth]
  );

  const handleSignal = useCallback(
    async (payload: unknown) => {
      const sig = payload as Signal | undefined;
      const me = meRef.current;
      if (!me || !sig || !("call" in sig)) return;
      if (sig.to !== me || sig.from === me) return;

      switch (sig.kind) {
        case "call": {
          if (phaseRef.current !== "idle") {
            send({ kind: "busy", call: sig.call, to: sig.from, from: me });
            return;
          }
          callIdRef.current = sig.call;
          pendingOfferRef.current = sig.sdp;
          peerRef.current = { id: sig.from, name: sig.fromName ?? "PeerCraft Support", avatarUrl: sig.fromAvatar ?? null };
          setPeer(peerRef.current);
          setPeerMuted(false);
          setPhaseBoth("incoming");
          noAnswerTimerRef.current = setTimeout(() => {
            if (phaseRef.current === "incoming") {
              send({ kind: "no-answer", call: callIdRef.current ?? "", to: peerRef.current?.id ?? "", from: meRef.current ?? "" });
              cleanup();
              setPhaseBoth("idle");
            }
          }, 45000);
          break;
        }
        case "answer": {
          if (phaseRef.current !== "outgoing" || callIdRef.current !== sig.call) return;
          try {
            await pcRef.current?.setRemoteDescription(
              new RTCSessionDescription({ type: "answer", sdp: sig.sdp })
            );
          } catch {
            cleanup();
            autoIdle("failed");
            return;
          }
          if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
          answeredAtRef.current = Date.now();
          patchLog({ status: "answered", answered_at: new Date().toISOString() });
          setPhaseBoth("active");
          break;
        }
        case "ice": {
          if (callIdRef.current !== sig.call) return;
          try {
            await pcRef.current?.addIceCandidate(sig.candidate);
          } catch {
            /* best effort */
          }
          break;
        }
        case "end": {
          if (callIdRef.current !== sig.call) return;
          if (phaseRef.current === "active") {
            patchLog({
              status: "answered",
              ended_at: new Date().toISOString(),
              duration_seconds: durationSinceAnswer(),
            });
          } else {
            patchLog({ status: "cancelled", ended_at: new Date().toISOString() });
          }
          cleanup();
          autoIdle("ended");
          break;
        }
        case "decline": {
          if (callIdRef.current !== sig.call) return;
          patchLog({ status: "declined", ended_at: new Date().toISOString() });
          cleanup();
          autoIdle("declined");
          break;
        }
        case "no-answer": {
          if (callIdRef.current !== sig.call) return;
          patchLog({ status: "missed", ended_at: new Date().toISOString() });
          cleanup();
          autoIdle("no-answer");
          break;
        }
        case "busy": {
          if (callIdRef.current !== sig.call) return;
          patchLog({ status: "busy", ended_at: new Date().toISOString() });
          cleanup();
          autoIdle("busy");
          break;
        }
        case "mute": {
          if (callIdRef.current !== sig.call || phaseRef.current !== "active") return;
          setPeerMuted(sig.muted === true);
          break;
        }
        default:
          break;
      }
    },
    [autoIdle, cleanup, durationSinceAnswer, patchLog, send, setPhaseBoth]
  );

  useEffect(() => {
    const client = supabase;
    let alive = true;

    void (async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user || !alive) return;
      meRef.current = user.id;

      const { data: profile } = await client
        .from("users")
        .select("name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();
      const row = Array.isArray(profile) ? profile[0] : profile;
      myNameRef.current = row?.name ?? user.email ?? "Support";
      myAvatarRef.current = row?.avatar_url ?? null;

      if (role === "helper") {
        const { data: admins } = await client
          .from("users")
          .select("id, name, avatar_url")
          .eq("role", "admin")
          .limit(1);
        const ad = Array.isArray(admins) ? admins[0] : admins;
        if (ad) setAdminPeer({ id: ad.id, name: ad.name ?? "Admin", avatarUrl: ad.avatar_url });
      }

      const channel = client
        .channel(CALL_CHANNEL)
        .on("broadcast", { event: "call-signal" }, (payload) => {
          void handleSignal(payload.payload);
        })
        .subscribe();
      channelRef.current = channel;
    })();

    return () => {
      alive = false;
      void supabase.removeAllChannels();
      cleanup();
      stopAllSounds();
    };
  }, [role, cleanup, handleSignal, supabase, setAdminPeer]);

  useEffect(() => {
    if (phase !== "active") return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev === phase) return;

    if (soundStopRef.current) {
      soundStopRef.current.stop();
      soundStopRef.current = null;
    }

    switch (phase) {
      case "incoming":
        unlockAudio();
        soundStopRef.current = playIncomingRing();
        break;
      case "outgoing":
        unlockAudio();
        soundStopRef.current = playOutgoingRingback();
        break;
      case "active":
        stopAllSounds();
        if (prev === "incoming" || prev === "outgoing") playConnected();
        break;
      case "declined":
      case "busy":
      case "no-answer":
        soundStopRef.current = playBusy();
        break;
      case "ended":
        playHangup();
        break;
      case "failed":
        playHangup();
        break;
      case "idle":
        if (prev === "active" || prev === "outgoing") playHangup();
        break;
      default:
        break;
    }
  }, [phase]);

  async function startCall(target: CallPeer) {
    if (phaseRef.current !== "idle") return;
    setError(null);
    callIdRef.current = crypto.randomUUID();
    peerRef.current = target;
    setPeer(target);
    setSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      await recordLog({
        caller_id: meRef.current ?? "",
        callee_id: target.id,
        direction: "outgoing",
        status: "ringing",
      });

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      pc.onicecandidate = (e) => {
        if (e.candidate && callIdRef.current && peerRef.current) {
          send({
            kind: "ice",
            call: callIdRef.current,
            to: peerRef.current.id,
            from: meRef.current ?? "",
            candidate: e.candidate.toJSON(),
          });
        }
      };
      pc.ontrack = (e) => {
        const el = remoteAudioRef.current;
        if (el) {
          el.srcObject = e.streams[0];
          void el.play().catch(() => {});
        }
      };
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      send({
        kind: "call",
        call: callIdRef.current,
        to: target.id,
        from: meRef.current ?? "",
        fromName: myNameRef.current,
        fromAvatar: myAvatarRef.current,
        sdp: offer.sdp ?? "",
      });
      setPhaseBoth("outgoing");
      noAnswerTimerRef.current = setTimeout(() => {
        if (phaseRef.current === "outgoing") {
          patchLog({ status: "missed", ended_at: new Date().toISOString() });
          cleanup();
          autoIdle("no-answer");
        }
      }, 60000);
    } catch (e) {
      recordLog({
        caller_id: meRef.current ?? "",
        callee_id: target.id,
        direction: "outgoing",
        status: "failed",
      });
      cleanup();
      setError(e instanceof Error ? e.message : "Could not start the call (microphone access was denied).");
      autoIdle("failed");
    }
  }

  async function accept() {
    if (phaseRef.current !== "incoming") return;
    const target = peerRef.current;
    const offer = pendingOfferRef.current;
    const callId = callIdRef.current;
    if (!target || !offer || !callId) return;
    setError(null);
    if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      pc.onicecandidate = (e) => {
        if (e.candidate && callIdRef.current && peerRef.current) {
          send({
            kind: "ice",
            call: callIdRef.current,
            to: peerRef.current.id,
            from: meRef.current ?? "",
            candidate: e.candidate.toJSON(),
          });
        }
      };
      pc.ontrack = (e) => {
        const el = remoteAudioRef.current;
        if (el) {
          el.srcObject = e.streams[0];
          void el.play().catch(() => {});
        }
      };
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: offer }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      send({
        kind: "answer",
        call: callId,
        to: target.id,
        from: meRef.current ?? "",
        sdp: answer.sdp ?? "",
      });
      setPhaseBoth("active");
    } catch (e) {
      cleanup();
      setError(e instanceof Error ? e.message : "Could not join the call.");
      autoIdle("failed");
    }
  }

  function decline() {
    if (phaseRef.current !== "incoming") return;
    send({
      kind: "decline",
      call: callIdRef.current ?? "",
      to: peerRef.current?.id ?? "",
      from: meRef.current ?? "",
    });
    cleanup();
    setPhaseBoth("idle");
  }

  function end() {
    if (phaseRef.current === "idle") return;
    if (phaseRef.current === "incoming") {
      decline();
      return;
    }
    if (phaseRef.current === "active") {
      patchLog({
        status: "answered",
        ended_at: new Date().toISOString(),
        duration_seconds: durationSinceAnswer(),
      });
    } else if (phaseRef.current === "outgoing") {
      patchLog({ status: "cancelled", ended_at: new Date().toISOString() });
    }
    send({
      kind: "end",
      call: callIdRef.current ?? "",
      to: peerRef.current?.id ?? "",
      from: meRef.current ?? "",
    });
    cleanup();
    setPhaseBoth("idle");
  }

  function toggleMute() {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !muted;
    setMuted(next);
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    send({
      kind: "mute",
      call: callIdRef.current ?? "",
      to: peerRef.current?.id ?? "",
      from: meRef.current ?? "",
      muted: next,
    });
  }

  const api: VoiceCallApi = {
    phase,
    peer,
    seconds,
    muted,
    peerMuted,
    error,
    adminPeer,
    minimized,
    startCall,
    accept,
    decline,
    end,
    toggleMute,
    minimize: () => setMinimized(true),
    restore: () => setMinimized(false),
  };

  const name = peer?.name ?? "PeerCraft Support";
  const avatarUrl = peer?.avatarUrl ?? undefined;

  return (
    <VoiceCallContext.Provider value={api}>
      <audio ref={localAudioRef} autoPlay muted playsInline className="hidden" />
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {children}

      {phase !== "idle" &&
        createPortal(
          <div className="fixed inset-0 z-[120] pointer-events-none">
            {phase === "incoming" && !minimized && (
              <div className="absolute inset-0 pointer-events-auto" style={{ background: "rgba(0,0,0,0.4)" }} />
            )}

            {minimized && (phase === "incoming" || phase === "outgoing" || phase === "active") && (
              <DragWindow className="absolute pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none" pos={windowPos} onPosChange={setWindowPos}>
                <MiniCallBubble
                  name={name}
                  avatarUrl={avatarUrl}
                  live={phase === "active"}
                  timer={formatTimer(seconds)}
                  muted={muted}
                  onRestore={() => setMinimized(false)}
                  onEnd={end}
                />
              </DragWindow>
            )}

            {!minimized && phase === "incoming" && (
              <DragWindow className="absolute pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none" pos={windowPos} onPosChange={setWindowPos}>
                <div
                  className="w-full max-w-sm bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl p-8 text-center animate-[dialog-in_0.2s_ease-out]"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Incoming call"
                >
                  <div className="flex items-center justify-end -mt-3 -mr-3 mb-1">
                    <button
                      onClick={() => setMinimized(true)}
                      aria-label="Minimize call"
                      className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-high/70 transition-colors cursor-pointer"
                    >
                      <Minimize2 size={16} />
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-container/30 text-success text-xs font-semibold mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Incoming Call
                  </span>
                  <div className="flex flex-col items-center">
                    <Avatar name={name} src={avatarUrl} size="lg" online className="mb-3" />
                    <h3 className="font-display font-bold text-lg text-on-surface">{name}</h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">PeerCraft Support Desk</p>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-8">
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={decline}
                        aria-label="Decline call"
                        className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/85 transition-colors cursor-pointer"
                      >
                        <PhoneOff size={20} />
                      </button>
                      <span className="text-xs text-on-surface-variant">Decline</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => void accept()}
                        aria-label="Accept call"
                        className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        <Phone size={20} />
                      </button>
                      <span className="text-xs text-on-surface-variant">Accept</span>
                    </div>
                  </div>
                </div>
              </DragWindow>
            )}

            {!minimized && (phase === "outgoing" || phase === "active") && (
              <DragWindow className="absolute pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none" pos={windowPos} onPosChange={setWindowPos}>
                <CallPanel
                  name={name}
                  avatarUrl={avatarUrl}
                  subtitle={phase === "active" ? formatTimer(seconds) : "Calling…"}
                  timer={phase === "active" ? formatTimer(seconds) : <Loader2 size={15} className="animate-spin" />}
                  muted={muted}
                  peerMuted={peerMuted}
                  live={phase === "active"}
                  onMute={toggleMute}
                  onEnd={end}
                  onMinimize={() => setMinimized(true)}
                />
              </DragWindow>
            )}

            {!minimized && (phase === "declined" || phase === "busy" || phase === "no-answer" || phase === "ended" || phase === "failed") && (
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl px-6 py-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                    <PhoneOff size={16} className="text-on-surface-variant" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">
                      {phase === "declined" ? "Call declined"
                        : phase === "busy" ? "Unavailable right now"
                          : phase === "no-answer" ? "No answer"
                            : phase === "failed" ? "Call failed"
                              : "Call ended"}
                    </p>
                    {error && <p className="text-xs text-on-surface-variant max-w-xs">{error}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </VoiceCallContext.Provider>
  );
}

function DragWindow({
  children,
  className,
  pos,
  onPosChange,
}: {
  children: React.ReactNode;
  className?: string;
  pos: { x: number; y: number } | null;
  onPosChange: (pos: { x: number; y: number }) => void;
}) {
  const winRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (!winRef.current) return;
    const el = winRef.current;
    if (pos !== null) {
      const nx = Math.min(Math.max(8, pos.x), window.innerWidth - el.offsetWidth - 8);
      const ny = Math.min(Math.max(8, pos.y), window.innerHeight - el.offsetHeight - 8);
      if (nx !== pos.x || ny !== pos.y) onPosChange({ x: nx, y: ny });
      return;
    }
    onPosChange({
      x: Math.max(8, (window.innerWidth - el.offsetWidth) / 2),
      y: Math.max(8, (window.innerHeight - el.offsetHeight) / 2),
    });
  }, [onPosChange, pos]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!winRef.current) return;
    const el = winRef.current;
    const rect = el.getBoundingClientRect();
    dragStateRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current || !winRef.current) return;
    const el = winRef.current;
    onPosChange({
      x: Math.min(Math.max(8, e.clientX - dragStateRef.current.dx), window.innerWidth - el.offsetWidth - 8),
      y: Math.min(Math.max(8, e.clientY - dragStateRef.current.dy), window.innerHeight - el.offsetHeight - 8),
    });
  };

  const stopDrag = () => {
    dragStateRef.current = null;
  };

  return (
    <div
      ref={winRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      className={className}
      style={
        pos
          ? { left: pos.x, top: pos.y }
          : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      }
    >
      {children}
    </div>
  );
}

function MiniCallBubble({
  name,
  avatarUrl,
  live,
  timer,
  muted,
  onRestore,
  onEnd,
}: {
  name: string;
  avatarUrl?: string;
  live: boolean;
  timer: string;
  muted: boolean;
  onRestore: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-surface-container-lowest rounded-full border border-outline-variant shadow-xl pl-2 pr-2 py-2 animate-[dialog-in_0.2s_ease-out]">
      <Avatar name={name} src={avatarUrl} size="sm" />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-on-surface">{name}</p>
        <p className="text-[11px] text-on-surface-variant inline-flex items-center gap-1">
          {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
          {live ? `In call · ${timer}` : "Calling…"}
          {muted && <MicOff size={11} className="text-warning ml-0.5" />}
        </p>
      </div>
      <button
        onClick={onRestore}
        aria-label="Expand call"
        className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-high/70 transition-colors cursor-pointer"
      >
        <Maximize2 size={15} />
      </button>
      <button
        onClick={onEnd}
        aria-label="End call"
        className="w-9 h-9 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/85 transition-colors cursor-pointer"
      >
        <PhoneOff size={15} />
      </button>
    </div>
  );
}

function CallPanel({
  name,
  avatarUrl,
  subtitle,
  timer,
  muted,
  peerMuted,
  onMute,
  onEnd,
  onMinimize,
  live = false,
}: {
  name: string;
  avatarUrl?: string;
  subtitle: string;
  timer: React.ReactNode;
  muted: boolean;
  peerMuted?: boolean;
  onMute: () => void;
  onEnd: () => void;
  onMinimize: () => void;
  live?: boolean;
}) {
  return (
    <div
      className="w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl p-8 text-center animate-[dialog-in_0.2s_ease-out] pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Call"
    >
      <div className="flex items-center justify-between gap-3 mb-4 -mt-3 -mr-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={name} src={avatarUrl} size="sm" className={live ? "" : "grayscale"} />
          <div className="min-w-0 text-left leading-tight">
            <p className="font-display font-bold text-sm text-on-surface truncate">{name}</p>
            <p className="text-xs text-on-surface-variant truncate inline-flex items-center gap-1">
              {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
              {subtitle}
            </p>
          </div>
        </div>
        <button
          onClick={onMinimize}
          aria-label="Minimize call"
          className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-high/70 transition-colors cursor-pointer shrink-0"
        >
          <Minimize2 size={16} />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar name={name} src={avatarUrl} size="lg" className={live ? "" : "grayscale"} />
          {live && (
            <span className="absolute -bottom-0 -right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" />
          )}
        </div>
        <h3 className="font-display font-bold text-lg text-on-surface mt-3">{name}</h3>
        <p className="text-sm text-on-surface-variant mt-0.5 inline-flex items-center gap-1.5">
          {live ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              In call · {timer}
            </>
          ) : (
            subtitle
          )}
        </p>
        {live && peerMuted && (
          <p className="text-[11px] font-medium text-amber-600 mt-1.5 inline-flex items-center gap-1.5">
            <MicOff size={12} />
            {name} muted the call
          </p>
        )}
        {live && muted && (
          <p className="text-[11px] font-medium text-warning mt-1.5 inline-flex items-center gap-1.5">
            <MicOff size={12} />
            You muted the call
          </p>
        )}
      </div>
      <div className="flex items-center justify-center gap-5 mt-8">
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              muted ? "bg-warning-container/40 text-warning" : "bg-surface-container-high text-on-surface hover:bg-surface-container-high/70"
            }`}
          >
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <span className="text-xs text-on-surface-variant">{muted ? "Unmute" : "Mute"}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onEnd}
            aria-label="End call"
            className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/85 transition-colors cursor-pointer"
          >
            <PhoneOff size={20} />
          </button>
          <span className="text-xs text-on-surface-variant">End</span>
        </div>
      </div>
    </div>
  );
}