// End-to-end reproduction of the headline claim: the exported self-contained
// .html plays offline and makes ZERO external network requests.
//
// Run: `npm run test:e2e`
//
// What it does (no framework, like test/selfcheck):
//   1. Regenerates the inlined player bundle and produces the export HTML for
//      `foxAndWolf` — without hardcoding — by bundling a tiny entry that imports
//      `exportHtml` and the example story, then writing the HTML to a temp file.
//   2. Launches headless chromium and blocks every non-local scheme, recording
//      any http/https/ws request as an "external request".
//   3. Loads the file, checks the canvas rendered, plays through to an ending,
//      and asserts zero external requests were made.

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, join } from "node:path";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "fable-e2e-"));
const htmlPath = join(dir, "story.html");

let ok = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    ok += 1;
  } else {
    fail += 1;
    console.error(`  x ${name}`);
  }
}

async function generateHtml() {
  // Make sure the inlined player runtime is fresh.
  execFileSync("npm", ["run", "build:standalone"], { cwd: root, stdio: "inherit" });

  // Bundle a tiny entry that produces the export HTML from the real source,
  // so nothing here is hardcoded.
  const entry = join(dir, "make-html.mjs");
  await build({
    stdin: {
      contents: `
        import { exportHtml } from "./src/export";
        import { foxAndWolf } from "./examples/fox-and-wolf";
        import { writeFileSync } from "node:fs";
        writeFileSync(process.argv[2], exportHtml(foxAndWolf));
      `,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    target: "es2020",
    outfile: entry,
  });
  execFileSync("node", [entry, htmlPath], { stdio: "inherit" });
}

async function main() {
  await generateHtml();

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const external = [];

  // Allow only local schemes; record + abort anything that would hit a network.
  await context.route("**", (route) => {
    const url = route.request().url();
    if (/^(file|data|blob):/i.test(url)) {
      route.continue();
    } else {
      external.push(url);
      route.abort();
    }
  });

  const page = await context.newPage();
  await page.goto(pathToFileURL(htmlPath).href);

  // (1) canvas rendered
  const canvas = page.locator("canvas.stage");
  await canvas.waitFor({ state: "attached", timeout: 5000 });
  const width = await canvas.evaluate((el) => el.width);
  check("canvas rendered (exists, width > 0)", width > 0);

  // (2) playable to an ending: play scenes (which animate in real time), clicking
  // a real choice button whenever one appears, until an `.ending` shows up.
  // Timeouts are generous because scenes animate over several seconds.
  const STEP_TIMEOUT = 20000;
  const ending = page.locator(".ending");
  const choice = page.locator(".choice-btn:not(.secondary)");
  let reachedEnding = false;
  for (let i = 0; i < 6; i += 1) {
    // Wait for the scene to settle into either an ending or a choice.
    try {
      await page
        .locator(".ending, .choice-btn:not(.secondary)")
        .first()
        .waitFor({ state: "visible", timeout: STEP_TIMEOUT });
    } catch {
      break; // nothing actionable appeared -> will fail below
    }
    if ((await ending.count()) > 0) {
      reachedEnding = true;
      break;
    }
    await choice.first().click();
  }
  check("story is playable to an ending", reachedEnding);

  // (3) zero external requests during the whole run
  if (external.length > 0) {
    console.error(`  external requests: ${external.join(", ")}`);
  }
  check("zero external network requests", external.length === 0);

  await browser.close();
}

main()
  .catch((err) => {
    fail += 1;
    console.error(err);
  })
  .finally(() => {
    rmSync(dir, { recursive: true, force: true });
    console.log(`\ne2e: ${ok} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  });
