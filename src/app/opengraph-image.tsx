import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "طومار";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The link preview for the homepage: the wordmark and one line, on white. */
export default async function Image() {
  const font = await readFile(path.join(process.cwd(), "assets", "ElMessiri-500.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", color: "#111111", fontFamily: "El Messiri", direction: "rtl" }}>
        <div style={{ fontSize: 160, lineHeight: 1 }}>طومار</div>
        <div style={{ fontSize: 40, marginTop: 28, color: "#55555C" }}>لدينا ما نحكيه.</div>
        <div style={{ fontSize: 22, marginTop: 40, letterSpacing: 8, color: "#7A7A82", fontFamily: "sans-serif" }}>TOOMAR</div>
      </div>
    ),
    { ...size, fonts: [{ name: "El Messiri", data: font, weight: 500, style: "normal" }] },
  );
}
