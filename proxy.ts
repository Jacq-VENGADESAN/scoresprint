import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  baseAuthCookieOptions
} from "@/lib/auth-cookies";
import { getSupabaseConfig } from "@/lib/supabase-config";

const protectedPrefixes = ["/dashboard", "/onboarding", "/diagnostic", "/errors"];

async function tokenIsValid(url: string, key: string, token: string) {
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` }
  });
  return response.ok;
}

export async function proxy(request: NextRequest) {
  const config = getSupabaseConfig();
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!config) {
    if (isProtected) {
      const target = request.nextUrl.clone();
      target.pathname = "/auth";
      target.searchParams.set("error", "Supabase n’est pas encore configuré sur ce déploiement.");
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  let authenticated = accessToken
    ? await tokenIsValid(config.url, config.publishableKey, accessToken)
    : false;
  let response = NextResponse.next();

  if (!authenticated && refreshToken) {
    const refreshResponse = await fetch(
      `${config.url}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          apikey: config.publishableKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      }
    );

    if (refreshResponse.ok) {
      const session = (await refreshResponse.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in?: number;
      };
      authenticated = true;
      response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
        ...baseAuthCookieOptions,
        maxAge: session.expires_in ?? 3600
      });
      response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
        ...baseAuthCookieOptions,
        maxAge: 60 * 60 * 24 * 30
      });
    }
  }

  if (isProtected && !authenticated) {
    const target = request.nextUrl.clone();
    target.pathname = "/auth";
    target.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(target);
    redirect.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...baseAuthCookieOptions, maxAge: 0 });
    redirect.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...baseAuthCookieOptions, maxAge: 0 });
    return redirect;
  }

  if (pathname === "/auth" && authenticated) {
    const target = request.nextUrl.clone();
    target.pathname = "/dashboard";
    target.search = "";
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
