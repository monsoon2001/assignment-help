import { createClient } from "@/lib/supabase/server";
import { roleToHome } from "@/lib/auth";
import { AUTH_AT_COOKIE, authAtCookieOptions } from "@/lib/session-timebox";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin),
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    });
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin),
      );
    }
  } else {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?error=no_user", url.origin));
  }

  const emailVerified = (user as any).email_confirmed_at;
  const wasJustConfirmed =
    type === "signup" ||
    type === "email" ||
    type === "recovery" ||
    Boolean(emailVerified);

  if (wasJustConfirmed) {
    const redirect = new URL("/sign-in", url.origin);
    redirect.searchParams.set("verified", "1");
    const response = NextResponse.redirect(redirect);
    response.cookies.set(AUTH_AT_COOKIE, String(Date.now()), authAtCookieOptions());
    return response;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .maybeSingle();

  // Sync a Google profile picture (and a missing name) from the OAuth identity
  // into the users table so every surface — helper listings, chats, admin —
  // sees the real Google avatar instead of the initials fallback.
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const googleAvatar =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : null;
  const metaName = typeof metadata.name === "string" ? metadata.name : null;
  if (googleAvatar || (metaName && !profile?.name)) {
    const updates: Record<string, unknown> = {};
    if (googleAvatar) updates.avatar_url = googleAvatar;
    if (metaName && !profile?.name) updates.name = metaName;
    await supabase.from("users").update(updates).eq("id", user.id);
  }

  const home = roleToHome(profile?.role);
  const target =
    next && next !== "/" && next.startsWith("/") && !next.startsWith("//") ? next : home;
  const redirect = new URL(target, url.origin);
  redirect.searchParams.set("signedIn", "1");
  const created = user.created_at ? new Date(user.created_at).getTime() : 0;
  const isNew =
    Number.isFinite(created) &&
    Date.now() - created < 60_000;
  redirect.searchParams.set("welcome", isNew ? "new" : "back");
  if (user.user_metadata?.name) {
    redirect.searchParams.set("user", String(user.user_metadata.name));
  }

  const response = NextResponse.redirect(redirect);
  response.cookies.set(AUTH_AT_COOKIE, String(Date.now()), authAtCookieOptions());
  return response;
}