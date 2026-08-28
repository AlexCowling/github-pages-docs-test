/**
 * Watches the token source and regenerates whenever it changes.
 *
 * Without this, `npm run dev` builds tokens once and then watches only SCSS and
 * TSX, so editing src/tokens produces no visible output at all: the generated
 * partial never changes, so dart-sass has nothing to react to. That is a silent
 * failure, which is the worst kind in a dev loop.
 *
 * Assumes tokens have already been built once, which `npm run dev` guarantees
 * by running build:tokens before starting the watchers.
 */

import { spawn } from "node:child_process";
import { watch } from "node:fs";

const SOURCE = "src/tokens";
const DEBOUNCE_MS = 120;

let timer = null;
let running = false;
let queued = false;

function build() {
  if (running) {
    // An edit landed mid-build. Run once more when this one finishes rather
    // than starting a second writer over the same output files.
    queued = true;
    return;
  }
  running = true;

  const child = spawn("node", ["scripts/build-tokens.mjs"], { stdio: "inherit" });

  child.on("close", (code) => {
    running = false;
    if (code !== 0) console.error(`tokens: build failed with code ${code}`);
    if (queued) {
      queued = false;
      build();
    }
  });
}

watch(SOURCE, { recursive: true }, (_event, filename) => {
  if (filename && !filename.endsWith(".ts")) return;
  // Editors fire several events per save.
  clearTimeout(timer);
  timer = setTimeout(build, DEBOUNCE_MS);
});

console.log(`tokens: watching ${SOURCE}`);
