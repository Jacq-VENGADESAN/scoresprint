import { NextResponse } from "next/server";
import { requireSupabaseConfig } from "@/lib/supabase-config";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const target = new URL("/auth/forgot-password", request.url);

  if (!email || !email.includes("@") || email.length > 320) {
    target.searchParams.set("error", "Indique une adresse e-mail valide.");
    return NextResponse.redirect(target, 303);
  }

  try {
    const config = requireSupabaseConfig();
    const redirectTo = new URL("/auth/reset-password", request.url).toString();
    const response = await fetch(
      `${config.url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,
      {
        method: "POST",
        headers: {
          apikey: config.publishableKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }
    );

    if (!response.ok) {
      console.error("Supabase password recovery request failed", response.status, await response.text());
    }
  } catch (error) {
    console.error("Unable to request password recovery", error);
  }

  target.searchParams.set("sent", "1");
  return NextResponse.redirect(target, 303);
}
