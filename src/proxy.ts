import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { roleToHome, isStudentRoute, isHelperRoute, isAdminRoute, isAuthRoute } from "@/lib/auth";

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