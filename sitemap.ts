import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  return [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/crear", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/aviso-legal", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/contacto", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/accesibilidad", priority: 0.4, changeFrequency: "yearly" as const }
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    priority,
    changeFrequency
  }));
}
