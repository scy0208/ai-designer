#!/usr/bin/env node
/**
 * render.mjs — Convert an HTML flyer to PNG and/or PDF using Playwright.
 *
 * Usage:
 *   node render.mjs <input.html> [options]
 *
 * Options:
 *   --png              Output PNG (default: on)
 *   --pdf              Output PDF (default: on)
 *   --no-png           Skip PNG
 *   --no-pdf           Skip PDF
 *   -o, --output       Output base name (default: input filename without ext)
 *   -w, --width        Viewport width  (default: 2550)
 *   -h, --height       Viewport height (default: 3300)
 *   --scale            Device scale factor (default: 1)
 *   --wait             Extra wait ms after page load (default: 1000)
 *
 * Examples:
 *   node render.mjs flyer-tailwind.html
 *   node render.mjs flyer-tailwind.html --no-pdf -o my-flyer
 *   node render.mjs flyer-tailwind.html --width 1080 --height 1920 --scale 2
 */

import { chromium } from "playwright";
import { resolve, basename, dirname } from "path";
import { existsSync } from "fs";

// ── Parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function flag(name) {
  const i = args.indexOf(name);
  if (i !== -1) { args.splice(i, 1); return true; }
  return false;
}

function option(short, long, fallback) {
  for (const name of [short, long].filter(Boolean)) {
    const i = args.indexOf(name);
    if (i !== -1 && i + 1 < args.length) {
      const val = args[i + 1];
      args.splice(i, 2);
      return val;
    }
  }
  return fallback;
}

const noPng = flag("--no-png");
const noPdf = flag("--no-pdf");
const wantPng = !noPng && (flag("--png") || true);
const wantPdf = !noPdf && (flag("--pdf") || true);
const width = parseInt(option("-w", "--width", "2550"), 10);
const height = parseInt(option("-h", "--height", "3300"), 10);
const scale = parseFloat(option(null, "--scale", "1"));
const wait = parseInt(option(null, "--wait", "1000"), 10);
const outputBase = option("-o", "--output", null);

// Input file is the first remaining positional arg
const inputFile = args[0];

if (!inputFile) {
  console.error("Usage: node render.mjs <input.html> [options]");
  console.error("Run with no arguments to see help.");
  process.exit(1);
}

const inputPath = resolve(inputFile);
if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const dir = dirname(inputPath);
const base = outputBase || basename(inputPath, ".html");
const pngPath = resolve(dir, `${base}.png`);
const pdfPath = resolve(dir, `${base}.pdf`);

// ── Render ──────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: scale,
});

const fileUrl = `file://${inputPath}`;
console.log(`Loading ${fileUrl} (${width}x${height} @${scale}x) ...`);
await page.goto(fileUrl, { waitUntil: "networkidle" });

if (wait > 0) {
  await new Promise((r) => setTimeout(r, wait));
}

const results = [];

if (wantPng) {
  await page.screenshot({ path: pngPath, fullPage: false });
  results.push(`PNG → ${pngPath}`);
}

if (wantPdf) {
  await page.pdf({
    path: pdfPath,
    width: `${width}px`,
    height: `${height}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  results.push(`PDF → ${pdfPath}`);
}

await browser.close();

for (const r of results) console.log(r);
console.log("Done.");
