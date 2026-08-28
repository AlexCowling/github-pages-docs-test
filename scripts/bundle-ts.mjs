import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Bundles a TypeScript entry point to a temporary ESM file and imports it, so
 * build scripts and tests run against the same source the components compile
 * against. Node type stripping is not used because the modules import each
 * other without file extensions.
 */
export async function bundleModule(entryPoint) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ds-bundle-"));
  const outfile = path.join(dir, "module.mjs");

  await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    platform: "neutral",
    logLevel: "warning",
    outfile,
  });

  const module = await import(pathToFileURL(outfile).href);
  await rm(dir, { recursive: true, force: true }).catch(() => {});
  return module;
}

export const loadTokens = () => bundleModule("src/tokens/index.ts");
