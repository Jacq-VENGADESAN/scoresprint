import { NextResponse } from "next/server";
import { createCustomerPortalSession } from "@/lib/stripe";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type CustomerRow = { stripe_customer_id: string | null };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth?next=/account", request.url), 303);

  try {
    const rows = await supabaseRest<CustomerRow[]>(
      `subscriptions?select=stripe_customer_id&user_id=eq.${user.id}&stripe_customer_id=not.is.null&order=created_at.desc&limit=1`
    );
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return NextResponse.redirect(new URL("/account?portal=unavailable", request.url), 303);
    const portal = await createCustomerPortalSession(customerId, new URL(request.url).origin);
    return NextResponse.redirect(portal.url, 303);
  } catch (error) {
    console.error("Unable to create Stripe portal session", error);
    return NextResponse.redirect(new URL("/account?portal=error", request.url), 303);
  }
}
