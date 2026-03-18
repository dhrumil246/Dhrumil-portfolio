import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Performance ───
  reactStrictMode: true,
  poweredByHeader: false,

  // ─── Image optimization ───
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // ─── Headers for security & caching ───
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/resume.pdf",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200",
          },
        ],
      },
    ];
  },
};

export default nextConfig;