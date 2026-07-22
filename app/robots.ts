import type { MetadataRoute } from "next";
import { betaModeEnabled } from "@/lib/beta";
import { appUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  if (betaModeEnabled()) {
    return {
      rules: { userAgent: "*", disallow: "/" }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/account", "/dashboard", "/history", "/practice", "/reading", "/listening", "/coach", "/mock-exam", "/errors", "/diagnostic"]
    },
    sitemap: `${appUrl()}/sitemap.xml`
  };
}
