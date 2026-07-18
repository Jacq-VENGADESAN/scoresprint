import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  baseAuthCookieOptions
} from "@/lib/auth-cookies";
import { consumeRateLimit } from "@/lib/rate-limit";
import { requireSupabaseConfig } from "@/lib/supabase-config";

function authRedirect(request: NextRequest, message: string, next?: string) {
  const url = new URL("/auth", request.url);
  url.searchParams.set("error", message);
  if (next?.startsWith("/")) url.searchParams.set("next", next);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const requestedNext = String(form.get("next") ?? "");
  const next = requestedNext.startsWith("/") ? requestedNext : "/dashboard";

  if (!email || password.length < 6) {
    return authRedirect(request, "Renseigne un e-mail et un mot de passe valide.", next);
  }

  const rate = await consumeRateLimit(request, { scope: "auth-login", subject: email, limit: 10, windowSeconds: 900 });
  if (!rate.allowed) {
    return authRedirect(request, `Trop de tentatives. Réessaie dans environ ${Math.ceil(rate.retry_after_seconds / 60)} minute(s).`, next);
  }

  const config = requireSupabaseConfig();
  const authResponse = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!authResponse.ok) {
    return authRedirect(request, "E-mail ou mot de passe incorrect, ou compte non confirmé.", next);
  }

  const session = (await authResponse.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
  };
  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    ...baseAuthCookieOptions,
    maxAge: session.expires_in ?? 3600
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...baseAuthCookieOptions,
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
