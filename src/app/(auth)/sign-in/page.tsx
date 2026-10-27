"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, ArrowRight, Building2, Lock, Loader2 } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { roleToHome, safeNextPath } from "@/lib/auth";
import { stampAuthAtCookie } from "@/lib/session-timebox";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expired = searchParams.get("expired") === "1";
  const verified = searchParams.get("verified") === "1";

  function nextPath(): string {
    if (typeof window === "undefined") return "/";
    const next = new URLSearchParams(window.location.search).get("next");
    return safeNextPath(next) ?? "/";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length === 0) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Could not identify the signed-in user.");
      setLoading(false);
      return;
    }

    stampAuthAtCookie();

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const home = roleToHome(profile?.role);
    // nextPath() is "/" unless the page was reached with an explicit ?next, so
    // an explicit target (e.g. /requests/new with a saved draft) wins over the
    // role landing page.
    const next = nextPath();
    const destination = next !== "/" && next !== home ? next : home;
    await router.replace(destination);
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="m-auto w-full max-w-md">
      <div className="animate-rise-in rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-primary/5 sm:p-7">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-brand">
            <GraduationCap size={24} />
          </span>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed-variant">
            <Building2 size={12} />
            Academic Portal
          </span>
          <h1 className="font-display text-2xl font-bold text-on-surface">Welcome back</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Sign in with Google or your email &amp; password
          </p>
        </div>

        {verified && (
          <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-on-surface">
            Email verified. You can now sign in to your account.
          </div>
        )}
        {expired && (
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface">
            Your session has expired. Please sign in again to continue.
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" variant="brand" size="lg" className="w-full justify-between" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight size={18} />
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium text-on-surface-variant">Or continue with</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                className="fill-google-blue"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                className="fill-google-green"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                className="fill-google-yellow"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                className="fill-google-red"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {googleLoading ? "Opening Google…" : "Continue with Google"}
        </Button>

        <p className="mt-5 text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href={
              nextPath() === "/" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(nextPath())}`
            }
            className="font-semibold text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      <p className="mt-4 hidden text-center text-xs text-on-surface-variant sm:block">
        Secure sign-in · Verified academic helpers
      </p>
    </div>
  );
}
