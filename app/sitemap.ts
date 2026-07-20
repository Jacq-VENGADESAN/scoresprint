import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/brand";
import { LESSONS } from "@/lib/lessons";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/demo`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${base}/lessons`, changeFrequency: "weekly", priority: 0.85 },
    ...LESSONS.map((lesson) => ({ url: `${base}/lessons/${lesson.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/feedback`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund-policy`, changeFrequency: "yearly", priority: 0.3 }
  ];
}
