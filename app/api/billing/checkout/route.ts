import { NextResponse } from "next/server";
import { betaModeEnabled } from "@/lib/beta";
import { legalCommerceIsConfigured } from "@/lib/legal";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createCheckoutSession, getPaidPlan } from "@/lib/stripe";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type CustomerRow = { stripe_customer_id: string | null };

export async function POST(request: Request) {
  if (betaModeEnabled()) return NextResponse.redirect(new URL("/pricing?payment=beta", request.url), 303);

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth?next=/pricing", request.url), 303);

  const formData = await request.formData();
  const plan = getPaidPlan(String(formData.get("plan") ?? ""));
  const termsAccepted = formData.get("terms_accepted") === "yes";
  const immediateAccess = formData.get("immediate_access") === "yes";
  if (!plan) return NextResponse.redirect(new URL("/pricing?payment=configuration", request.url), 303);
  if (!termsAccepted || !immediateAccess) return NextResponse.redirect(new URL("/pricing?payment=consent", request.url), 303);

  const liveMode = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") ?? false;
  if (liveMode && !legalCommerceIsConfigured()) return NextResponse.redirect(new URL("/pricing?payment=legal", request.url), 303);

  const rate = await consumeRateLimit(request, { scope: "billing-checkout", subject: user.id, limit: 8, windowSeconds: 900 });
  if (!rate.allowed) return NextResponse.redirect(new URL("/pricing?payment=error", request.url), 303);

  try {
    const rows = await supabaseRest<CustomerRow[]>(`subscriptions?select=stripe_customer_id&user_id=eq.${user.id}&stripe_customer_id=not.is.null&order=created_at.desc&limit=1`);
    const consentAcceptedAt = new Date().toISOString();
    const session = await createCheckoutSession({
      plan,
      userId: user.id,
      email: user.email,
      existingCustomerId: rows[0]?.stripe_customer_id ?? null,
      origin: new URL(request.url).origin,
      consentAcceptedAt
    });
    if (!session.url) throw new Error("STRIPE_SESSION_WITHOUT_URL");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Unable to create Stripe Checkout session", error);
    return NextResponse.redirect(new URL("/pricing?payment=error", request.url), 303);
  }
}
