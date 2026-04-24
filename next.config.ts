import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// 'unsafe-eval' is needed in development only: Next.js 16's Turbopack
// dev server uses `eval()` for HMR, and React's dev build uses it to
// reconstruct call stacks across realms. React's production build
// never uses eval(), so we keep the strict policy in prod.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  isDev ? "'unsafe-eval'" : null,
  "https://vercel.live",
  "https://*.vercel-scripts.com",
]
  .filter(Boolean)
  .join(" ");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' is required: Next.js 16 injects inline
              // hydration scripts. Nonce-based CSP needs middleware —
              // not worth it for a portfolio with no user input.
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
