/**
 * Resolved site URL for metadata, OG, sitemap, robots, and JSON-LD.
 *
 * Reads from `NEXT_PUBLIC_SITE_URL` set in Vercel project settings.
 * Fallback is the canonical custom domain — used only for local builds
 * and as a safety net if the env var is unset in production.
 *
 * Update the fallback once a custom domain is attached; until then,
 * the env var should be set to the assigned `*.vercel.app` URL after
 * the first deploy so OG cards and sitemaps resolve to the live host.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kartikjindal.dev";

export const SITE_TITLE = "Kartik Jindal — DevOps / Cloud Infrastructure";
export const SITE_DESCRIPTION =
  "Cloud infrastructure that doesn't wake people up at 3am.";
