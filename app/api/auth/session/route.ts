import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  baseAuthCookieOptions
} from "@/lib/auth-cookies";
import { requireSupabaseConfig } from "@/lib/supabase-config";

type SessionBody = {
  accessToken?: unknown;
  refreshToken?: unknown;
  expiresIn?: unknown;
};

export async function POST(request: Request) {
  let body: SessionBody;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    return NextResponse.json({ error: "SESSION_ILLISIBLE" }, { status: 400 });
  }

  const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
  const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken.trim() : "";
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "SESSION_INCOMPLETE" }, { status: 400 });
  }

  const config = requireSupabaseConfig();
  const validation = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!validation.ok) {
    return NextResponse.json({ error: "LIEN_EXPIRE_OU_INVALIDE" }, { status: 401 });
  }

  const requestedMaxAge = Math.round(Number(body.expiresIn ?? 3600));
  const accessMaxAge = Number.isFinite(requestedMaxAge)
    ? Math.max(60, Math.min(requestedMaxAge, 24 * 60 * 60))
    : 3600;

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseAuthCookieOptions,
    maxAge: accessMaxAge
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseAuthCookieOptions,
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
