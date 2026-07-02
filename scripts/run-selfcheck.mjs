// Bundles test/selfcheck.ts into a temp .mjs and runs it with node.
// Keeps the test headless and framework-free (exits non-zero on failure).

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "fable-selfcheck-"));
const outfile = join(dir, "selfcheck.mjs");

try {
  await build({
    entryPoints: [resolve(root, "test/selfcheck.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "es2020",
    outfile,
  });
  execFileSync("node", [outfile], { stdio: "inherit" });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
