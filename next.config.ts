import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk"],

  // docs/standards/*.md leses med fs på runtime. Next sporer bare filer den ser
  // i statiske require-kall, så uten dette havner de ikke i serverless-bunten på
  // Vercel — og specen blir generert uten MLIT-standardene.
  outputFileTracingIncludes: {
    "/api/kickstart/stream": ["./docs/standards/**"],
    "/api/kickstart/health": ["./docs/standards/**"],
    "/api/leadradar-handoff": ["./docs/standards/**"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
