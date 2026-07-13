export async function GET() {
  return Response.json({ status: "ok", service: "scoresprint", timestamp: new Date().toISOString() });
}
