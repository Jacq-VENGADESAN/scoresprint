"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ProductEventName } from "@/lib/product-analytics";

export function trackProductEvent(
  event: ProductEventName,
  properties: Record<string, string | number | boolean | null> = {},
  path?: string
) {
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, path: path ?? window.location.pathname, properties }),
    keepalive: true
  }).catch(() => undefined);
}

export function ProductAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackProductEvent("page_view", {}, pathname);
    if (pathname === "/pricing") trackProductEvent("pricing_viewed", {}, pathname);
  }, [pathname]);

  return null;
}
