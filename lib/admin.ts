import type { AuthUser } from "@/lib/supabase-server";

function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function adminIsConfigured() {
  return configuredAdminEmails().size > 0;
}

export function isAdminUser(user: AuthUser | null | undefined) {
  const email = user?.email?.trim().toLowerCase();
  return Boolean(email && configuredAdminEmails().has(email));
}

export function requireAdminUser(user: AuthUser | null | undefined) {
  if (!user) throw new Error("AUTH_REQUIRED");
  if (!isAdminUser(user)) throw new Error("ADMIN_REQUIRED");
  return user;
}