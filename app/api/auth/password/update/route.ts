import { NextResponse } from "next/server";
import { getAccessToken, getCurrentUser } from "@/lib/supabase-server";
import { requireSupabaseConfig } from "@/lib/supabase-config";

type PasswordBody = {
  password?: unknown;
  confirmation?: unknown;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const token = await getAccessToken();
  if (!user || !token) {
    return NextResponse.json({ error: "Le lien de récupération a expiré. Demande un nouveau lien." }, { status: 401 });
  }

  let body: PasswordBody;
  try {
    body = (await request.json()) as PasswordBody;
  } catch {
    return NextResponse.json({ error: "Les informations envoyées sont illisibles." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const confirmation = typeof body.confirmation === "string" ? body.confirmation : "";
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }
  if (password !== confirmation) {
    return NextResponse.json({ error: "Les deux mots de passe ne correspondent pas." }, { status: 400 });
  }

  const config = requireSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  if (!response.ok) {
    console.error("Supabase password update failed", response.status, await response.text());
    return NextResponse.json({ error: "Le mot de passe n’a pas pu être modifié. Demande un nouveau lien." }, { status: 400 });
  }

  return NextResponse.json({ updated: true });
}
