import { NextResponse } from "next/server";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type DraftKind = "practice" | "mini_exam";

type DraftRow = {
  kind: DraftKind;
  payload: Record<string, unknown>;
  started_at: string;
  expires_at: string;
  updated_at: string;
};

function parseKind(value: unknown): DraftKind | null {
  return value === "practice" || value === "mini_exam" ? value : null;
}

function safeObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const kind = parseKind(new URL(request.url).searchParams.get("kind"));
  if (!kind) return NextResponse.json({ error: "TYPE_DE_BROUILLON_INVALIDE" }, { status: 400 });

  try {
    const now = new Date().toISOString();
    const rows = await supabaseRest<DraftRow[]>(
      `session_drafts?select=kind,payload,started_at,expires_at,updated_at&user_id=eq.${user.id}&kind=eq.${kind}&expires_at=gt.${encodeURIComponent(now)}&limit=1`
    );
    return NextResponse.json({ draft: rows[0] ?? null });
  } catch (error) {
    console.error("Unable to read session draft", error);
    return NextResponse.json({ error: "BROUILLON_INDISPONIBLE" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  let body: { kind?: unknown; payload?: unknown; startedAt?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "BROUILLON_ILLISIBLE" }, { status: 400 });
  }

  const kind = parseKind(body.kind);
  const payload = safeObject(body.payload);
  if (!kind || !payload) return NextResponse.json({ error: "BROUILLON_INVALIDE" }, { status: 400 });

  const serialized = JSON.stringify(payload);
  if (serialized.length > 100_000) {
    return NextResponse.json({ error: "BROUILLON_TROP_VOLUMINEUX" }, { status: 413 });
  }

  const now = Date.now();
  const requestedStart = typeof body.startedAt === "string" ? new Date(body.startedAt).getTime() : now;
  const startedAtMs = Number.isFinite(requestedStart) && requestedStart <= now + 5 * 60_000
    ? Math.max(requestedStart, now - 48 * 60 * 60_000)
    : now;
  const maxAgeMs = kind === "mini_exam" ? 3 * 60 * 60_000 : 48 * 60 * 60_000;
  const startedAt = new Date(startedAtMs).toISOString();
  const expiresAt = new Date(startedAtMs + maxAgeMs).toISOString();
  const updatedAt = new Date(now).toISOString();

  try {
    await supabaseRest<void>("session_drafts?on_conflict=user_id,kind", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        kind,
        payload,
        started_at: startedAt,
        expires_at: expiresAt,
        updated_at: updatedAt
      })
    });
    return NextResponse.json({ saved: true, expiresAt, updatedAt });
  } catch (error) {
    console.error("Unable to save session draft", error);
    return NextResponse.json({ error: "BROUILLON_NON_ENREGISTRE" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const kind = parseKind(new URL(request.url).searchParams.get("kind"));
  if (!kind) return NextResponse.json({ error: "TYPE_DE_BROUILLON_INVALIDE" }, { status: 400 });

  try {
    await supabaseRest<void>(`session_drafts?user_id=eq.${user.id}&kind=eq.${kind}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Unable to delete session draft", error);
    return NextResponse.json({ error: "BROUILLON_NON_SUPPRIME" }, { status: 500 });
  }
}
