import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/admin", "/account", "/preview", "/api", "/auth", "/styleguide"] },
    sitemap: "https://toomar.vercel.app/sitemap.xml",
  };
}
