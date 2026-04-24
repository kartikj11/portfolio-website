import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon — same italic-serif "K." wordmark as the
 * browser favicon, scaled up. Reads Fraunces italic from disk
 * (Satori only supports ttf/otf/woff, not woff2 — see icon.tsx).
 */
export default async function AppleIcon() {
  const fraunces = await readFile(
    join(process.cwd(), "assets/Fraunces-Italic.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f1ea",
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 500,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            fontSize: 168,
          }}
        >
          <span style={{ color: "#131211" }}>K</span>
          <span style={{ color: "#b83a25", marginLeft: -6 }}>.</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Fraunces",
          data: fraunces,
          style: "italic",
          weight: 500,
        },
      ],
    }
  );
}
