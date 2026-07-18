import { createHmac, timingSafeEqual } from "node:crypto";

export type PaidPlanCode = "sprint_30" | "sprint_90";

export type PaidPlan = {
  code: PaidPlanCode;
  label: string;
  days: number;
  priceId: string;
};

type StripeCheckoutSession = {
  id: string;
  url?: string | null;
  client_reference_id?: string | null;
  customer?: string | { id: string } | null;
  customer_details?: { email?: string | null } | null;
  payment_intent?: string | { id: string } | null;
  payment_status?: "paid" | "unpaid" | "no_payment_required";
  status?: "open" | "complete" | "expired";
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
};

type StripePortalSession = { url: string };

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: StripeCheckoutSession };
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`MISSING_${name}`);
  return value;
}

export function stripeIsConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim()
    && process.env.STRIPE_WEBHOOK_SECRET?.trim()
    && process.env.STRIPE_PRICE_SPRINT_30?.trim()
    && process.env.STRIPE_PRICE_SPRINT_90?.trim()
    && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function getPaidPlan(code: string): PaidPlan | null {
  if (code === "sprint_30") {
    const priceId = process.env.STRIPE_PRICE_SPRINT_30?.trim();
    return priceId ? { code, label: "Sprint 30 jours", days: 30, priceId } : null;
  }
  if (code === "sprint_90") {
    const priceId = process.env.STRIPE_PRICE_SPRINT_90?.trim();
    return priceId ? { code, label: "Sprint 90 jours", days: 90, priceId } : null;
  }
  return null;
}

function formBody(values: Record<string, string | number | boolean | null | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params;
}

async function stripeRequest<T>(path: string, options: { method?: "GET" | "POST"; params?: URLSearchParams } = {}) {
  const method = options.method ?? "POST";
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${requiredEnv("STRIPE_SECRET_KEY")}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: method === "POST" ? options.params : undefined,
    cache: "no-store"
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`STRIPE_${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text) as T;
}

export async function createCheckoutSession(input: {
  plan: PaidPlan;
  userId: string;
  email?: string;
  existingCustomerId?: string | null;
  origin: string;
  consentAcceptedAt: string;
}) {
  const { plan, userId, email, existingCustomerId, origin, consentAcceptedAt } = input;
  const params = formBody({
    mode: "payment",
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?payment=cancelled`,
    client_reference_id: userId,
    "line_items[0][price]": plan.priceId,
    "line_items[0][quantity]": 1,
    "metadata[user_id]": userId,
    "metadata[plan_code]": plan.code,
    "metadata[access_days]": plan.days,
    "metadata[terms_accepted_at]": consentAcceptedAt,
    "metadata[immediate_access_requested]": "true",
    "payment_intent_data[metadata][user_id]": userId,
    "payment_intent_data[metadata][plan_code]": plan.code,
    "payment_intent_data[metadata][terms_accepted_at]": consentAcceptedAt,
    "payment_intent_data[metadata][immediate_access_requested]": "true",
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    "invoice_creation[enabled]": true,
    customer: existingCustomerId,
    customer_email: existingCustomerId ? undefined : email,
    customer_creation: existingCustomerId ? undefined : "always"
  });
  return stripeRequest<StripeCheckoutSession>("checkout/sessions", { params });
}

export async function retrieveCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(`checkout/sessions/${encodeURIComponent(sessionId)}`, { method: "GET" });
}

export async function createCustomerPortalSession(customerId: string, origin: string) {
  return stripeRequest<StripePortalSession>("billing_portal/sessions", {
    params: formBody({ customer: customerId, return_url: `${origin}/account` })
  });
}

export function stripeObjectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export function verifyStripeWebhook(payload: string, signatureHeader: string | null, toleranceSeconds = 300): StripeEvent {
  if (!signatureHeader) throw new Error("MISSING_STRIPE_SIGNATURE");
  const pieces = signatureHeader.split(",").map((piece) => piece.trim());
  const timestamp = pieces.find((piece) => piece.startsWith("t="))?.slice(2);
  const signatures = pieces.filter((piece) => piece.startsWith("v1=")).map((piece) => piece.slice(3));
  if (!timestamp || signatures.length === 0) throw new Error("INVALID_STRIPE_SIGNATURE_HEADER");

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) throw new Error("INVALID_STRIPE_SIGNATURE_TIMESTAMP");
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > toleranceSeconds) {
    throw new Error("EXPIRED_STRIPE_SIGNATURE");
  }

  const expected = createHmac("sha256", requiredEnv("STRIPE_WEBHOOK_SECRET"))
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const valid = signatures.some((signature) => {
    try {
      const actual = Buffer.from(signature, "hex");
      return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
    } catch {
      return false;
    }
  });
  if (!valid) throw new Error("INVALID_STRIPE_SIGNATURE");
  return JSON.parse(payload) as StripeEvent;
}
