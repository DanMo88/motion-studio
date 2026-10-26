#!/usr/bin/env node
/**
 * Render a video from a spec, headlessly.
 *
 *   npm run make -- --spec specs/showcase.json --out out/showcase.mp4
 *   npm run make -- --spec specs/simple.txt
 *   npm run make -- --composition PhysicsDrop --props '{"items":["a","b"]}'
 */
import { parseArgs } from "node:util";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { loadSpec } from "./spec.mjs";

const { values } = parseArgs({
  options: {
    spec: { type: "string" },
    composition: { type: "string" },
    props: { type: "string" },
    out: { type: "string" },
    concurrency: { type: "string" },
    gl: { type: "string", default: "swangle" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help || (!values.spec && !values.composition)) {
  console.log(`Usage:
  npm run make -- --spec <file.json|file.txt> [--out out/video.mp4]
  npm run make -- --composition <Id> [--props '<json>'] [--out ...]
Options: --concurrency <n>  --gl <swangle (default, CPU)|angle|egl|vulkan>`);
  process.exit(values.help ? 0 : 1);
}

const compositionId = values.spec ? "Story" : values.composition;
let inputProps = {};
if (values.spec) inputProps = loadSpec(values.spec);
else if (values.props) inputProps = JSON.parse(values.props);

if (!existsSync("public/demo-beat.mp3")) {
  await import("./generate-assets.mjs");
}

const name = values.spec ? path.basename(values.spec).replace(/\.\w+$/, "") : compositionId;
const outputLocation = values.out ?? `out/${name}.mp4`;
mkdirSync(path.dirname(outputLocation), { recursive: true });

console.log(`Bundling...`);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: values.gl };
const composition = await selectComposition({ serveUrl, id: compositionId, inputProps, chromiumOptions });
console.log(`Rendering ${compositionId}: ${composition.width}x${composition.height} @${composition.fps}fps, ${composition.durationInFrames} frames`);

let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation,
  inputProps,
  chromiumOptions,
  concurrency: values.concurrency ? Number(values.concurrency) : null,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct % 10 === 0 && pct !== last) {
      last = pct;
      console.log(`  ${pct}%`);
    }
  },
});
console.log(`✔ ${outputLocation}`);
