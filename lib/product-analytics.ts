export const PRODUCT_EVENT_NAMES = [
  "page_view",
  "demo_started",
  "demo_completed",
  "signup_intent",
  "pricing_viewed",
  "waitlist_joined",
  "feedback_sent"
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export function isProductEventName(value: unknown): value is ProductEventName {
  return typeof value === "string" && PRODUCT_EVENT_NAMES.includes(value as ProductEventName);
}

export function safeEventPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.trim().slice(0, 300);
  return path.startsWith("/") ? path : null;
}

export function safeEventProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 20);
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [rawKey, rawValue] of entries) {
    const key = rawKey.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
    if (!key) continue;
    if (typeof rawValue === "string") safe[key] = rawValue.slice(0, 200);
    else if (typeof rawValue === "number" && Number.isFinite(rawValue)) safe[key] = rawValue;
    else if (typeof rawValue === "boolean" || rawValue === null) safe[key] = rawValue;
  }
  return safe;
}
