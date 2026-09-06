/**
 * Draws the site icon: the letter «ط» in El Messiri on a white square.
 * Writes src/app/icon.svg, src/app/apple-icon.png, public/icon-192.png, public/icon-512.png.
 *   node scripts/make-icon.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";
import sharp from "sharp";

import { readFileSync } from "node:fs";
const buf = readFileSync("assets/ElMessiri-500.ttf");
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const SIZE = 512;
const glyphSize = 340;
const path = font.getPath("ط", 0, 0, glyphSize);
const box = path.getBoundingBox();
const w = box.x2 - box.x1;
const h = box.y2 - box.y1;
const dx = (SIZE - w) / 2 - box.x1;
const dy = (SIZE - h) / 2 - box.y1;
const d = path.toPathData(2);

const svg = (bg, fg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${bg}"/>
  <g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})"><path d="${d}" fill="${fg}"/></g>
</svg>`;

writeFileSync("src/app/icon.svg", svg("#FFFFFF", "#111111"));
mkdirSync("public", { recursive: true });
const png = (size) => sharp(Buffer.from(svg("#FFFFFF", "#111111"))).resize(size, size).png();
await png(180).toFile("src/app/apple-icon.png");
await png(192).toFile("public/icon-192.png");
await png(512).toFile("public/icon-512.png");
console.log("icon written");
