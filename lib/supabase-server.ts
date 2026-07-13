import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { getSupabaseConfig, requireSupabaseConfig } from "@/lib/supabase-config";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: { display_name?: string };
};

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const config = getSupabaseConfig();
  const token = await getAccessToken();
  if (!config || !token) return null;

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) return null;
  return (await response.json()) as AuthUser;
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const config = requireSupabaseConfig();
  const token = await getAccessToken();
  if (!token) throw new Error("AUTH_REQUIRED");

  const headers = new Headers(init.headers);
  headers.set("apikey", config.publishableKey);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`SUPABASE_${response.status}: ${responseText}`);
  }

  if (!responseText.trim()) return undefined as T;

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(`SUPABASE_INVALID_JSON_${response.status}: ${responseText.slice(0, 300)}`);
  }
}
