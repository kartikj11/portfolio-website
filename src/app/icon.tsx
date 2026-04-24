import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Browser favicon — italic Fraunces "K" with an accent period.
 *
 * Same wordmark logic as the rest of the site: display serif for
 * presence, single accent moment for restraint. Per the Next.js 16
 * `ImageResponse` docs, fonts must be `ttf` / `otf` / `woff` (no
 * `woff2`), so we read the variable Fraunces TTF straight off disk
 * via Node's `readFile`. Default Node runtime — Edge isn't required
 * and doesn't have `node:fs/promises`.
 */
export default async function Icon() {
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
            fontSize: 30,
          }}
        >
          <span style={{ color: "#131211" }}>K</span>
          <span style={{ color: "#b83a25", marginLeft: -1 }}>.</span>
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
