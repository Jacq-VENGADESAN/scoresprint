import { estimateScoreRange } from "@/lib/adaptive";

export async function POST(request: Request) {
  const body = (await request.json()) as { correctAnswers?: unknown; totalAnswers?: unknown };
  const correctAnswers = Number(body.correctAnswers);
  const totalAnswers = Number(body.totalAnswers);

  if (!Number.isFinite(correctAnswers) || !Number.isFinite(totalAnswers) || totalAnswers <= 0 || correctAnswers < 0 || correctAnswers > totalAnswers) {
    return Response.json({ error: "Payload invalide" }, { status: 400 });
  }

  return Response.json({ range: estimateScoreRange(correctAnswers, totalAnswers), disclaimer: "Estimation indicative, non officielle." });
}
