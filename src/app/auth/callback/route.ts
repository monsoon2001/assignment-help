import { createClient } from "@/lib/supabase/server";
import { roleToHome } from "@/lib/auth";
import { AUTH_AT_COOKIE, authAtCookieOptions } from "@/lib/session-timebox";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  const supabase = await createClient();

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?error=no_user", url.origin));
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

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