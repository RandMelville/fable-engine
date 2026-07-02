// Standalone player entry for the self-contained "file over app" export.
//
// This module is bundled by esbuild into a single IIFE (no external imports) and
// embedded in the self-contained .html the reader takes with them. It reads the
// `Story` from ``window.__STORY__`` (injected into the HTML) and mounts the
// player on #stage. Zero network requests — opens offline in any browser.

import type { Story } from "./engine";
import { Player } from "./player";

declare global {
  interface Window {
    __STORY__?: Story;
    __LABELS__?: { end?: string; playAgain?: string; thought?: string };
  }
}

const story = window.__STORY__;
const stage = document.getElementById("stage");
if (story && stage) {
  new Player(stage, story, { labels: window.__LABELS__ ?? {} });
}
