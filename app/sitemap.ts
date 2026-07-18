import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund-policy`, changeFrequency: "yearly", priority: 0.3 }
  ];
}
