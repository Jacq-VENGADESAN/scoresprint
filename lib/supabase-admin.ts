import { requireSupabaseConfig } from "@/lib/supabase-config";

function serviceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!value) throw new Error("MISSING_SUPABASE_SERVICE_ROLE_KEY");
  return value;
}

export async function supabaseAdminRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = requireSupabaseConfig();
  const key = serviceRoleKey();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`SUPABASE_ADMIN_${response.status}: ${text.slice(0, 500)}`);
  if (!text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}
