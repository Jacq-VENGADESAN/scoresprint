import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  baseAuthCookieOptions
} from "@/lib/auth-cookies";
import { getSupabaseConfig } from "@/lib/supabase-config";

export async function POST(request: NextRequest) {
  const config = getSupabaseConfig();
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (config && accessToken) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${accessToken}`
      }
    }).catch(() => undefined);
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...baseAuthCookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...baseAuthCookieOptions, maxAge: 0 });
  return response;
}
