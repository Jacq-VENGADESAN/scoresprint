import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, baseAuthCookieOptions } from "@/lib/auth-cookies";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";
import { requireSupabaseConfig } from "@/lib/supabase-config";

function accountError(request: Request, message: string) {
  const url = new URL("/account", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

async function deleteBetaData(userId: string, email: string) {
  const paths = [
    `product_events?user_id=eq.${userId}`,
    `beta_feedback?user_id=eq.${userId}`,
    `premium_waitlist?or=(user_id.eq.${userId},email.eq.${encodeURIComponent(email)})`
  ];
  for (const path of paths) {
    try { await supabaseAdminRest(path, { method: "DELETE", headers: { Prefer: "return=minimal" } }); }
    catch (error) { console.error(`Unable to delete beta data from ${path.split("?")[0]}`, error); }
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth?next=/account", request.url), 303);

  const form = await request.formData();
  const confirmation = String(form.get("confirmation") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (confirmation !== "SUPPRIMER" || !user.email || email !== user.email.toLowerCase()) return accountError(request, "La confirmation de suppression est incorrecte.");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) return accountError(request, "La suppression du compte n’est pas encore configurée.");

  try {
    await deleteBetaData(user.id, user.email.toLowerCase());
    const config = requireSupabaseConfig();
    const response = await fetch(`${config.url}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    if (!response.ok) throw new Error(`AUTH_DELETE_${response.status}: ${await response.text()}`);

    const redirect = NextResponse.redirect(new URL("/account-deleted", request.url), 303);
    redirect.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...baseAuthCookieOptions, maxAge: 0 });
    redirect.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...baseAuthCookieOptions, maxAge: 0 });
    return redirect;
  } catch (error) {
    console.error("Unable to delete account", error);
    return accountError(request, "Le compte n’a pas pu être supprimé. Réessaie plus tard.");
  }
}
