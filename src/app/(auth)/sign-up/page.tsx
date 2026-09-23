"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, Mail, ArrowRight, ShieldCheck, Check, BadgeCheck, KeyRound, RotateCcw } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { roleToHome } from "@/lib/auth";
import { stampAuthAtCookie } from "@/lib/session-timebox";

type Stage = "email" | "otp";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState<Stage>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Enter your full name.");
      setLoading(false);
      return;
    }
    if (email.trim().length === 0) {
      setError("Enter your email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { name, role: "student" },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setOtp("");
    setStage("otp");
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Could not identify the created user.");
      setLoading(false);
      return;
    }

    stampAuthAtCookie();

    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      setError(passwordError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    router.replace(roleToHome(profile?.role));
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
            <GraduationCap size={18} />
          </span>
          <span className="font-display font-bold text-on-surface text-lg">PeerCraft</span>
        </Link>
        <Link href="/" className="text-sm text-on-surface-variant hover:text-on-surface font-medium">
          Back to Platform
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary-container via-secondary-container to-tertiary-container" />

            <div className="px-8 pt-7 pb-4 flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center mb-4 shadow-md shadow-primary-container/30">
                <GraduationCap size={28} />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold mb-3">
                <BadgeCheck size={12} />
                Academic Network
              </span>
              <h1 className="font-display font-bold text-2xl text-on-surface">
                {stage === "email" ? "Create your student account" : "Verify your email"}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1.5">
                {stage === "email"
                  ? "Sign up with Google or receive a verification code by email"
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            <div className="px-8 pb-9">
              <button
                onClick={handleGoogle}
                className="w-full h-11 flex items-center justify-center gap-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-on-surface-variant font-medium">or register with email</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              {stage === "email" ? (
                <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Alex Chen"
                    icon={<User size={18} />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface">Email</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-on-surface-variant pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <Check size={12} className="text-success shrink-0 mt-px" />
                      We&apos;ll send a 6-digit verification code to this email.
                    </p>
                  </div>

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    icon={<KeyRound size={18} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your password"
                    icon={<KeyRound size={18} />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  {error && (
                    <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <label className="flex items-start gap-2.5 text-sm text-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 rounded border-outline-variant accent-primary-container"
                      checked={accepted}
                      onChange={() => setAccepted(!accepted)}
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" className="font-semibold text-primary hover:underline">Terms of Service</Link>
                      , including policies against submitting others&apos; work as your own.
                    </span>
                  </label>

                  <Button type="submit" size="lg" className="w-full justify-between" disabled={!accepted || loading}>
                    {loading ? "Sending code..." : "Continue with Email"}
                    <ArrowRight size={18} />
                  </Button>
                </form>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={handleOtpSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface">Verification code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-center text-lg font-mono font-semibold tracking-[0.5em] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <Button type="submit" size="lg" className="w-full justify-between" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Create Account"}
                    <ArrowRight size={18} />
                  </Button>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStage("email")}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <KeyRound size={13} />
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEmailSubmit()}
                      disabled={loading}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw size={13} />
                      Resend code
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="border-t border-outline-variant bg-surface-container-low px-8 py-4">
              <p className="text-center text-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">Sign In</Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 mt-7 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-success" />
              256-bit encrypted
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck size={14} className="text-success" />
              FERPA Certified
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}