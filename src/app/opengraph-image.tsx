import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kartik Jindal — DevOps / Cloud Infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph social card.
 *
 * The OG runtime is Edge, which doesn't have `next/font` resolution
 * available. Fetch Fraunces woff2 bytes directly at build time via the
 * Google Fonts CSS API — parse the @font-face src URL from the CSS
 * response, fetch the font binary, hand it to ImageResponse.
 *
 * Design is intentionally text-only: accent-color pullquote on paper
 * background, mirroring the site's type-first aesthetic.
 */
async function loadFraunces(): Promise<ArrayBuffer> {
  const cssResponse = await fetch(
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&display=swap",
    {
      headers: {
        // Default UA gets woff format; Chrome UA gets woff2 (much smaller).
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }
  );
  const css = await cssResponse.text();
  const urlMatch = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  if (!urlMatch) throw new Error("Could not parse Fraunces woff2 URL");
  const fontResponse = await fetch(urlMatch[1]);
  return fontResponse.arrayBuffer();
}

export default async function OpenGraphImage() {
  const fraunces = await loadFraunces();

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
