import { NextResponse } from "next/server";
import { createCheckoutSession, getPaidPlan } from "@/lib/stripe";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type CustomerRow = { stripe_customer_id: string | null };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth?next=/pricing", request.url), 303);

  const formData = await request.formData();
  const plan = getPaidPlan(String(formData.get("plan") ?? ""));
  if (!plan) return NextResponse.redirect(new URL("/pricing?payment=configuration", request.url), 303);

  try {
    const rows = await supabaseRest<CustomerRow[]>(
      `subscriptions?select=stripe_customer_id&user_id=eq.${user.id}&stripe_customer_id=not.is.null&order=created_at.desc&limit=1`
    );
    const session = await createCheckoutSession({
      plan,
      userId: user.id,
      email: user.email,
      existingCustomerId: rows[0]?.stripe_customer_id ?? null,
      origin: new URL(request.url).origin
    });
    if (!session.url) throw new Error("STRIPE_SESSION_WITHOUT_URL");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Unable to create Stripe Checkout session", error);
    return NextResponse.redirect(new URL("/pricing?payment=error", request.url), 303);
  }
}
