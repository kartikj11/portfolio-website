import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Kartik Jindal — DevOps / Cloud Infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph social card.
 *
 * Per the Next.js 16 `ImageResponse` docs, fonts must be `ttf` /
 * `otf` / `woff` — `woff2` is unsupported. The Google Fonts CSS
 * API serves `woff2` to modern user agents, which previously
 * crashed the response with `Unsupported OpenType signature wOF2`.
 * We now read the variable Fraunces TTF straight off disk via
 * Node's `readFile`. Default Node runtime — no Edge needed.
 *
 * Design is intentionally text-only: accent-color pullquote on
 * paper background, mirroring the site's type-first aesthetic.
 */
export default async function OpenGraphImage() {
  const fraunces = await readFile(
    join(process.cwd(), "assets/Fraunces.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#f5f1ea",
          fontFamily: "Fraunces",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "monospace",
            fontSize: 20,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#6b655c",
          }}
        >
          kartik jindal · devops / cloud infra
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{ fontSize: 108, color: "#131211" }}>
            Infrastructure
          </div>
          <div style={{ fontSize: 108, color: "#b83a25" }}>
            that doesn&rsquo;t wake
          </div>
          <div style={{ fontSize: 108, color: "#b83a25" }}>
            people up at 3am.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Fraunces",
          data: fraunces,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
