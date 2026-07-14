import { NextResponse } from "next/server";
import { getPaidPlan, stripeObjectId, verifyStripeWebhook } from "@/lib/stripe";
import { supabaseAdminRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function fulfillPaidCheckout(eventId: string, session: ReturnType<typeof verifyStripeWebhook>["data"]["object"]) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return;
  const userId = session.metadata?.user_id ?? session.client_reference_id ?? "";
  const plan = getPaidPlan(session.metadata?.plan_code ?? "");
  if (!userId || !plan) throw new Error("INVALID_CHECKOUT_METADATA");

  await supabaseAdminRest("rpc/activate_stripe_purchase", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_user_id: userId,
      p_plan_code: plan.code,
      p_days: plan.days,
      p_checkout_session_id: session.id,
      p_event_id: eventId,
      p_customer_id: stripeObjectId(session.customer) ?? "",
      p_payment_id: stripeObjectId(session.payment_intent) ?? "",
      p_amount_paid: Math.max(0, Number(session.amount_total ?? 0)),
      p_currency: session.currency ?? "eur"
    })
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  let event;
  try {
    event = verifyStripeWebhook(payload, request.headers.get("stripe-signature"));
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error);
    return NextResponse.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfillPaidCheckout(event.id, event.data.object);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Unable to fulfill Stripe Checkout", error);
    return NextResponse.json({ error: "Le paiement n’a pas pu activer l’accès." }, { status: 500 });
  }
}
