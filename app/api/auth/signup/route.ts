import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  baseAuthCookieOptions
} from "@/lib/auth-cookies";
import { consumeRateLimit } from "@/lib/rate-limit";
import { requireSupabaseConfig } from "@/lib/supabase-config";

function redirectToAuth(request: NextRequest, error: string) {
  const url = new URL("/auth", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const displayName = String(form.get("display_name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!displayName || !email || password.length < 8) {
    return redirectToAuth(
      request,
      "Indique ton prénom, un e-mail valide et un mot de passe d’au moins 8 caractères."
    );
  }

  const rate = await consumeRateLimit(request, { scope: "auth-signup", subject: email, limit: 5, windowSeconds: 3600 });
  if (!rate.allowed) {
    return redirectToAuth(request, "Trop de créations de compte ont été demandées. Réessaie plus tard.");
  }

  const config = requireSupabaseConfig();
  const confirmationTarget = new URL("/auth", request.url);
  confirmationTarget.searchParams.set("confirmed", "1");
  const signupUrl = `${config.url}/auth/v1/signup?redirect_to=${encodeURIComponent(confirmationTarget.toString())}`;
  const signupResponse = await fetch(signupUrl, {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      data: { display_name: displayName }
    })
  });

  if (!signupResponse.ok) {
    const payload = (await signupResponse.json().catch(() => null)) as { msg?: string; message?: string } | null;
    const detail = payload?.msg ?? payload?.message ?? "Impossible de créer le compte.";
    return redirectToAuth(request, detail);
  }

  const payload = (await signupResponse.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (payload.access_token && payload.refresh_token) {
    const response = NextResponse.redirect(new URL("/onboarding", request.url), { status: 303 });
    response.cookies.set(ACCESS_TOKEN_COOKIE, payload.access_token, {
      ...baseAuthCookieOptions,
      maxAge: payload.expires_in ?? 3600
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, payload.refresh_token, {
      ...baseAuthCookieOptions,
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  }

  return NextResponse.redirect(new URL("/auth/check-email", request.url), { status: 303 });
}
