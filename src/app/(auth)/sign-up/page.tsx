"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  User,
  Mail,
  ArrowRight,
  KeyRound,
  Check,
} from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();
  // Preserved so a visitor who started the request form before signing up lands
  // back on it with their saved draft.
  const nextParam = useSearchParams().get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (email.trim().length === 0) {
      setError("Enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Emails a verification link (not a confirmation link). The code is
    // rendered into the message by Supabase's "Email OTP" / "Confirm signup"
    // template via {{ .Token }} — see README > Email verification.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: next
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          : `${window.location.origin}/auth/callback`,
        data: { name, role: "student" },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSent(true);
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: next
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          : `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="m-auto w-full max-w-md">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-primary/5 sm:p-7">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
            <GraduationCap size={24} />
          </span>
          <h1 className="font-display text-2xl font-bold text-on-surface">Create your account</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Join Acadivo and get help from verified peer helpers
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          className="w-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path className="fill-google-blue" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path className="fill-google-green" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path className="fill-google-yellow" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path className="fill-google-red" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium text-on-surface-variant">or sign up with email</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {!sent ? (
          <form className="flex flex-col gap-3.5" onSubmit={handleEmailSubmit}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Input
                label="Full name"
                type="text"
                placeholder="Alex Chen"
                icon={<User size={18} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
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
                label="Confirm password"
                type="password"
                placeholder="Re-enter password"
                icon={<KeyRound size={18} />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Check size={13} className="shrink-0 text-success" />
              We&apos;ll email a verification link to confirm your address.
            </p>

            {error && (
              <p className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-on-surface-variant">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-line accent-primary"
                checked={accepted}
                onChange={() => setAccepted(!accepted)}
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-primary hover:underline">
                  Terms of Service
                </Link>
                , including policies against submitting others&apos; work as your own.
              </span>
            </label>

            <Button
              type="submit"
              size="lg"
              className="w-full justify-between"
              disabled={!accepted || loading}
            >
              {loading ? "Sending email..." : "Create account"}
              <ArrowRight size={18} />
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-on-surface">
              We&apos;ve sent you a verification link. Please check your email and click the link
              to verify your account. If you don&apos;t see it, check your spam folder.
            </div>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setSent(false)}
              disabled={loading}
            >
              Back to sign up
            </Button>
          </div>
        )}

        <p className="mt-5 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

      <p className="mt-4 hidden text-center text-xs text-on-surface-variant sm:block">
        Verified peer helpers · Secure payments
      </p>
    </div>
  );
}
