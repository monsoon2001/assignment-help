import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { roleToHome, isStudentRoute, isHelperRoute, isAdminRoute, isAuthRoute } from "@/lib/auth";
import {
  AUTH_AT_COOKIE,
  SESSION_TIMEBOX_MS,
  authAtCookieOptions,
  parseAuthAt,
  supabaseCookiePrefix,
} from "@/lib/session-timebox";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      realtime: {
        transport: globalThis.WebSocket,
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedArea =
    isStudentRoute(pathname) ? "student" :
    isHelperRoute(pathname) ? "helper" :
    isAdminRoute(pathname) ? "admin" :
    null;

  if (!user) {
    if (protectedArea) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 24-hour session timebox: every user must sign in again after 24 hours.
  const authAt = parseAuthAt(request.cookies.get(AUTH_AT_COOKIE)?.value);
  if (authAt === null) {
    supabaseResponse.cookies.set(AUTH_AT_COOKIE, String(Date.now()), authAtCookieOptions());
  } else if (Date.now() - authAt > SESSION_TIMEBOX_MS) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    url.searchParams.set("expired", "1");
    const prefix = supabaseCookiePrefix(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    const response = NextResponse.redirect(url);
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith(prefix)) {
        response.cookies.set(cookie.name, "", { ...authAtCookieOptions(), maxAge: 0 });
      }
    }
    response.cookies.set(AUTH_AT_COOKIE, "", { ...authAtCookieOptions(), maxAge: 0 });
    return response;
  }

  let role: string | null = null;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  role = profile?.role ?? null;

  const home = roleToHome(role);

  if (isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Signed-in users always land on their own dashboard, never the public homepage.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (protectedArea === "student" && role !== "student") {
    return NextResponse.redirect(new URL(home, request.url));
  }
  if (protectedArea === "helper" && role !== "helper") {
    return NextResponse.redirect(new URL(home, request.url));
  }
  if (protectedArea === "admin" && role !== "admin") {
    return NextResponse.redirect(new URL(home, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/requests/:path*",
    "/orders/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/helper/:path*",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ],
};